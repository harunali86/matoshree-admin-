
const { Client } = require('pg');

const connectionString = "postgres://postgres:matoshree5673@db.cgbxhkizcwmqgckxvhau.supabase.co:5432/postgres";

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    await client.connect();
    try {
        console.log('Starting Wholesale Description Migration...');

        // Add column to products table
        await client.query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS description_wholesale TEXT;
        `);
        console.log('✅ Added description_wholesale to products.');

    } catch (err) {
        console.error('Migration Failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
