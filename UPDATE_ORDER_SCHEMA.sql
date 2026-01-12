-- 1. Add Columns for Real Cancellation/Refund Flow
alter table orders add column if not exists cancellation_reason text;
alter table orders add column if not exists refund_status text default 'Not Applicable';
alter table orders add column if not exists refund_id text;

-- 2. Update Cancel Order RPC to handle Reason and Refund Logic
create or replace function cancel_order(p_order_id uuid, p_reason text)
returns json
language plpgsql
security definer
as $$
declare
  v_order orders%rowtype;
  v_item record;
begin
  -- Check if order exists and is cancellable
  select * into v_order from orders where id = p_order_id;
  
  if not found then
    return json_build_object('success', false, 'error', 'Order not found');
  end if;

  if v_order.status = 'Cancelled' then
    return json_build_object('success', false, 'error', 'Order is already cancelled');
  end if;

  if v_order.status = 'Delivered' then
    return json_build_object('success', false, 'error', 'Cannot cancel delivered order. Use Return.');
  end if;

  -- 1. Restore Stock
  for v_item in select * from order_items where order_id = p_order_id loop
    update products
    set stock_quantity = stock_quantity + v_item.quantity
    where id = v_item.product_id;
  end loop;

  -- 2. Update Order Status
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

-- Ensure public access
grant execute on function cancel_order(uuid, text) to public;
