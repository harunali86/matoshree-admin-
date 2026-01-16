const { Client } = require('pg');

const client = new Client({
    connectionString: "postgres://postgres:matoshree5673@db.cgbxhkizcwmqgckxvhau.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        await client.connect();
        console.log("Creating price_tiers table...");

        await client.query(`
      CREATE TABLE IF NOT EXISTS price_tiers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        min_quantity INTEGER NOT NULL,
        max_quantity INTEGER,
        unit_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

        console.log("Table created successfully.");

        // Enable RLS
        await client.query(`ALTER TABLE price_tiers ENABLE ROW LEVEL SECURITY;`);

        // Policy: Public read
        await client.query(`
      create policy "Public price tiers are viewable by everyone."
      on price_tiers for select
      using ( true );
    `);

        // Policy: Admin write (optional, for now maybe just public write for dev/admin?)
        // Actually for now let's just allow read. Admin panel handles usage.

        console.log("RLS enabled and policy added.");

    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await client.end();
    }
}

migrate();
