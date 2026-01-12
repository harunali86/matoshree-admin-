-- 1. Fix Brand Logos (Using Reliable Wikimedia PNGs)
-- Note: React Native Image often prefers PNG over SVG, ensuring standard format.

update brands set logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/800px-Logo_NIKE.svg.png' where name ilike 'Nike';
update brands set logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/800px-Adidas_Logo.svg.png' where name ilike 'Adidas';
update brands set logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Puma_logo.svg/800px-Puma_logo.svg.png' where name ilike 'Puma';
update brands set logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Reebok_2019_logo.svg/800px-Reebok_2019_logo.svg.png' where name ilike 'Reebok';
update brands set logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/New_Balance_logo.svg/800px-New_Balance_logo.svg.png' where name ilike 'New Balance';
update brands set logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Converse_logo.svg/800px-Converse_logo.svg.png' where name ilike 'Converse';
update brands set logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Vans-logo.svg/800px-Vans-logo.svg.png' where name ilike 'Vans';
update brands set logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Fila_logo.svg/800px-Fila_logo.svg.png' where name ilike 'Fila';

-- 2. Fix Broken Product Images (Adidas & Reebok)
-- Adidas Product (any product with Adidas in Name)
update products 
set thumbnail = 'https://images.unsplash.com/photo-1518002171953-a080ee32280d?w=800&q=80',
    images = array['https://images.unsplash.com/photo-1518002171953-a080ee32280d?w=800&q=80', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800']
where name ilike '%Adidas%';

-- Reebok Club C 85 (Specific)
update products 
set thumbnail = 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
    images = array['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80']
where name ilike '%Reebok%' or name ilike '%Club C%';
