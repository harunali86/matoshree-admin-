import { createClient } from '@supabase/supabase-js';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Simple query to keep database active
    const { data, error } = await supabase.from('products').select('id').limit(1);
    
    const timestamp = new Date().toISOString();
    
    if (error) {
        console.log(`[${timestamp}] Keep-alive FAILED:`, error.message);
        return Response.json({ success: false, error: error.message, timestamp });
    }
    
    console.log(`[${timestamp}] Keep-alive SUCCESS`);
    return Response.json({ success: true, message: 'Supabase is alive!', timestamp });
}
