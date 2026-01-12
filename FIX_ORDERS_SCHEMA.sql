-- Ensure all columns exist in orders table
alter table orders add column if not exists total_amount numeric;
alter table orders add column if not exists status text default 'Pending';
alter table orders add column if not exists payment_status text default 'Pending';
alter table orders add column if not exists payment_method text default 'COD';
alter table orders add column if not exists invoice_number text;
alter table orders add column if not exists address_id uuid references addresses(id);
alter table orders add column if not exists user_id uuid references auth.users;

-- Ensure sequence exists
create sequence if not exists invoice_seq start 1000;

-- Ensure Place Order RPC searches public path (already done but safe to repeat)
alter function place_order set search_path = public;
