-- Insert 2 Generic Slides to reach Total 4
insert into hero_slides (title, subtitle, image_url, cta_text, is_active, display_order)
values 
('Summer Collection 2026', 'Fresh Arrivals', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=90', 'Shop Summer', true, 1),
('Flash Sale 50% Off', 'Limited Time Only', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&q=90', 'Grab Deal', true, 2);

-- Update existing ones order
update hero_slides set display_order = 3 where title ilike '%Urban X%';
update hero_slides set display_order = 4 where title ilike '%Royal%';
