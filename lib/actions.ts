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
    const { data, error } = await supabase.from('products').select('*, price_tiers(*), product_variants(*)').order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
}

export async function createProduct(product: any) {
    const { price_tiers, variants, ...productData } = product;

    // 1. Insert Product
    const { data, error } = await supabase.from('products').insert(productData).select().single();

    if (error) return { success: false, error: error.message };

    // 2. Insert Price Tiers if any
    if (price_tiers && price_tiers.length > 0 && data) {
        const tiersToInsert = price_tiers.map((tier: any) => ({
            ...tier,
            product_id: data.id
        }));

        const { error: tierError } = await supabase.from('price_tiers').insert(tiersToInsert);
        if (tierError) console.error('Error inserting tiers:', tierError);
    }

    // 3. Insert Variants if any
    if (variants && variants.length > 0 && data) {
        const variantsToInsert = variants.map((v: any) => ({
            product_id: data.id,
            color_name: v.color_name,
            color_code: v.color_code,
            images: v.images || [],
            sku: v.sku || null,
            stock: v.stock || 0
        }));

        const { error: varError } = await supabase.from('product_variants').insert(variantsToInsert);
        if (varError) console.error('Error inserting variants:', varError);
    }

    return { success: true, error: null };
}

export async function updateProduct(id: string, updates: any) {
    const { price_tiers, variants, ...productData } = updates;

    // 1. Update Product
    const { error } = await supabase.from('products').update(productData).eq('id', id);
    if (error) return { success: false, error: error.message };

    // 2. Update Tiers (Delete all old, insert new)
    if (price_tiers) {
        await supabase.from('price_tiers').delete().eq('product_id', id);
        if (price_tiers.length > 0) {
            const tiersToInsert = price_tiers.map((tier: any) => ({
                product_id: id,
                min_quantity: tier.min_quantity,
                max_quantity: tier.max_quantity,
                unit_price: tier.unit_price,
                tier_name: tier.tier_name
            }));
            await supabase.from('price_tiers').insert(tiersToInsert);
        }
    }

    // 3. Update Variants (Delete all old, insert new)
    if (variants) {
        await supabase.from('product_variants').delete().eq('product_id', id);
        if (variants.length > 0) {
            const variantsToInsert = variants.map((v: any) => ({
                product_id: id,
                color_name: v.color_name,
                color_code: v.color_code,
                images: v.images || [],
                sku: v.sku || null,
                stock: v.stock || 0
            }));
            await supabase.from('product_variants').insert(variantsToInsert);
        }
    }

    return { success: true, error: null };
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
    const { data } = await supabase
        .from('orders')
        .select(`
            *,
            items:order_items (
                quantity,
                size,
                product:products (name)
            ),
            user:profiles (
                role,
                full_name
            )
        `)
        .order('created_at', { ascending: false });
    return data || [];
}

export async function updateOrderStatus(id: string, status: string) {
    if (status === 'Cancelled') {
        const { error } = await supabase.rpc('cancel_order', { p_order_id: id });
        return { success: !error, error: error?.message };
    }
    const { data: order } = await supabase.from('orders').select('user_id').eq('id', id).single();
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);

    // Automated Notification Trigger
    if (!error && order?.user_id) {
        let title = '', body = '';
        if (status === 'Shipped') { title = 'Order Shipped! 🚀'; body = 'Your order is on its way.'; }
        else if (status === 'Delivered') { title = 'Order Delivered! 🎉'; body = 'Your order has been delivered.'; }
        else if (status === 'Processing') { title = 'Order Confirmed ✅'; body = 'We are processing your order.'; }

        if (title) {
            await sendNotificationToUser(order.user_id, title, body, { url: `/orders/${id}` });
        }
    }

    return { success: !error, error: error?.message };
}

export async function generateShipmentAction(orderId: string) {
    // 1. Fetch Order
    const { data: order, error } = await supabase
        .from('orders')
        .select(`*, address:addresses(*), user:user_id(email), items:order_items(*, product:products(name))`)
        .eq('id', orderId)
        .single();

    if (!order) return { success: false, error: 'Order not found' };

    // 2. Call Shiprocket (Mocked for now)
    const { createShipmentOrder } = await import('./shiprocket');
    const shipment = await createShipmentOrder(order);

    if (shipment.success) {
        // 3. Update Order with AWB
        await supabase.from('orders').update({
            status: 'Shipped',
            tracking_number: shipment.awb_code
        }).eq('id', orderId);

        return { success: true, awb: shipment.awb_code };
    }

    return { success: false, error: 'Shipment failed' };
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

export async function updateProfile(id: string, updates: any) {
    const { error } = await supabase.from('profiles').update(updates).eq('id', id);
    return { success: !error, error: error?.message };
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


export async function sendNotificationToUser(userId: string, title: string, body: string, data = {}) {
    const { data: profile } = await supabase.from('profiles').select('push_token').eq('id', userId).single();

    if (!profile || !profile.push_token || !profile.push_token.startsWith('ExponentPushToken')) {
        return { success: false, error: 'No valid push token found' };
    }

    const message = {
        to: profile.push_token,
        sound: 'default',
        title,
        body,
        data,
    };

    try {
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([message]),
        });
        return { success: true };
    } catch (e: any) {
        console.error('Push Error:', e);
        return { success: false, error: e.message };
    }
}
// Quotations
export async function getQuotation(id: string) {
    const { data, error } = await supabase
        .from('quotations')
        .select(`
            *,
            profile:profiles(*)
        `)
        .eq('id', id)
        .single();
    if (error) return null;
    return data;
}

export async function createQuotation(quotation: any) {
    const { error } = await supabase.from('quotations').insert(quotation);
    return { success: !error, error: error?.message };
}

// App Config (System Settings)
export async function getAppConfig(key: string) {
    const { data, error } = await supabase.from('app_config').select('value').eq('key', key).single();
    if (error) return null;
    return data.value;
}

export async function updateAppConfig(key: string, value: any) {
    const { error } = await supabase.from('app_config').upsert({ key, value, updated_at: new Date().toISOString() });
    return { success: !error, error: error?.message };
}

// Returns Management
export async function getReturns() {
    const { data, error } = await supabase
        .from('returns')
        .select(`
            *,
            order:orders(invoice_number, total_amount),
            user:user_id(email, raw_user_meta_data)
        `)
        .order('created_at', { ascending: false });

    if (error) console.error('Error fetching returns:', error);
    return data || [];
}

export async function updateReturnStatus(id: string, status: string) {
    // Update Return Entry
    const { error } = await supabase
        .from('returns')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('Error updating return:', error);
        return false;
    }

    // Sync with Order
    const { data: ret } = await supabase.from('returns').select('order_id').eq('id', id).single();
    if (ret) {
        await supabase.from('orders').update({ return_status: status }).eq('id', ret.order_id);
    }

    return true;
}

export async function createReplacementOrder(returnId: string) {
    // Uses global supabase instance

    // 1. Fetch Return & Original Order
    const { data: ret } = await supabase.from('returns').select('*, order:orders(*, items:order_items(*))').eq('id', returnId).single();
    if (!ret || !ret.order) return { success: false, error: 'Original order not found' };

    const originalOrder = ret.order;
    const items = originalOrder.items;

    // 2. Create New Zero-Cost Order
    const { data: newOrder, error: orderError } = await supabase.from('orders').insert({
        user_id: originalOrder.user_id,
        status: 'Processing',
        total_amount: 0, // Free Replacement
        payment_status: 'Paid',
        payment_method: 'Replacement',
        address_id: originalOrder.address_id, // Same Address
        is_wholesale: originalOrder.is_wholesale,
        invoice_number: `RPL-${Date.now().toString().slice(-6)}`, // Unique Invoice
        po_number: originalOrder.po_number ? `RPL-for-${originalOrder.po_number}` : null
    }).select().single();

    if (orderError) return { success: false, error: orderError.message };

    // 3. Clone Items
    const newItems = items.map((item: any) => ({
        order_id: newOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        price: 0 // Free
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(newItems);
    if (itemsError) return { success: false, error: itemsError.message };

    // 4. Update Return Status
    await supabase.from('returns').update({
        status: 'approved',
        action_type: 'replacement',
        replacement_order_id: newOrder.id
    }).eq('id', returnId);

    // 5. Mark Original Order
    await supabase.from('orders').update({ return_status: 'replaced' }).eq('id', originalOrder.id);

    return { success: true };
}


// Quotations Status Update
export async function updateQuotationStatus(id: string, status: string) {
    const { error } = await supabase.from('quotations').update({ status }).eq('id', id);
    return { success: !error, error: error?.message };
}

// Coupons
export async function getCoupons() {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data;
}

export async function createCoupon(coupon: any) {
    const { error } = await supabase.from('coupons').insert(coupon);
    return { success: !error, error: error?.message };
}

export async function deleteCoupon(id: string) {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    return { success: !error, error: error?.message };
}

export async function validateCoupon(code: string, cartTotal: number) {
    const { data, error } = await supabase.from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

    if (error || !data) return { valid: false, message: 'Invalid or inactive coupon code.' };

    const now = new Date();
    if (data.start_date && new Date(data.start_date) > now) return { valid: false, message: 'Coupon is not yet valid.' };
    if (data.end_date && new Date(data.end_date) < now) return { valid: false, message: 'Coupon has expired.' };
    if (data.usage_limit && data.usage_count >= data.usage_limit) return { valid: false, message: 'Coupon usage limit reached.' };
    if (cartTotal < data.min_order_value) return { valid: false, message: `Minimum order value of ₹${data.min_order_value} required.` };

    let discountAmount = 0;
    if (data.discount_type === 'percentage') {
        discountAmount = (cartTotal * data.discount_value) / 100;
        if (data.max_discount_value && discountAmount > data.max_discount_value) {
            discountAmount = data.max_discount_value;
        }
    } else {
        discountAmount = data.discount_value;
    }

    return { valid: true, discountAmount, coupon: data };
}
