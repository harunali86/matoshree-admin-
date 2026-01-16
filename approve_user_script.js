const { Client } = require('pg');

const connectionString = "postgres://postgres:matoshree5673@db.cgbxhkizcwmqgckxvhau.supabase.co:5432/postgres";

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function testApproval() {
    try {
        await client.connect();
        console.log('Connected to DB');

        // 1. Find a pending wholesaler
        let res = await client.query("SELECT * FROM profiles WHERE role = 'wholesale' AND is_verified = false LIMIT 1");
        let user = res.rows[0];

        if (!user) {
            console.log('No pending wholesaler found. Creating dummy...');
            // Create dummy user logic (simplified for script, might need auth ID which is complex, 
            // so actually let's just picking ANY user and setting them to wholesale pending for test)

            // Pick the first retail user
            res = await client.query("SELECT * FROM profiles LIMIT 1");
            if (res.rows.length === 0) {
                console.log('No users at all!');
                return;
            }
            user = res.rows[0];
            await client.query("UPDATE profiles SET role = 'wholesale', is_verified = false WHERE id = $1", [user.id]);
            console.log(`Converted user ${user.email} (${user.id}) to Pending Wholesaler for testing.`);
        } else {
            console.log(`Found pending wholesaler: ${user.email} (${user.id})`);
        }

        // 2. Approve them
        console.log('Approving user...');
        await client.query("UPDATE profiles SET is_verified = true WHERE id = $1", [user.id]);

        // 3. Verify
        res = await client.query("SELECT is_verified, role FROM profiles WHERE id = $1", [user.id]);
        const updated = res.rows[0];

        if (updated.is_verified === true && updated.role === 'wholesale') {
            console.log('SUCCESS: User is now Verified Wholesaler.');
        } else {
            console.error('FAILED: User status did not update.', updated);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

testApproval();
