
const { Client } = require('pg');

const connectionString = "postgres://postgres:matoshree5673@db.cgbxhkizcwmqgckxvhau.supabase.co:5432/postgres";

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    await client.connect();
    try {
        console.log('Starting Replacement Logic Migration...');

        // Add columns to returns table
        await client.query(`
            ALTER TABLE returns 
            ADD COLUMN IF NOT EXISTS action_type TEXT CHECK (action_type IN ('refund', 'replacement')) DEFAULT 'refund',
            ADD COLUMN IF NOT EXISTS replacement_order_id UUID REFERENCES orders(id);
        `);
        console.log('✅ Added action_type and replacement_order_id to returns.');

    } catch (err) {
        console.error('Migration Failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
