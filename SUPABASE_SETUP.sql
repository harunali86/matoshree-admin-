-- SAFE MIGRATION SCRIPT (Wont delete existing data)
-- Runs safely on top of existing database

-- 1. Enable Extensions
create extension if not exists "uuid-ossp";

-- 2. Storage Setup (Images)
insert into storage.buckets (id, name, public) 
values ('images', 'images', true)
on conflict (id) do nothing;

-- 3. Create Tables (Only if they don't exist)

-- Admin Sessions (for secure login)
create table if not exists admin_sessions (
    id text primary key,
    token text not null,
    email text not null,
    created_at timestamptz default now(),
    expires_at timestamptz not null
);

-- Hero Slides (for Home Screen)
create table if not exists hero_slides (
    id uuid default uuid_generate_v4() primary key,
    title text,
    subtitle text,
    image_url text not null,
    product_id uuid references products(id) on delete set null,
    is_active boolean default true,
    display_order integer default 0,
    created_at timestamptz default now()
);

-- Banners (Ads)
create table if not exists banners (
    id uuid default uuid_generate_v4() primary key,
    title text,
    subtitle text,
    image_url text not null,
    link_url text,
    is_active boolean default true,
    display_order integer default 0,
    created_at timestamptz default now()
);

-- Brands (if missing)
create table if not exists brands (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    created_at timestamptz default now()
);

-- Collections (if missing)
create table if not exists collections (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    created_at timestamptz default now()
);

-- 4. Add Columns (Safely - keeps existing data)

-- Add Logo to Brands
alter table brands add column if not exists logo_url text;

-- Add Image/Active columns to Collections
alter table collections add column if not exists image_url text;
alter table collections add column if not exists is_active boolean default true;
alter table collections add column if not exists display_order integer default 0;

-- 5. Security & Policies (Reset policies to ensure correctness)

-- Enable RLS
alter table hero_slides enable row level security;
alter table banners enable row level security;
alter table brands enable row level security;
alter table collections enable row level security;

-- Drop old policies to prevent duplicates
drop policy if exists "Enable read access for all users" on hero_slides;
drop policy if exists "Enable read access for all users" on banners;
drop policy if exists "Enable read access for all users" on brands;
drop policy if exists "Enable read access for all users" on collections;
drop policy if exists "Enable read access for all users" on storage.objects;

-- Create fresh read policies
create policy "Enable read access for all users" on hero_slides for select using (true);
create policy "Enable read access for all users" on banners for select using (true);
create policy "Enable read access for all users" on brands for select using (true);
create policy "Enable read access for all users" on collections for select using (true);
create policy "Enable read access for all users" on storage.objects for select using (bucket_id = 'images');

-- Note: We use Service Role Key for Admin Writes, so no Write Policies needed for public.

-- 6. Done!

-- 7. Notification Support
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  created_at timestamptz default now()
);
alter table profiles add column if not exists push_token text;

-- Profiles Policies
drop policy if exists "Enable read access for all users" on profiles;
create policy "Enable read access for all users" on profiles for select using (true);

drop policy if exists "Enable insert for authenticated users only" on profiles;
create policy "Enable insert for authenticated users only" on profiles for insert with check (auth.uid() = id);

drop policy if exists "Enable update for users based on email" on profiles;
create policy "Enable update for users based on email" on profiles for update using (auth.uid() = id);

-- 8. Advanced Stock & Invoice System

-- Ensure Products has Stock
alter table products add column if not exists stock integer default 0;

-- Ensure Orders Table (and update)
create table if not exists orders (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users,
    address_id uuid, -- Link to address
    total_amount numeric,
    status text default 'Pending',
    payment_status text default 'Pending',
    payment_method text,
    created_at timestamptz default now()
);
alter table orders add column if not exists invoice_number text;
alter table orders add column if not exists payment_method text;

-- Create Order Items if not exists
create table if not exists order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references orders(id) on delete cascade,
    product_id uuid references products(id),
    quantity integer,
    price numeric,
    size text,
    created_at timestamptz default now()
);

-- Create Sequence for Invoices (e.g. from 1000)
create sequence if not exists invoice_seq start 1000;

-- RPC: Place Order Transactionally (Handles Stock & Invoice)
create or replace function place_order(
  p_user_id uuid,
  p_address_id uuid,
  p_total_amount numeric,
  p_items jsonb, -- Array of objects
  p_payment_method text
) returns jsonb as $$
declare
  v_order_id uuid;
  v_invoice_number text;
  v_item jsonb;
  v_product_stock int;
  v_product_name text;
begin
  -- 1. Generate Invoice Number (e.g. MATO-2024-1001)
  v_invoice_number := 'MATO-' || to_char(now(), 'YYYY') || '-' || nextval('invoice_seq');

  -- 2. Create Order
  insert into orders (user_id, address_id, total_amount, status, payment_status, payment_method, invoice_number)
  values (p_user_id, p_address_id, p_total_amount, 'Pending', 'Pending', p_payment_method, v_invoice_number)
  returning id into v_order_id;

  -- 3. Process Items
  for v_item in select * from jsonb_array_elements(p_items) loop
    -- Check Stock
    select stock, name into v_product_stock, v_product_name from products where id = (v_item->>'product_id')::uuid;
    
    if v_product_stock is null or v_product_stock < (v_item->>'quantity')::int then
      raise exception 'Issued Stock: Product % is out of stock (Available: %)', v_product_name, coalesce(v_product_stock, 0);
    end if;

    -- Deduct Stock
    update products 
    set stock = stock - (v_item->>'quantity')::int
    where id = (v_item->>'product_id')::uuid;

    -- Insert Order Item
    insert into order_items (order_id, product_id, quantity, price, size)
    values (
      v_order_id, 
      (v_item->>'product_id')::uuid, 
      (v_item->>'quantity')::int, 
      (v_item->>'price')::numeric,
      (v_item->>'size')
    );
  end loop;

  return jsonb_build_object('success', true, 'order_id', v_order_id, 'invoice_number', v_invoice_number);
exception when others then
  return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$ language plpgsql security definer;

-- RPC: Cancel Order (Restock)
create or replace function cancel_order(p_order_id uuid) returns void as $$
declare
  v_item record;
begin
  -- Update Status
  update orders set status = 'Cancelled' where id = p_order_id;
  
  -- Restore Stock
  for v_item in select product_id, quantity from order_items where order_id = p_order_id loop
      update products set stock = stock + v_item.quantity where id = v_item.product_id;
  end loop;
end;
$$ language plpgsql security definer;

