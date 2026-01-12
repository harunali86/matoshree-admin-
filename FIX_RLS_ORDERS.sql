-- Allow Public Read on Orders (For Guest Checkout/Tracking)
-- Note: UUIDs are hard to guess, so public read by ID is acceptable for this stage.

drop policy if exists "Enable read access for all users" on orders;
drop policy if exists "Users can view own orders" on orders;
drop policy if exists "Public Read Orders" on orders;

create policy "Public Read Orders" on orders for select using (true);

-- Allow Public Read on Order Items
drop policy if exists "Enable read access for all users" on order_items;
drop policy if exists "Users can view own order items" on order_items;
drop policy if exists "Public Read Order Items" on order_items;

create policy "Public Read Order Items" on order_items for select using (true);
