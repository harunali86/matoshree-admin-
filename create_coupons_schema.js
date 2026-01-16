
const { Client } = require('pg');
const connectionString = "postgres://postgres:matoshree5673@db.cgbxhkizcwmqgckxvhau.supabase.co:5432/postgres";

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function runMigration() {
    await client.connect();
    try {
        console.log('Starting Coupons Table Migration...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS coupons (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                code TEXT NOT NULL UNIQUE,
                discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
                discount_value DECIMAL(10, 2) NOT NULL,
                min_order_value DECIMAL(10, 2) DEFAULT 0,
                max_discount_value DECIMAL(10, 2), -- For percentage caps e.g. 50% up to 500
                start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                end_date TIMESTAMP WITH TIME ZONE,
                usage_limit INTEGER, -- Total times this coupon can be used
                usage_count INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- RLS Policies
            ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

            -- Admin can do everything (assuming service role bypasses RLS, but explicit is good for future)
            CREATE POLICY "Allow full access to admins" ON coupons
                FOR ALL
                USING (true)
                WITH CHECK (true);
        `);

        console.log('✅ Created coupons table successfully.');

    } catch (err) {
        console.error('Migration Failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
