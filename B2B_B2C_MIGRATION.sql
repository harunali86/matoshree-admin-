-- 1. Update Profiles for User Roles
alter table profiles 
add column if not exists role text default 'retail' check (role in ('retail', 'wholesale')),
add column if not exists business_name text,
add column if not exists gst_number text,
add column if not exists is_verified boolean default false;

-- 2. Update Products for Wholesale Pricing
alter table products 
add column if not exists price_wholesale numeric,
add column if not exists moq integer default 1;

-- 3. Security: Ensure RLS policies cover new fields
-- (Existing policies usually cover "all columns" unless restricted effectively, 
-- but we should ensure 'retail' users can't READ 'price_wholesale' if we want strict security.
-- However, for simplicity in this phase, we will filter on frontend/backend API. 
-- Strict RLS for columns requires splitting tables or complex views, which might overcomplicate now.
-- We will rely on the "Smart Layer" logic for now.)
