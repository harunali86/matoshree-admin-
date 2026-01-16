
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cgbxhkizcwmqgckxvhau.supabase.co';
// Using SERVICE_ROLE_KEY for admin access
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnYnhoa2l6Y3dtcWdja3h2aGF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU2OTU4MSwiZXhwIjoyMDc1MTQ1NTgxfQ.3NZhpSlQI17kLR8mnWLgkIOz0qmVjiaeOWKBXR4aTy8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking orders table...');
    const { data: orders, error: ordersError } = await supabase.from('orders').select('*').limit(1);
    if (orders && orders.length > 0) {
        console.log('Orders Columns:', Object.keys(orders[0]));
    } else {
        console.log('Could not get orders columns', ordersError);
    }

    console.log('Checking order_items table...');
    const { data: items, error: itemsError } = await supabase.from('order_items').select('*').limit(1);
    if (items && items.length > 0) {
        console.log('Order Items Columns:', Object.keys(items[0]));
    } else {
        console.log('Could not get order_items columns', itemsError);
    }
}

checkSchema();
