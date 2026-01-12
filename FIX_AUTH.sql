-- 1. Ensure Profile Insert Policy exists (Fixes Email Signup/Login issues if profile creation fails)
drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- 2. Create Trigger to Auto-Create Profile on Signup (Robustness)
-- This ensures that when a user Signs Up, their profile row is AUTOMATICALY created.
-- This prevents "Profile not found" errors during login/notification usage.

create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing; -- Prevent errors if it already exists
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Ensure Auth can read profiles (Double check)
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
