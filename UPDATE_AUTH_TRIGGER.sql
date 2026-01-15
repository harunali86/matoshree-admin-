create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    email,
    full_name, 
    phone,
    role,
    business_name,
    gst_number,
    is_verified
  )
  values (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'retail'),
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'gst_number',
    (case when (new.raw_user_meta_data->>'role' = 'wholesale') then false else true end) 
    -- Retailers auto-verified (true), Wholesalers pending (false). 
    -- Note: is_verified default in DB was false, but let's be explicit logic here.
    -- Actually, earlier I set default false. Retailers probably don't need verification logic 
    -- checking in the app, but consisteny helps. 
    -- Let's stick to: Retailers = Verified (effectively), Wholesalers = Pending.
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = excluded.role,
    business_name = excluded.business_name,
    gst_number = excluded.gst_number;
  return new;
end;
$$ language plpgsql security definer;
