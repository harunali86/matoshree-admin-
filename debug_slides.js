const { Client } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('--- Categories ---');
        const cats = await client.query("select * from categories");
        cats.rows.forEach(c => console.log(c.name));

        console.log('--- Hero Slides ---');
        const slides = await client.query("select id, title, is_active from hero_slides");
        console.log('Total Slides:', slides.rows.length);
        slides.rows.forEach(s => console.log(`- ${s.title} (Active: ${s.is_active})`));

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

run();
