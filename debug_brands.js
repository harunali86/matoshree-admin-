const { Client } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('--- Brands ---');
        const res = await client.query("select name, logo_url from brands order by name");
        res.rows.forEach(b => console.log(`${b.name}: ${b.logo_url ? b.logo_url.substring(0, 50) + '...' : 'NULL'}`));

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

run();
