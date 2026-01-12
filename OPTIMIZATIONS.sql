-- 0. Schema Fixes (Ensure columns exist before indexing)
alter table orders add column if not exists address_id uuid references addresses(id);
alter table products add column if not exists category_id uuid references categories(id);

-- 1. Security: Enable RLS on ALL tables
alter table if exists products enable row level security;
alter table if exists categories enable row level security;
alter table if exists brands enable row level security;
alter table if exists collections enable row level security;
alter table if exists hero_slides enable row level security;
alter table if exists banners enable row level security;
alter table if exists coupons enable row level security;
alter table if exists blogs enable row level security;
alter table if exists reviews enable row level security;
alter table if exists wishlist enable row level security;
alter table if exists addresses enable row level security;
alter table if exists orders enable row level security;
alter table if exists order_items enable row level security;
alter table if exists admin_sessions enable row level security;

-- 2. Security: Policies (Public Read)
do $$ begin
  -- Products
  drop policy if exists "Public Read" on products;
  create policy "Public Read" on products for select using (true);
  
  -- Categories
  drop policy if exists "Public Read" on categories;
  create policy "Public Read" on categories for select using (true);

  -- Brands
  drop policy if exists "Public Read" on brands;
  create policy "Public Read" on brands for select using (true);

  -- Collections
  drop policy if exists "Public Read" on collections;
  create policy "Public Read" on collections for select using (true);

  -- Hero Slides
  drop policy if exists "Public Read" on hero_slides;
  create policy "Public Read" on hero_slides for select using (true);

  -- Banners
  drop policy if exists "Public Read" on banners;
  create policy "Public Read" on banners for select using (true);

  -- Coupons
  drop policy if exists "Public Read" on coupons;
  create policy "Public Read" on coupons for select using (true);

  -- Blogs
  drop policy if exists "Public Read" on blogs;
  create policy "Public Read" on blogs for select using (true);
end $$;

-- 3. Security: Authenticated User Policies
do $$ begin
  -- Addresses
  drop policy if exists "Users can manage own addresses" on addresses;
  create policy "Users can manage own addresses" on addresses for all using (auth.uid() = user_id);

  -- Orders
  drop policy if exists "Users can view own orders" on orders;
  create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);
  
  drop policy if exists "Users can insert own orders" on orders;
  create policy "Users can insert own orders" on orders for insert with check (auth.uid() = user_id);

  -- Order Items
  drop policy if exists "Users can view own order items" on order_items;
  create policy "Users can view own order items" on order_items for select using (
    exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );
  
  drop policy if exists "Users can insert own order items" on order_items;
  create policy "Users can insert own order items" on order_items for insert with check (
    exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );

  -- Wishlist
  drop policy if exists "Users can manage own wishlist" on wishlist;
  create policy "Users can manage own wishlist" on wishlist for all using (auth.uid() = user_id);

  -- Reviews
  drop policy if exists "Public Read Reviews" on reviews;
  create policy "Public Read Reviews" on reviews for select using (true);
  
  drop policy if exists "Users manage own reviews" on reviews;
  create policy "Users manage own reviews" on reviews for insert with check (auth.uid() = user_id);
end $$;

-- 4. Performance: Indexes
create index if not exists idx_hero_slides_product on hero_slides(product_id);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_order_items_product on order_items(product_id);
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_address on orders(address_id);
create index if not exists idx_wishlist_user on wishlist(user_id);
create index if not exists idx_wishlist_product on wishlist(product_id);
create index if not exists idx_reviews_user on reviews(user_id);
create index if not exists idx_reviews_product on reviews(product_id);
create index if not exists idx_addresses_user on addresses(user_id);
