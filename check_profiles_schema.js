const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cgbxhkizcwmqgckxvhau.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnYnhoa2l6Y3dtcWdja3h2aGF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU2OTU4MSwiZXhwIjoyMDc1MTQ1NTgxfQ.3NZhpSlQI17kLR8mnWLgkIOz0qmVjiaeOWKBXR4aTy8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking profiles table...');
    const { data, error } = await supabase
        .from('profiles')
        .select('id, role, is_verified, business_name, gst_number')
        .limit(1);

    if (error) {
        console.log('Error:', error.message);
    } else {
        console.log('Success! Columns exist. Data:', data);
    }
}

checkSchema();
