-- Re-create place_order to match expected signature and behavior
create or replace function place_order(
  p_user_id uuid,
  p_address_id uuid,
  p_total_amount numeric,
  p_items jsonb, -- Array of objects
  p_payment_method text
) returns jsonb as $$
declare
  v_order_id uuid;
  v_invoice_number text;
  v_item jsonb;
  v_product_stock int;
  v_product_name text;
begin
  -- 1. Generate Invoice Number (e.g. MATO-2024-1001)
  -- Ensure sequence exists
  create sequence if not exists invoice_seq start 1000;
  v_invoice_number := 'MATO-' || to_char(now(), 'YYYY') || '-' || nextval('invoice_seq');

  -- 2. Create Order
  insert into orders (user_id, address_id, total_amount, status, payment_status, payment_method, invoice_number)
  values (p_user_id, p_address_id, p_total_amount, 'Pending', 'Pending', p_payment_method, v_invoice_number)
  returning id into v_order_id;

  -- 3. Process Items
  for v_item in select * from jsonb_array_elements(p_items) loop
    -- Check Stock
    select stock, name into v_product_stock, v_product_name from products where id = (v_item->>'product_id')::uuid;
    
    if v_product_stock is null or v_product_stock < (v_item->>'quantity')::int then
      raise exception 'Issued Stock: Product % is out of stock (Available: %)', v_product_name, coalesce(v_product_stock, 0);
    end if;

    -- Deduct Stock
    update products 
    set stock = stock - (v_item->>'quantity')::int
    where id = (v_item->>'product_id')::uuid;

    -- Insert Order Item
    insert into order_items (order_id, product_id, quantity, price, size)
    values (
      v_order_id, 
      (v_item->>'product_id')::uuid, 
      (v_item->>'quantity')::int, 
      (v_item->>'price')::numeric,
      (v_item->>'size')
    );
  end loop;

  return jsonb_build_object('success', true, 'order_id', v_order_id, 'invoice_number', v_invoice_number);
exception when others then
  return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$ language plpgsql security definer;
