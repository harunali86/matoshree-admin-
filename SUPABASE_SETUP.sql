-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Create Storage Bucket for Images
-- Note: You should enable "Public" access for this bucket in Supabase Dashboard > Storage
insert into storage.buckets (id, name, public) 
values ('images', 'images', true)
on conflict (id) do nothing;

-- 2. Create Admin Sessions Table (for Robust Auth)
create table if not exists admin_sessions (
    id text primary key, -- 'main' for single admin, or uuid for multi
    token text not null,
    email text not null,
    created_at timestamptz default now(),
    expires_at timestamptz not null
);

-- 3. Create Hero Slides Table (for App Home Screen)
create table if not exists hero_slides (
    id uuid default uuid_generate_v4() primary key,
    title text,
    subtitle text,
    image_url text not null,
    product_id uuid references products(id) on delete set null, -- Link to product
    is_active boolean default true,
    display_order integer default 0,
    created_at timestamptz default now()
);

-- 4. Create Banners Table (if not already exists)
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

-- RLS Policies (Row Level Security)
-- Enable RLS
alter table hero_slides enable row level security;
alter table banners enable row level security;

-- Admin Policy: Allow full access to authenticated service role (and our admin)
-- Since we use Service Role Key in API, we bypass RLS automatically.
-- But for Client Side access (if any), we can add policies:

create policy "Enable read access for all users" on hero_slides for select using (true);
create policy "Enable read access for all users" on banners for select using (true);
create policy "Enable read access for all users" on storage.objects for select using (bucket_id = 'images');

-- Note: Write access is handled via Server Actions using Service Role Key.
