'use server';

import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Admin credentials - stored in environment variables for security
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@matoshree.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Session token - simple but effective
const SESSION_NAME = 'admin_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

function generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    // Validate credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        // Small delay to prevent brute force
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: false, error: 'Invalid email or password' };
    }

    // Generate session token
    const token = generateToken();
    const expiresAt = Date.now() + SESSION_DURATION;

    // Store session in database (or you can use in-memory/redis for production)
    const { error } = await supabase.from('admin_sessions').upsert({
        id: 'main',
        token,
        email,
        expires_at: new Date(expiresAt).toISOString(),
        created_at: new Date().toISOString(),
    });

    if (error) {
        console.error('Session save error:', error);
        return { success: false, error: 'Session Error: Database table missing. Please runs SQL setup.' };
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION / 1000,
        path: '/',
    });

    return { success: true };
}

export async function logout(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_NAME);

    // Clear session from database
    await supabase.from('admin_sessions').delete().eq('id', 'main');
}

export async function checkAuth(): Promise<{ authenticated: boolean; email?: string }> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_NAME)?.value;

    if (!token) {
        return { authenticated: false };
    }

    // Verify token from database
    const { data } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('id', 'main')
        .eq('token', token)
        .single();

    if (!data) {
        // Strict: if not in database, invalid session.
        return { authenticated: false };
    }

    // Check expiration
    if (new Date(data.expires_at) < new Date()) {
        await logout();
        return { authenticated: false };
    }

    return { authenticated: true, email: data.email };
}

export async function getSession(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_NAME)?.value || null;
}
