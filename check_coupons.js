
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:postgres@localhost:54322/postgres"
});

async function checkCoupons() {
    await client.connect();
    try {
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'coupons';
        `);
        console.log('Coupons Table:', res.rows.length > 0 ? 'Exits' : 'Missing');

        if (res.rows.length > 0) {
            const cols = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'coupons';
            `);
            console.log('Columns:', cols.rows);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkCoupons();
