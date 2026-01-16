
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cgbxhkizcwmqgckxvhau.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU2OTU4MSwiZXhwIjoyMDc1MTQ1NTgxfQ.3NZhpSlQI17kLR8mnWLgkIOz0qmVjiaeOWKBXR4aTy8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductSchema() {
    console.log('Checking products table...');
    const { data: products, error } = await supabase.from('products').select('*').limit(1);
    if (products && products.length > 0) {
        console.log('Products Columns:', Object.keys(products[0]));
        // Check for 'variants' or similar json/array columns
        if (products[0].variants) console.log('Found variants column');
        if (products[0].colors) console.log('Found colors column');
    } else if (error) {
        console.log('Could not get products columns', error);
    } else {
        console.log('Products table accessible but empty.');
    }

    console.log('Checking product_variants table...');
    const { data: variants, error: vError } = await supabase.from('product_variants').select('*').limit(1);
    if (vError) {
        console.log('product_variants table error:', vError.message);
    } else {
        console.log('product_variants table exists. Rows:', variants.length);
    }
}

checkProductSchema();
