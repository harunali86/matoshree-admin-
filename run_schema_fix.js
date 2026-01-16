const { Client } = require('pg');

// Direct connection string from .env.local (Step 2127)
const connectionString = "postgres://postgres:matoshree5673@db.cgbxhkizcwmqgckxvhau.supabase.co:5432/postgres";

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    try {
        await client.connect();
        console.log('Connected to Database');

        const sql = `
            ALTER TABLE profiles 
            ADD COLUMN IF NOT EXISTS shop_address text;
            
            COMMENT ON COLUMN profiles.shop_address IS 'Physical address of the shop for B2B verification';
        `;

        await client.query(sql);
        console.log('Schema migration successful: shop_address column added.');

    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

runMigration();
