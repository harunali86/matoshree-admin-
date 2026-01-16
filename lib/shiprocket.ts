
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL || 'test@matoshree.com';
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD || 'password';

let token: string | null = null;

async function authenticate() {
    if (token) return token;

    // TODO: Replace with actual API call
    console.log('Authenticating with Shiprocket...');
    // const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', { ... });

    token = 'mock-jwt-token-xyz';
    return token;
}

export async function createShipmentOrder(order: any) {
    const authToken = await authenticate();

    const payload = {
        order_id: order.id,
        order_date: new Date(order.created_at).toISOString().split('T')[0],
        pickup_location: 'Primary',
        billing_customer_name: order.address?.name || 'Guest',
        billing_last_name: '',
        billing_address: order.address?.address_line || '',
        billing_city: order.address?.city || '',
        billing_pincode: order.address?.pincode || '',
        billing_state: order.address?.state || '',
        billing_country: 'India',
        billing_email: order.user?.email || 'test@example.com',
        billing_phone: order.address?.phone || '9999999999',
        shipping_is_billing: true,
        order_items: order.items.map((item: any) => ({
            name: item.product?.name || 'Item',
            sku: item.product_id,
            units: item.quantity,
            selling_price: item.price,
            discount: '',
            tax: '',
            hsn: ''
        })),
        payment_method: order.payment_method === 'COD' ? 'COD' : 'Prepaid',
        sub_total: order.total_amount,
        length: 10, breadth: 10, height: 10, weight: 0.5
    };

    console.log('Creating Shiprocket Order with payload:', JSON.stringify(payload, null, 2));

    // Mock Response
    return {
        success: true,
        shipment_id: 7891011,
        order_id: 123456,
        awb_code: 'SR-AWB-9988776655',
        label_url: 'https://shiprocket.in/labels/sample.pdf'
    };
}
