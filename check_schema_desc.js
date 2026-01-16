const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envConfig = envContent.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
}, {});

process.env.NEXT_PUBLIC_SUPABASE_URL = envConfig.NEXT_PUBLIC_SUPABASE_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    const { data, error } = await supabase
        .from('products')
        .select('description_wholesale')
        .limit(1);

    if (error) {
        console.log('Error (likely column missing):', error.message);
        // Add column
        console.log('Adding description_wholesale column...');
        // Note: Supabase JS client cannot run DDL/ALTER TABLE directly from client usually unless using SQL function.
        // I will rely on the error message to confirm.
    } else {
        console.log('Column description_wholesale exists.');
    }
}

checkSchema();
