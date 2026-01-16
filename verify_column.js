
const { Client } = require('pg');
const connectionString = "postgres://postgres:matoshree5673@db.cgbxhkizcwmqgckxvhau.supabase.co:5432/postgres";

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function checkColumn() {
    await client.connect();
    try {
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'description_wholesale';
        `);
        if (res.rows.length > 0) {
            console.log('✅ Column description_wholesale exists.');
        } else {
            console.error('❌ Column description_wholesale DOES NOT EXIST.');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
checkColumn();
