
const { Client } = require('pg');

const connectionString = "postgres://postgres:matoshree5673@db.cgbxhkizcwmqgckxvhau.supabase.co:5432/postgres";

const client = new Client({
    connectionString: connectionString,
});

async function runMigration() {
    console.log('Connecting to database...');
    try {
        await client.connect();
        console.log('Connected.');

        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS product_variants (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
        color_name text NOT NULL,
        color_code text NOT NULL,
        images text[] DEFAULT '{}',
        sku text,
        stock integer DEFAULT 0,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `;

        const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
    `;

        console.log('Executing CREATE TABLE...');
        await client.query(createTableSQL);
        console.log('Table `product_variants` created (or already exists).');

        console.log('Executing CREATE INDEX...');
        await client.query(createIndexSQL);
        console.log('Index created.');

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration execution failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
