const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cgbxhkizcwmqgckxvhau.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need Service Role to bypass Auth if testing as guest?
// Wiat, RPC is security definer, implies it runs as owner.
// But I need to call it via library.
// I'll use the hardcoded URL and Key from previous conversations or assume I have them.
// Actually I don't have the Key in Env vars here (it's in .env.local which I can't read freely, but I saw it earlier? No).
// User provided credentials: postgres:RULEONTHEW123.
// So I can use PG to call the Function directly via SQL! much easier.

const { Client } = require('pg');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        // 1. Get a Product
        const prodRes = await client.query("select id, price from products limit 1");
        if (prodRes.rows.length === 0) throw new Error("No products");
        const prod = prodRes.rows[0];
        console.log('Product:', prod);

        // 2. Get an Address (Create dummy if needed)
        // We need an address id.
        const addrRes = await client.query("select id from addresses limit 1");
        let addrId;
        if (addrRes.rows.length === 0) {
            // Only if no addresses exist
            console.log("No address found, can't test unless I insert one. Skipping address check for now.");
            // I'll try to insert a fake address into addresses table for testing?
            // Need user_id?
            // Let's assume user has addresses.
            // Or I'll just use a random UUID and expect FK error if valid.
            // Actually, if I call the function via SQL, I can pass parameters.
            const res = await client.query(`
            insert into addresses (user_id, name, phone, address_line, city, state, pincode)
            values (null, 'Test User', '1234567890', 'Test Line', 'New City', 'State', '123456')
            returning id
        `);
            addrId = res.rows[0].id;
        } else {
            addrId = addrRes.rows[0].id;
        }
        console.log('Address:', addrId);

        // 3. Call Place Order
        const items = JSON.stringify([{
            product_id: prod.id,
            quantity: 1,
            price: prod.price,
            size: '9'
        }]);

        console.log('Calling place_order...');
        const query = `
        select place_order(
            null, -- user_id
            $1, -- address_id
            $2, -- total
            $3, -- items (jsonb)
            'COD' -- payment method
        )
    `;
        const res = await client.query(query, [addrId, prod.price, items]);
        console.log('Result:', res.rows[0]);

    } catch (e) {
        console.error('ERROR:', e.message);
        if (e.hint) console.error('Hint:', e.hint);
        if (e.detail) console.error('Detail:', e.detail);
        if (e.context) console.error('Context:', e.context);
    } finally {
        await client.end();
    }
}

run();
