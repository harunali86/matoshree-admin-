-- 1. Silence "RLS Enabled No Policy"
drop policy if exists "Deny Public Access" on admin_sessions;
create policy "Deny Public Access" on admin_sessions for all using (false);

-- 2. Fix Function Search Paths (Automated Loop for ALL public functions)
do $$
declare
  r record;
begin
  for r in 
    select p.proname, p.oid::regprocedure as sig
    from pg_proc p 
    join pg_namespace n on p.pronamespace = n.oid 
    where n.nspname = 'public'
  loop
    -- Execute safely (handling potential overloading by signature)
    execute format('alter function %s set search_path = public', r.sig);
  end loop;
end $$;

-- 3. Additional Indexes (Catching missing ones)
create index if not exists idx_products_category_id on products(category_id);

-- 4. Fix "RLS Policy Always True" for Profiles (if missed)
drop policy if exists "Public Read" on profiles; 
-- Profiles usually strictly private, but if we need public (e.g. searching users? No).
-- Let's stick to strict:
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);

-- 5. Fix "Multiple Permissive Policies" on banners?
-- We have "Public Read" (via FIX_WARNINGS.sql).
-- Ensure no duplications.
drop policy if exists "Enable read access for all users" on banners; 
-- (Our FIX_WARNINGS created "Public Read". OPTIMIZATIONS created "Public Read". SUPABASE_SETUP created "Enable read...")
-- I will drop "Enable read access for all users" from all tables to clean up duplicates.

do $$ begin
  drop policy if exists "Enable read access for all users" on products;
  drop policy if exists "Enable read access for all users" on categories;
  drop policy if exists "Enable read access for all users" on brands;
  drop policy if exists "Enable read access for all users" on collections;
  drop policy if exists "Enable read access for all users" on hero_slides;
  drop policy if exists "Enable read access for all users" on banners;
  drop policy if exists "Enable read access for all users" on coupons;
  drop policy if exists "Enable read access for all users" on blogs;
  drop policy if exists "Enable read access for all users" on storage.objects; -- Keep this one? No, optimize it.
end $$;

-- Re-create Storage Policy cleanly
drop policy if exists "Public Read Images" on storage.objects;
create policy "Public Read Images" on storage.objects for select using (bucket_id = 'images' and auth.role() in ('anon', 'authenticated', 'service_role'));
