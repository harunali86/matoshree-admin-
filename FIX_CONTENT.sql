-- 1. Fix Slide Count (Add 2 more to make 4)
insert into hero_slides (title, subtitle, image_url, cta_text, is_active, display_order)
values 
('Summer Collection 2026', 'Fresh Arrivals', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=90', 'Shop Summer', true, 1),
('Flash Sale 50% Off', 'Limited Time Only', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&q=90', 'Grab Deal', true, 2);

-- Update existing ones order (The Premium Ones)
update hero_slides set display_order = 3 where title ilike '%Urban X%';
update hero_slides set display_order = 4 where title ilike '%Royal%';

-- 2. Fix Brand Logos (Update existing rows)
update brands set logo_url = 'https://cdn.iconscout.com/icon/free/png-256/free-nike-1-202653.png' where name ilike 'Nike';
update brands set logo_url = 'https://cdn.iconscout.com/icon/free/png-256/free-adidas-3-202636.png' where name ilike 'Adidas';
update brands set logo_url = 'https://cdn.iconscout.com/icon/free/png-256/free-puma-2-202652.png' where name ilike 'Puma';
update brands set logo_url = 'https://cdn.iconscout.com/icon/free/png-256/free-reebok-2-202654.png' where name ilike 'Reebok';
update brands set logo_url = 'https://cdn.iconscout.com/icon/free/png-256/free-new-balance-202649.png' where name ilike 'New Balance';
update brands set logo_url = 'https://cdn.iconscout.com/icon/free/png-256/free-converse-202641.png' where name ilike 'Converse';
update brands set logo_url = 'https://cdn.iconscout.com/icon/free/png-256/free-vans-202660.png' where name ilike 'Vans';
update brands set logo_url = 'https://cdn.iconscout.com/icon/free/png-256/free-fila-202644.png' where name ilike 'Fila';

-- Fallback for any others
update brands set logo_url = 'https://cdn-icons-png.flaticon.com/512/732/732200.png' where logo_url is null;
