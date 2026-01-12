create or replace function cancel_order(p_order_id uuid, p_reason text)
returns json
language plpgsql
security definer
as $$
declare
  v_order record;
  v_items record;
begin
  -- Check if order exists and is cancellable
  select * into v_order from orders where id = p_order_id;
  
  if not found then
    return json_build_object('success', false, 'error', 'Order not found');
  end if;

  if v_order.status in ('Cancelled', 'Delivered', 'Returned') then
    return json_build_object('success', false, 'error', 'Order cannot be cancelled');
  end if;

  -- Restore Stock (Using correct column 'stock')
  for v_items in select * from order_items where order_id = p_order_id loop
    update products
    set stock = stock + v_items.quantity
    where id = v_items.product_id;
  end loop;

  -- Update Order Status
  update orders
  set status = 'Cancelled',
      cancellation_reason = p_reason,
      refund_status = case 
        when payment_method = 'COD' then 'Not Applicable'
        else 'Initiated'
      end,
      updated_at = now()
  where id = p_order_id;

  return json_build_object('success', true);
exception when others then
  return json_build_object('success', false, 'error', SQLERRM);
end;
$$;
