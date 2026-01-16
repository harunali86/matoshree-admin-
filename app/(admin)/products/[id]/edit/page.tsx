'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getProducts, updateProduct, getCategories, getBrands, uploadImage } from '@/lib/actions';
import { ArrowLeft, Upload, Save, X, Image as ImageIcon, Loader2, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

interface Category { id: string; name: string; }
interface Brand { id: string; name: string; }

interface Variant {
    id: string; // temp id for UI
    color_name: string;
    color_code: string;
    images: string[];
    sku: string;
    stock: number;
}

const SIZES = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const variantFileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);

    const [activeTab, setActiveTab] = useState<'general' | 'retail' | 'wholesale'>('general');

    const [form, setForm] = useState({
        name: '', description: '', description_wholesale: '', price: '', sale_price: '', stock: '',
        images: [] as string[], sizes: [] as string[],
        category_id: '', brand_id: '', is_active: true, is_new_arrival: false, is_bestseller: false,
        price_wholesale: '', moq: '',
    });

    // Variants State
    const [variants, setVariants] = useState<Variant[]>([]);
    const [activeVariantId, setActiveVariantId] = useState<string | null>(null);

    const addVariant = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        setVariants([...variants, {
            id: newId,
            color_name: 'New Color',
            color_code: '#000000',
            images: [],
            sku: '',
            stock: 0
        }]);
    };

    const updateVariant = (id: string, field: keyof Variant, value: any) => {
        setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const removeVariant = (id: string) => {
        setVariants(variants.filter(v => v.id !== id));
    };

    // Specs State
    const [specs, setSpecs] = useState<{ key: string, value: string }[]>([]);

    const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
    const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
    const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = val;
        setSpecs(newSpecs);
    };

    // Price Tiers State
    const [priceTiers, setPriceTiers] = useState<{ min_quantity: string, unit_price: string, tier_name: string }[]>([]);

    const addTier = () => {
        setPriceTiers([...priceTiers, { min_quantity: '', unit_price: '', tier_name: `Bulk Tier ${priceTiers.length + 1}` }]);
    };
    const removeTier = (index: number) => setPriceTiers(priceTiers.filter((_, i) => i !== index));
    const updateTier = (index: number, field: string, value: string) => {
        const newTiers = [...priceTiers];
        (newTiers[index] as any)[field] = value;
        setPriceTiers(newTiers);
    };

    useEffect(() => {
        const loadData = async () => {
            const [products, cats, brnds] = await Promise.all([getProducts(), getCategories(), getBrands()]);
            setCategories(cats);
            setBrands(brnds);

            const product = products.find((p: any) => p.id === productId);
            if (product) {
                setForm({
                    name: product.name || '',
                    description: product.description || '',
                    description_wholesale: product.description_wholesale || '',
                    price: product.price?.toString() || '',
                    sale_price: product.sale_price?.toString() || '',
                    stock: product.stock?.toString() || '',
                    images: product.images || [],
                    sizes: product.sizes || [],
                    category_id: product.category_id || '',
                    brand_id: product.brand_id || '',
                    is_active: product.is_active ?? true,
                    is_new_arrival: product.is_new_arrival ?? false,
                    is_bestseller: product.is_bestseller ?? false,
                    price_wholesale: product.price_wholesale?.toString() || '',
                    moq: product.moq?.toString() || '',
                });

                // Populate Price Tiers
                if (product.price_tiers && product.price_tiers.length > 0) {
                    setPriceTiers(product.price_tiers.map((t: any) => ({
                        min_quantity: t.min_quantity.toString(),
                        unit_price: t.unit_price.toString(),
                        tier_name: t.tier_name || ''
                    })));
                }

                // Populate Specs
                if (product.specifications) {
                    setSpecs(Object.entries(product.specifications).map(([key, value]) => ({ key, value: value as string })));
                }

                // Populate Variants
                if (product.product_variants && product.product_variants.length > 0) {
                    setVariants(product.product_variants.map((v: any) => ({
                        id: v.id,
                        color_name: v.color_name,
                        color_code: v.color_code,
                        images: v.images || [],
                        sku: v.sku || '',
                        stock: v.stock || 0
                    })));
                } else if (product.colors && product.colors.length > 0) {
                    setVariants(product.colors.map((c: string, idx: number) => ({
                        id: `legacy-${idx}`,
                        color_name: c,
                        color_code: '#000000',
                        images: [],
                        sku: '',
                        stock: 0
                    })));
                }
            }
            setLoading(false);
        };
        loadData();
    }, [productId]);

    // Server-side image upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'variant') => {
        const files = e.target.files;
        if (!files?.length) return;

        setUploading(true);
        const newImages: string[] = [];

        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append('file', file);
            const result = await uploadImage(formData);
            if (result.success && result.url) {
                newImages.push(result.url);
            } else {
                alert('Image upload failed: ' + result.error);
            }
        }

        if (newImages.length > 0) {
            if (target === 'main') {
                setForm({ ...form, images: [...form.images, ...newImages] });
            } else if (target === 'variant' && activeVariantId) {
                const variant = variants.find(v => v.id === activeVariantId);
                if (variant) {
                    updateVariant(activeVariantId, 'images', [...variant.images, ...newImages]);
                }
            }
        }
        setUploading(false);
        if (target === 'main' && fileInputRef.current) fileInputRef.current.value = '';
        if (target === 'variant' && variantFileInputRef.current) variantFileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.price) {
            alert('Name and Price are required!');
            return;
        }

        setSaving(true);

        const specsObj: Record<string, string> = {};
        specs.forEach(s => {
            if (s.key.trim() && s.value.trim()) {
                specsObj[s.key.trim()] = s.value.trim();
            }
        });

        const cleanVariants = variants.map(({ id, ...rest }) => rest);
        const colorNames = variants.length > 0 ? variants.map(v => v.color_name) : [];

        const result = await updateProduct(productId, {
            name: form.name,
            description: form.description,
            description_wholesale: form.description_wholesale,
            price: parseFloat(form.price),
            sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
            stock: parseInt(form.stock) || 0,
            thumbnail: form.images[0] || (variants[0]?.images[0] || ''),
            images: form.images,
            colors: colorNames,
            sizes: form.sizes,
            category_id: form.category_id || null,
            brand_id: form.brand_id || null,
            is_active: form.is_active,
            is_new_arrival: form.is_new_arrival,
            is_bestseller: form.is_bestseller,
            is_on_sale: !!form.sale_price,
            price_wholesale: form.price_wholesale ? parseFloat(form.price_wholesale) : null,
            moq: form.moq ? parseInt(form.moq) : 1,
            price_tiers: priceTiers
                .filter((t: any) => t.min_quantity && t.unit_price)
                .map((t: any) => ({
                    min_quantity: parseInt(t.min_quantity),
                    max_quantity: null,
                    unit_price: parseFloat(t.unit_price),
                    tier_name: t.tier_name
                })),
            specifications: specsObj,
            variants: cleanVariants
        });

        if (result.success) {
            router.push('/products');
        } else {
            alert('Error updating product: ' + result.error);
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><div className="loader"></div></div>;
    }

    return (
        <div className="page animate-fadeIn">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Link href="/products" className="btn btn-secondary" style={{ padding: 10 }}><ArrowLeft size={18} /></Link>
                <div>
                    <h1 className="page-title">Edit Product</h1>
                    <p className="page-subtitle">Update product details</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6">

                {/* TABS */}
                <div className="flex gap-4 border-b border-slate-800 mb-6">
                    {['general', 'retail', 'wholesale'].map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setActiveTab(t as any)}
                            className={`pb-3 px-4 text-sm font-medium capitalize transition-colors border-b-2 ${activeTab === t
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {t} Details
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <>
                                {/* Basic Info */}
                                <div className="card">
                                    <div className="card-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>Core Information</h3></div>
                                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>Product Name *</label>
                                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Nike Air Max 270" required className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Specifications */}
                                <div className="card">
                                    <div className="card-header flex justify-between items-center">
                                        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>Product Specifications</h3>
                                        <button type="button" onClick={addSpec} className="text-blue-400 hover:text-blue-300 text-sm font-medium">+ Add Detail</button>
                                    </div>
                                    <div className="card-body space-y-3">
                                        {specs.map((spec, i) => (
                                            <div key={i} className="flex gap-3">
                                                <input
                                                    value={spec.key}
                                                    onChange={(e) => updateSpec(i, 'key', e.target.value)}
                                                    placeholder="Label (e.g. Material)"
                                                    className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                                                />
                                                <input
                                                    value={spec.value}
                                                    onChange={(e) => updateSpec(i, 'value', e.target.value)}
                                                    placeholder="Value (e.g. Cotton)"
                                                    className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                                                />
                                                <button type="button" onClick={() => removeSpec(i)} className="text-slate-500 hover:text-red-400 p-2">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {specs.length === 0 && (
                                            <p className="text-slate-500 text-sm text-center py-2">No specifications added yet.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Images */}
                                <div className="card">
                                    <div className="card-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}><ImageIcon size={18} /> Main Images</h3></div>
                                    <div className="card-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                            {form.images.map((img, i) => (
                                                <div key={i} style={{ position: 'relative', aspectRatio: '1', background: '#1f2937', borderRadius: 8, overflow: 'hidden' }}>
                                                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })} style={{ position: 'absolute', top: 4, right: 4, padding: 4, background: '#ef4444', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                                                        <X size={12} style={{ color: 'white' }} />
                                                    </button>
                                                </div>
                                            ))}
                                            {form.images.length < 4 && (
                                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ aspectRatio: '1', border: '2px dashed #374151', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent', cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.5 : 1 }}>
                                                    {uploading ? <Loader2 size={20} style={{ color: '#6b7280', animation: 'spin 1s linear infinite' }} /> : <Upload size={20} style={{ color: '#6b7280' }} />}
                                                    <span style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{uploading ? 'Uploading...' : 'Add'}</span>
                                                </button>
                                            )}
                                        </div>
                                        <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'main')} accept="image/*" multiple style={{ display: 'none' }} />
                                    </div>
                                </div>

                                {/* Variants */}
                                <div className="card">
                                    <div className="card-header flex justify-between items-center">
                                        <h2 className="text-lg font-semibold text-white">Variants (Colors)</h2>
                                        <button type="button" onClick={addVariant} className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                                            <Plus size={16} /> Add Variant
                                        </button>
                                    </div>
                                    <div className="card-body space-y-6">
                                        {variants.length === 0 && <div className="text-gray-500 text-sm text-center py-4">No variants added.</div>}
                                        {variants.map((variant, index) => (
                                            <div key={variant.id} className="p-4 bg-slate-900 border border-slate-700 rounded-lg">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Variant #{index + 1}</h4>
                                                    <button type="button" onClick={() => removeVariant(variant.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Color Name</label>
                                                        <input value={variant.color_name} onChange={(e) => updateVariant(variant.id, 'color_name', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Color Code</label>
                                                        <div className="flex gap-2">
                                                            <input type="color" value={variant.color_code} onChange={(e) => updateVariant(variant.id, 'color_code', e.target.value)} className="h-9 w-12 bg-transparent border-none p-0 cursor-pointer" />
                                                            <input value={variant.color_code} onChange={(e) => updateVariant(variant.id, 'color_code', e.target.value)} className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-sm text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-2">Images</label>
                                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                                        {variant.images.map((img, i) => (
                                                            <div key={i} className="relative w-16 h-16 flex-shrink-0 bg-gray-800 rounded overflow-hidden group">
                                                                <img src={img} className="w-full h-full object-cover" />
                                                                <button type="button" onClick={() => updateVariant(variant.id, 'images', variant.images.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 p-1 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                                                            </div>
                                                        ))}
                                                        <button type="button" onClick={() => { setActiveVariantId(variant.id); variantFileInputRef.current?.click(); }} className="w-16 h-16 border border-dashed border-gray-600 rounded flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-400 transition-colors"><Upload size={14} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <input type="file" ref={variantFileInputRef} onChange={(e) => handleFileUpload(e, 'variant')} accept="image/*" multiple style={{ display: 'none' }} />
                                </div>
                            </>
                        )}

                        {/* RETAIL TAB */}
                        {activeTab === 'retail' && (
                            <>
                                <div className="card border-blue-500/20 shadow-lg shadow-blue-500/5">
                                    <div className="card-header bg-blue-500/10"><h3 style={{ fontSize: 16, fontWeight: 600, color: '#60a5fa' }}>Retail Settings</h3></div>
                                    <div className="card-body space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-2">Retail Price (₹)</label>
                                                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="9999" required className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white text-lg font-bold" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-2">Sale Price (₹)</label>
                                                <input type="number" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} placeholder="7999" className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">Retail Description</label>
                                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Customer-facing description..." className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white h-32 resize-none" />
                                            <p className="text-xs text-slate-500 mt-1">Visible to retail customers in the mobile app.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">Available Sizes</label>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                {SIZES.map((s) => (
                                                    <button key={s} type="button" onClick={() => setForm({ ...form, sizes: form.sizes.includes(s) ? form.sizes.filter(x => x !== s) : [...form.sizes, s] })} className={`px-4 py-2 rounded-lg border text-sm transition-all ${form.sizes.includes(s) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* WHOLESALE TAB */}
                        {activeTab === 'wholesale' && (
                            <>
                                <div className="card border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                                    <div className="card-header bg-indigo-500/10"><h3 style={{ fontSize: 16, fontWeight: 600, color: '#818cf8' }}>B2B / Wholesale Settings</h3></div>
                                    <div className="card-body space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-2">Wholesale Price (₹)</label>
                                                <input type="number" value={(form as any).price_wholesale || ''} onChange={(e) => setForm({ ...form, price_wholesale: e.target.value } as any)} placeholder="Base B2B Price" className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-2">MOQ (Min Order Qty)</label>
                                                <input type="number" value={(form as any).moq || ''} onChange={(e) => setForm({ ...form, moq: e.target.value } as any)} placeholder="Default: 10" className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">Wholesale Description (Technical/Bulk Info)</label>
                                            <textarea value={(form as any).description_wholesale || ''} onChange={(e) => setForm({ ...form, description_wholesale: e.target.value } as any)} placeholder="Details for dealers (packing, weight, etc)..." className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white h-32 resize-none" />
                                            <p className="text-xs text-slate-500 mt-1">Visible ONLY to verified wholesale dealers.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Volume Pricing */}
                                <div className="card">
                                    <div className="card-header flex justify-between items-center">
                                        <h2 className="text-lg font-semibold text-white">Volume Discount Rules</h2>
                                        <button type="button" onClick={addTier} className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">+ Add Tier</button>
                                    </div>
                                    <div className="card-body space-y-4">
                                        {priceTiers.map((tier, index) => (
                                            <div key={index} className="flex items-end gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                                <div className="flex-1">
                                                    <div style={{ marginBottom: 4, fontSize: 13, color: '#9ca3af' }}>Tier Name</div>
                                                    <input value={tier.tier_name} onChange={(e) => updateTier(index, 'tier_name', e.target.value)} placeholder="e.g. Gold Tier" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
                                                </div>
                                                <div className="w-24">
                                                    <div style={{ marginBottom: 4, fontSize: 13, color: '#9ca3af' }}>Min Qty</div>
                                                    <input type="number" value={tier.min_quantity} onChange={(e) => updateTier(index, 'min_quantity', e.target.value)} placeholder="10" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
                                                </div>
                                                <div className="w-32">
                                                    <div style={{ marginBottom: 4, fontSize: 13, color: '#9ca3af' }}>Unit Price (₹)</div>
                                                    <input type="number" value={tier.unit_price} onChange={(e) => updateTier(index, 'unit_price', e.target.value)} placeholder="850" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
                                                </div>
                                                <button type="button" onClick={() => removeTier(index)} style={{ padding: 10, color: '#9ca3af', marginBottom: 2, cursor: 'pointer' }}><Trash2 size={18} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Organization */}
                        <div className="card">
                            <div className="card-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>Organization</h3></div>
                            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Category</label>
                                    <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full bg-slate-900 border-slate-700 text-slate-300 rounded p-2">
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Brand</label>
                                    <select value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })} className="w-full bg-slate-900 border-slate-700 text-slate-300 rounded p-2">
                                        <option value="">Select Brand</option>
                                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Visibility */}
                        <div className="card">
                            <div className="card-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>Visibility</h3></div>
                            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[{ key: 'is_active', label: 'Active (visible)' }, { key: 'is_new_arrival', label: 'New Arrival' }, { key: 'is_bestseller', label: 'Bestseller' }].map(({ key, label }) => (
                                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} style={{ width: 18, height: 18 }} />
                                        <span style={{ fontSize: 14, color: '#e2e8f0' }}>{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Stock (Quick Access) */}
                        <div className="card">
                            <div className="card-body">
                                <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Total Stock (Global)</label>
                                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full bg-slate-900 border-slate-700 text-slate-300 rounded p-2" />
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14 }} disabled={saving || uploading}>
                                <Save size={18} style={{ marginRight: 8 }} /> {saving ? 'Saving...' : 'Update Product'}
                            </button>
                            <Link href="/products" className="btn btn-secondary" style={{ width: '100%', padding: 14, textAlign: 'center' }}>Cancel</Link>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
