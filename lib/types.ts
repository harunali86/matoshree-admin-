
export interface Order {
    id: string;
    invoice_number?: string;
    created_at: string;
    total_amount: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | string;
    payment_method: string;
    payment_status?: 'Pending' | 'Paid' | 'Failed';
    user_id?: string;

    // B2B & Enterprise
    is_wholesale?: boolean;
    po_number?: string;
    gst_invoice_url?: string;
    address_id?: string;

    // Relations (Joined Data)
    items?: {
        quantity: number;
        size: number | string;
        price?: number;
        product?: { name: string; thumbnail?: string; price?: number }
    }[];
    address?: any; // Address object
    user?: any;    // Profile/User object
    history?: any[]; // For Admin View
}

export interface Product {
    id: string;
    name: string;
    price: number;
    sale_price: number | null;
    stock: number;
    thumbnail: string | null;
    // B2B
    price_wholesale?: number | null;
    moq?: number | null;
    price_tiers?: PriceTier[];
    specifications?: Record<string, string> | null;
}

export interface Customer {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    role?: string;
    is_verified?: boolean;
    // Enterprise
    business_name?: string;
    gst_number?: string;
    credit_limit?: number;
    credit_balance?: number;
}

export interface PriceTier {
    id: string;
    product_id: string;
    min_quantity: number;
    max_quantity: number | null;
    unit_price: number;
    tier_name: string | null;
}

export interface AppConfig {
    key: string;
    value: any;
    updated_at: string;
}

export interface Quotation {
    id: string;
    customer_id: string;
    items: any[];
    total_amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'converted';
    valid_until: string;
    created_at: string;
    profile?: any;
}


