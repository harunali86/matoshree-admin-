-- 1. Remove Duplicate Brands (Keep oldest)
delete from brands a using brands b where a.id > b.id and a.name = b.name;

-- 2. Ensure Name is Unique
alter table brands drop constraint if exists brands_name_key;
alter table brands add constraint brands_name_key unique (name);

-- 3. Upsert Brands with Logos AND Slugs
insert into brands (name, slug, logo_url) values 
('Vans', 'vans', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Vans-logo.svg/800px-Vans-logo.svg.png'),
('Converse', 'converse', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Converse_logo.svg/800px-Converse_logo.svg.png'),
('Fila', 'fila', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Fila_logo.svg/800px-Fila_logo.svg.png'),
('Nike', 'nike', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/800px-Logo_NIKE.svg.png'),
('Adidas', 'adidas', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/800px-Adidas_Logo.svg.png'),
('Puma', 'puma', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Puma_logo.svg/800px-Puma_logo.svg.png'),
('Reebok', 'reebok', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Reebok_2019_logo.svg/800px-Reebok_2019_logo.svg.png'),
('New Balance', 'new-balance', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/New_Balance_logo.svg/800px-New_Balance_logo.svg.png')
on conflict (name) do update set logo_url = excluded.logo_url;
