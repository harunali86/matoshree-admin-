const { Client } = require('pg');

const client = new Client({
    connectionString: "postgres://postgres:matoshree5673@db.cgbxhkizcwmqgckxvhau.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
    try {
        await client.connect();

        console.log("Checking price_tiers table...");
        const res = await client.query(`
      SELECT 
        kcu.constraint_name,
        kcu.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.key_column_usage AS kcu
      JOIN 
        information_schema.constraint_column_usage AS ccu
      ON kcu.constraint_name = ccu.constraint_name
      WHERE kcu.table_name = 'price_tiers';
    `);

        console.log("Foreign Keys on price_tiers:", res.rows);

        const checkTable = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'price_tiers';
    `);
        console.log("Columns on price_tiers:", checkTable.rows);

    } catch (err) {
        console.error("Error checking schema:", err);
    } finally {
        await client.end();
    }
}

checkSchema();
