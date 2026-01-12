const { Client } = require('pg');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
    try {
        await client.connect();
        const res = await client.query(`
      SELECT column_name, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'orders';
    `);
        console.table(res.rows);
    } catch (e) { console.error(e); } finally { await client.end(); }
}
run();
