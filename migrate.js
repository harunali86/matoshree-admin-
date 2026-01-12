const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Fix for self-signed certs in newer Node versions/Supabase
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('Error: DATABASE_URL environment variable is missing.');
    console.error('Usage: DATABASE_URL="postgresql://..." [SQL_FILE="file.sql"] node migrate.js');
    process.exit(1);
}

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase
});

async function run() {
    console.log('Connecting to database...');
    try {
        await client.connect();

        // Read the SQL file (Default or Env)
        const fileName = process.env.SQL_FILE || 'SUPABASE_SETUP.sql';
        console.log(`Reading SQL file: ${fileName}...`);

        const sqlPath = path.join(__dirname, fileName);
        if (!fs.existsSync(sqlPath)) {
            throw new Error(fileName + ' not found in ' + __dirname);
        }
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing Migration...');
        await client.query(sql);

        console.log('✅ Migration Successfully Executed!');
    } catch (e) {
        console.error('❌ Migration Error:', e);
    } finally {
        await client.end();
    }
}

run();
