
const { Client } = require('pg');
const connectionString = "postgres://postgres:matoshree5673@db.cgbxhkizcwmqgckxvhau.supabase.co:5432/postgres";

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function checkSchema() {
    await client.connect();
    try {
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'returns';
        `);
        console.log('Returns Columns:', res.rows.map(r => r.column_name));

        const res2 = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'orders';
        `);
        console.log('Orders Columns:', res2.rows.map(r => r.column_name));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
checkSchema();
