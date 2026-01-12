-- Relax Constraints on Orders table to match current usage
alter table orders alter column total drop not null;
alter table orders alter column shipping_address drop not null;
alter table orders alter column items drop not null;
alter table orders alter column subtotal drop not null;
alter table orders alter column order_number drop not null;
