-- Enterprise Upgrade Phase 1: Foundation Schema

-- 1. Business Profiles (Extension of Profiles for B2B)
CREATE TABLE IF NOT EXISTS business_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    gst_number TEXT,
    pan_number TEXT,
    business_type TEXT CHECK (business_type IN ('retailer', 'wholesaler', 'distributor')),
    credit_limit DECIMAL(12, 2) DEFAULT 0.00,
    credit_balance DECIMAL(12, 2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_docs JSONB DEFAULT '[]'::jsonb, -- URLs to uploaded docs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for business_profiles
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for business_profiles
CREATE POLICY "Users can view own business profile" ON business_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own business profile" ON business_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Price Tiers (Volume Pricing)
CREATE TABLE IF NOT EXISTS price_tiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER, -- NULL means "and above"
    unit_price DECIMAL(10, 2) NOT NULL,
    tier_name TEXT, -- e.g., "Bulk Tier 1"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for price_tiers
ALTER TABLE price_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view price tiers" ON price_tiers FOR SELECT USING (true);
-- Admin write access managed via service role key in application

-- 3. App Config (CMS & System Control)
CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for app_config
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view app config" ON app_config FOR SELECT USING (true);

-- 4. Initial Seed for App Config
INSERT INTO app_config (key, value, description) VALUES
(
    'home_layout',
    '[
        {"id": "hero_banner", "visible": true, "order": 1},
        {"id": "categories", "visible": true, "order": 2},
        {"id": "flash_sale", "visible": true, "order": 3},
        {"id": "brands", "visible": true, "order": 4},
        {"id": "new_arrivals", "visible": true, "order": 5},
        {"id": "collections", "visible": true, "order": 6},
        {"id": "best_sellers", "visible": true, "order": 7}
    ]'::jsonb,
    'Order and visibility of sections on the mobile app home screen'
),
(
    'system_settings',
    '{
        "maintenance_mode": false,
        "min_app_version": "1.0.0",
        "enable_cod": true,
        "enable_b2b_credit": false
    }'::jsonb,
    'Global system toggles and version control'
)
ON CONFLICT (key) DO NOTHING;

-- 5. Quotations (For B2B Custom Orders)
CREATE TABLE IF NOT EXISTS quotations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    items JSONB NOT NULL, -- Array of {product_id, quantity, requested_price}
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'converted_to_order')),
    total_amount DECIMAL(12, 2),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own quotations" ON quotations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create quotations" ON quotations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_profiles_updated_at
    BEFORE UPDATE ON business_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
    BEFORE UPDATE ON quotations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
