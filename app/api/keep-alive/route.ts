import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint keeps the Supabase project alive by making a query
// Set up a cron job to call this every 5 days

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Simple query to keep the database active
        const { data, error } = await supabase
            .from('settings')
            .select('id')
            .limit(1);

        if (error) {
            return NextResponse.json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Supabase connection alive',
            timestamp: new Date().toISOString(),
            hasData: !!data
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
