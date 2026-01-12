'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Settings
export async function getSettings() {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 'main').single();
    if (error) return null;
    return data;
}

export async function saveSettings(settings: { store: any; shipping: any; pages: any }) {
    const { error } = await supabase.from('settings').upsert({
        id: 'main',
        ...settings,
        updated_at: new Date().toISOString(),
    });
    return { success: !error, error: error?.message };
}

// Products
export async function getProducts() {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
}

export async function createProduct(product: any) {
    const { error } = await supabase.from('products').insert(product);
    return { success: !error, error: error?.message };
}

export async function updateProduct(id: string, updates: any) {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    return { success: !error, error: error?.message };
}

export async function deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    return { success: !error, error: error?.message };
}

// Image Upload - Server side with service role key
export async function uploadImage(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'No file provided', url: null };

    const ext = file.name.split('.').pop();
    const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2, 11)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error } = await supabase.storage.from('images').upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
    });

    if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message, url: null };
    }

    const { data } = supabase.storage.from('images').getPublicUrl(fileName);
    return { success: true, error: null, url: data.publicUrl };
}

// Categories
export async function getCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    return data || [];
}

export async function createCategory(category: any) {
    const { error } = await supabase.from('categories').insert(category);
    return { success: !error, error: error?.message };
}

export async function updateCategory(id: string, updates: any) {
    const { error } = await supabase.from('categories').update(updates).eq('id', id);
    return { success: !error, error: error?.message };
}

export async function deleteCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    return { success: !error, error: error?.message };
}

// Brands
export async function getBrands() {
    const { data } = await supabase.from('brands').select('*').order('name');
    return data || [];
}

export async function createBrand(brand: any) {
    const { error } = await supabase.from('brands').insert(brand);
    return { success: !error, error: error?.message };
}

export async function updateBrand(id: string, updates: any) {
    const { error } = await supabase.from('brands').update(updates).eq('id', id);
    return { success: !error, error: error?.message };
}

export async function deleteBrand(id: string) {
    const { error } = await supabase.from('brands').delete().eq('id', id);
    return { success: !error, error: error?.message };
}

// Orders
export async function getOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    return data || [];
}

export async function updateOrderStatus(id: string, status: string) {
    if (status === 'Cancelled') {
        const { error } = await supabase.rpc('cancel_order', { p_order_id: id });
        return { success: !error, error: error?.message };
    }
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    return { success: !error, error: error?.message };
}

// Coupons
export async function getCoupons() {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    return data || [];
}

export async function createCoupon(coupon: any) {
    const { error } = await supabase.from('coupons').insert(coupon);
    return { success: !error, error: error?.message };
}

export async function updateCoupon(id: string, updates: any) {
    const { error } = await supabase.from('coupons').update(updates).eq('id', id);
    return { success: !error, error: error?.message };
}

export async function deleteCoupon(id: string) {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    return { success: !error, error: error?.message };
}

// Reviews
export async function getReviews() {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    return data || [];
}

export async function updateReviewVerified(id: string, is_verified: boolean) {
    const { error } = await supabase.from('reviews').update({ is_verified }).eq('id', id);
    return { success: !error, error: error?.message };
}

export async function deleteReview(id: string) {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    return { success: !error, error: error?.message };
}

// Banners
export async function getBanners() {
    const { data } = await supabase.from('banners').select('*').order('display_order');
    return data || [];
}

export async function createBanner(banner: any) {
    const { error } = await supabase.from('banners').insert(banner);
    return { success: !error, error: error?.message };
}

export async function updateBanner(id: string, updates: any) {
    const { error } = await supabase.from('banners').update(updates).eq('id', id);
    return { success: !error, error: error?.message };
}

export async function deleteBanner(id: string) {
    const { error } = await supabase.from('banners').delete().eq('id', id);
    return { success: !error, error: error?.message };
}

// Hero Section
export async function getHeroSlides() {
    // Join with products to get product details
    const { data, error } = await supabase
        .from('hero_slides')
        .select('*, product:products(name, price)')
        .order('display_order');
    return data || [];
}

export async function createHeroSlide(slide: any) {
    const { error } = await supabase.from('hero_slides').insert(slide);
    return { success: !error, error: error?.message };
}

export async function updateHeroSlide(id: string, updates: any) {
    const { error } = await supabase.from('hero_slides').update(updates).eq('id', id);
    return { success: !error, error: error?.message };
}

export async function deleteHeroSlide(id: string) {
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    return { success: !error, error: error?.message };
}

// Collections
export async function getCollections() {
    const { data } = await supabase.from('collections').select('*').order('name');
    return data || [];
}

export async function createCollection(collection: any) {
    const { error } = await supabase.from('collections').insert(collection);
    return { success: !error, error: error?.message };
}

export async function updateCollection(id: string, updates: any) {
    const { error } = await supabase.from('collections').update(updates).eq('id', id);
    return { success: !error, error: error?.message };
}

export async function deleteCollection(id: string) {
    const { error } = await supabase.from('collections').delete().eq('id', id);
    return { success: !error, error: error?.message };
}

// Blogs
export async function getBlogs() {
    const { data } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
    return data || [];
}

export async function createBlog(blog: any) {
    const { error } = await supabase.from('blogs').insert(blog);
    return { success: !error, error: error?.message };
}

export async function updateBlog(id: string, updates: any) {
    const { error } = await supabase.from('blogs').update(updates).eq('id', id);
    return { success: !error, error: error?.message };
}

export async function deleteBlog(id: string) {
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    return { success: !error, error: error?.message };
}

// Dashboard Stats
export async function getDashboardStats() {
    const [products, orders, categories] = await Promise.all([
        supabase.from('products').select('id, price', { count: 'exact' }),
        supabase.from('orders').select('id, total_amount, status', { count: 'exact' }),
        supabase.from('categories').select('id', { count: 'exact' }),
    ]);

    const totalRevenue = orders.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
    const pendingOrders = orders.data?.filter(o => o.status === 'pending').length || 0;

    return {
        totalProducts: products.count || 0,
        totalOrders: orders.count || 0,
        totalCategories: categories.count || 0,
        totalRevenue,
        pendingOrders,
        recentOrders: orders.data?.slice(0, 5) || [],
    };
}

// Customers
export async function getCustomers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    return data || [];
}

// Notifications
export async function sendNotificationToAll(title: string, body: string) {
    const { data: profiles } = await supabase.from('profiles').select('push_token').not('push_token', 'is', null);

    if (!profiles || profiles.length === 0) {
        return { success: false, error: 'No devices registered for notifications' };
    }

    // Filter unique valid tokens
    const tokens = Array.from(new Set(profiles.map(p => p.push_token).filter(t => t && t.startsWith('ExponentPushToken'))));

    if (tokens.length === 0) return { success: false, error: 'No valid tokens found' };

    const messages = tokens.map(token => ({
        to: token,
        sound: 'default',
        title,
        body,
        data: { url: '/(tabs)/' }, // Deep link to home
    }));

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages),
        });

        // Save notification to history (optional, assuming 'notifications' table exists or we skip)
        // await supabase.from('notifications').insert({ title, body, sent_count: tokens.length });

        return { success: true, count: tokens.length };
    } catch (e: any) {
        console.error('Push Error:', e);
        return { success: false, error: e.message };
    }
}
