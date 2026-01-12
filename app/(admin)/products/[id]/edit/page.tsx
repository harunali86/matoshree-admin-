'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getProducts, updateProduct, getCategories, getBrands, uploadImage } from '@/lib/actions';
import { ArrowLeft, Upload, Save, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Category { id: string; name: string; }
interface Brand { id: string; name: string; }

const COLORS = [
    { name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' },
    { name: 'Red', hex: '#EF4444' }, { name: 'Blue', hex: '#3B82F6' },
    { name: 'Green', hex: '#22C55E' }, { name: 'Brown', hex: '#92400E' },
];

const SIZES = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);

    const [form, setForm] = useState({
        name: '', description: '', price: '', sale_price: '', stock: '',
        images: [] as string[], colors: [] as string[], sizes: [] as string[],
        category_id: '', brand_id: '', is_active: true, is_new_arrival: false, is_bestseller: false,
    });

    useEffect(() => { loadData(); }, [productId]);

    const loadData = async () => {
        const [products, cats, brnds] = await Promise.all([getProducts(), getCategories(), getBrands()]);
        setCategories(cats);
        setBrands(brnds);

        const product = products.find((p: any) => p.id === productId);
        if (product) {
            setForm({
                name: product.name || '',
                description: product.description || '',
                price: product.price?.toString() || '',
                sale_price: product.sale_price?.toString() || '',
                stock: product.stock?.toString() || '',
                images: product.images || [],
                colors: product.colors || [],
                sizes: product.sizes || [],
                category_id: product.category_id || '',
                brand_id: product.brand_id || '',
                is_active: product.is_active ?? true,
                is_new_arrival: product.is_new_arrival ?? false,
                is_bestseller: product.is_bestseller ?? false,
            });
        }
        setLoading(false);
    };

    // Server-side image upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            setForm({ ...form, images: [...form.images, ...newImages] });
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.price) {
            alert('Name and Price are required!');
            return;
        }

        setSaving(true);

        const result = await updateProduct(productId, {
            name: form.name,
            description: form.description,
            price: parseFloat(form.price),
            sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
            stock: parseInt(form.stock) || 0,
            thumbnail: form.images[0] || '',
            images: form.images,
            colors: form.colors,
            sizes: form.sizes,
            category_id: form.category_id || null,
            brand_id: form.brand_id || null,
            is_active: form.is_active,
            is_new_arrival: form.is_new_arrival,
            is_bestseller: form.is_bestseller,
            is_on_sale: !!form.sale_price,
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
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Link href="/products" className="btn btn-secondary" style={{ padding: 10 }}><ArrowLeft size={18} /></Link>
                <div>
                    <h1 className="page-title">Edit Product</h1>
                    <p className="page-subtitle">Update product details</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
                    {/* Left */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Basic Info */}
                        <div className="card">
                            <div className="card-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>Basic Information</h3></div>
                            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>Product Name *</label>
                                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Nike Air Max 270" required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>Description</label>
                                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product details..." style={{ height: 120, resize: 'none', padding: 12 }} />
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="card">
                            <div className="card-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}><ImageIcon size={18} /> Product Images</h3></div>
                            <div className="card-body">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                    {form.images.map((img, i) => (
                                        <div key={i} style={{ position: 'relative', aspectRatio: '1', background: '#1f2937', borderRadius: 8, overflow: 'hidden' }}>
                                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })} style={{ position: 'absolute', top: 4, right: 4, padding: 4, background: '#ef4444', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                                                <X size={12} style={{ color: 'white' }} />
                                            </button>
                                            {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '4px 0', textAlign: 'center', fontSize: 10, color: 'white' }}>Main</div>}
                                        </div>
                                    ))}
                                    {form.images.length < 4 && (
                                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ aspectRatio: '1', border: '2px dashed #374151', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent', cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.5 : 1 }}>
                                            {uploading ? <Loader2 size={20} style={{ color: '#6b7280', animation: 'spin 1s linear infinite' }} /> : <Upload size={20} style={{ color: '#6b7280' }} />}
                                            <span style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{uploading ? 'Uploading...' : 'Add'}</span>
                                        </button>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" multiple style={{ display: 'none' }} />
                            </div>
                        </div>

                        {/* Colors */}
                        <div className="card">
                            <div className="card-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>Colors</h3></div>
                            <div className="card-body">
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {COLORS.map((c) => (
                                        <button key={c.name} type="button" onClick={() => setForm({ ...form, colors: form.colors.includes(c.name) ? form.colors.filter(x => x !== c.name) : [...form.colors, c.name] })} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: form.colors.includes(c.name) ? '2px solid #3b82f6' : '1px solid #374151', borderRadius: 8, background: form.colors.includes(c.name) ? 'rgba(59,130,246,0.1)' : 'transparent', cursor: 'pointer' }}>
                                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: c.hex, border: '1px solid #374151' }} />
                                            <span style={{ fontSize: 13, color: 'white' }}>{c.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sizes */}
                        <div className="card">
                            <div className="card-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>Sizes</h3></div>
                            <div className="card-body">
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {SIZES.map((s) => (
                                        <button key={s} type="button" onClick={() => setForm({ ...form, sizes: form.sizes.includes(s) ? form.sizes.filter(x => x !== s) : [...form.sizes, s] })} style={{ padding: '8px 16px', border: form.sizes.includes(s) ? '2px solid #3b82f6' : '1px solid #374151', borderRadius: 8, background: form.sizes.includes(s) ? '#3b82f6' : 'transparent', color: 'white', cursor: 'pointer', fontSize: 13 }}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Pricing */}
                        <div className="card">
                            <div className="card-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>Pricing</h3></div>
                            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Price (₹) *</label>
                                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="9999" required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Sale Price (₹)</label>
                                    <input type="number" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} placeholder="7999" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Stock</label>
                                    <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        {/* Organization */}
                        <div className="card">
                            <div className="card-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>Organization</h3></div>
                            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Category</label>
                                    <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Brand</label>
                                    <select value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })}>
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
                                {[{ key: 'is_active', label: 'Active (visible in app)' }, { key: 'is_new_arrival', label: 'New Arrival' }, { key: 'is_bestseller', label: 'Bestseller' }].map(({ key, label }) => (
                                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} style={{ width: 18, height: 18 }} />
                                        <span style={{ fontSize: 14, color: '#e2e8f0' }}>{label}</span>
                                    </label>
                                ))}
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
