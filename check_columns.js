const { Client } = require('pg');

const connectionString = "postgres://postgres:matoshree5673@db.cgbxhkizcwmqgckxvhau.supabase.co:5432/postgres";

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
    try {
        await client.connect();
        const res = await client.query("select column_name, data_type from information_schema.columns where table_name = 'profiles';");
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkColumns();
