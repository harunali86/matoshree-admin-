
const { Client } = require('pg');

const connectionString = "postgres://postgres:matoshree5673@db.cgbxhkizcwmqgckxvhau.supabase.co:5432/postgres";

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    await client.connect();
    try {
        console.log('Starting Ecosystem Migration...');

        // 1. Coupons Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS coupons (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                code TEXT UNIQUE NOT NULL,
                discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
                discount_value NUMERIC NOT NULL,
                min_order NUMERIC DEFAULT 0,
                max_discount NUMERIC,
                is_active BOOLEAN DEFAULT true,
                usage_count INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('✅ Coupons table verified.');

        // 2. Returns Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS returns (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                order_id UUID REFERENCES orders(id),
                user_id UUID REFERENCES auth.users(id),
                reason TEXT NOT NULL,
                status TEXT CHECK (status IN ('requested', 'approved', 'rejected', 'refunded')) DEFAULT 'requested',
                admin_note TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('✅ Returns table verified.');

        // 3. Update Orders Table (if needed)
        // Check if return_status column exists
        const res = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'return_status';
        `);

        if (res.rows.length === 0) {
            await client.query(`ALTER TABLE orders ADD COLUMN return_status TEXT;`);
            console.log('✅ Added return_status to orders.');
        } else {
            console.log('✅ return_status already exists in orders.');
        }

    } catch (err) {
        console.error('Migration Failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
