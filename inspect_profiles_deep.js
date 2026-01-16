const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cgbxhkizcwmqgckxvhau.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnYnhoa2l6Y3dtcWdja3h2aGF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU2OTU4MSwiZXhwIjoyMDc1MTQ1NTgxfQ.3NZhpSlQI17kLR8mnWLgkIOz0qmVjiaeOWKBXR4aTy8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectProfiles() {
    console.log('--- Inspecting Profiles Table ---');

    // 1. Check if we can select the column
    const { data: selectData, error: selectError } = await supabase
        .from('profiles')
        .select('id, shop_address')
        .limit(1);

    if (selectError) {
        console.error('Select Error:', selectError.message);
    } else {
        console.log('Select Success. Sample:', selectData);
    }

    // 2. Try to update a dummy row (if one exists) to check write permissions
    // We won't actually change data, just see if it errors on the column
    if (selectData && selectData.length > 0) {
        const id = selectData[0].id;
        console.log(`Attempting dummy update on ID: ${id}`);
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ shop_address: 'Test Address' }) // This might fail if RLS blocks it, but we want to see IF the column exists error persists
            .eq('id', id);

        if (updateError) {
            console.error('Update Error:', updateError.message);
        } else {
            console.log('Update Success (Column exists and is writable via Service Role)');
        }
    }
}

inspectProfiles();
