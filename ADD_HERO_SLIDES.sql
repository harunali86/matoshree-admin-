-- 0. Schema Update: Add CTA Text
alter table hero_slides add column if not exists cta_text text default 'Shop Now';
alter table hero_slides add column if not exists product_id uuid references products(id);

-- 1. Insert Premium Product 1 (Sneaker) & Slide
with new_prod_1 as (
  insert into products (name, description, price, sale_price, stock, thumbnail, images, category_id, is_new_arrival, is_bestseller)
  select
    'Urban X Streetwear', 
    'A masterpiece of modern design. Premium materials, unmatched comfort, and a bold aesthetic that turns heads. The ultimate limited edition sneaker for the urban explorer.',
    12999, 9999, 50,
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80',
    array['https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80'],
    id,
    true, true
  from categories where name ilike '%Running%' or name ilike '%Sneakers%' limit 1
  returning id
)
insert into hero_slides (title, subtitle, image_url, product_id, cta_text, is_active)
select 
  'Urban X Collection', 
  'Redefining Street Style', 
  'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=90',
  id,
  'Shop Exclusive',
  true
from new_prod_1;

-- 2. Insert Premium Product 2 (Formal) & Slide
with new_prod_2 as (
  insert into products (name, description, price, sale_price, stock, thumbnail, images, category_id, is_new_arrival, is_bestseller)
  select
    'Royal Italian Loafer', 
    'Handcrafted from the finest Italian leather. These loafers offer sophisticated elegance for the modern gentleman. Perfect for boardrooms and black-tie events.',
    8499, 6999, 30,
    'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&q=80',
    array['https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&q=80'],
    id,
    true, true
  from categories where name ilike '%Formal%' or name ilike '%Casual%' limit 1
  returning id
)
insert into hero_slides (title, subtitle, image_url, product_id, cta_text, is_active)
select 
  'The Royal Series', 
  'Timeless Elegance', 
  'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=1200&q=90',
  id,
  'Discover Luxury',
  true
from new_prod_2;
