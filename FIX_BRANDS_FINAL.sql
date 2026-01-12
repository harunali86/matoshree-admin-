-- 1. Fix Typo
update brands set name = 'Nike' where name = 'Nikee';

-- 2. Insert Missing Brands with Logos
insert into brands (name, logo_url) values 
('Vans', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Vans-logo.svg/800px-Vans-logo.svg.png'),
('Converse', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Converse_logo.svg/800px-Converse_logo.svg.png'),
('Fila', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Fila_logo.svg/800px-Fila_logo.svg.png'),
('Nike', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/800px-Logo_NIKE.svg.png'),
('Adidas', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/800px-Adidas_Logo.svg.png'),
('Puma', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Puma_logo.svg/800px-Puma_logo.svg.png'),
('Reebok', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Reebok_2019_logo.svg/800px-Reebok_2019_logo.svg.png'),
('New Balance', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/New_Balance_logo.svg/800px-New_Balance_logo.svg.png')
on conflict (name) do update set logo_url = excluded.logo_url;
