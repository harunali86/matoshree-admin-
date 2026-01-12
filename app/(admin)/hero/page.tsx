'use client';

import { useEffect, useState, useRef } from 'react';
import { getHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide, getProducts, uploadImage } from '@/lib/actions';
import { Plus, Pencil, Trash2, Image, X, Eye, EyeOff, Loader2 } from 'lucide-react';

interface HeroSlide { id: string; title: string; subtitle: string; image_url: string; product_id: string | null; is_active: boolean; display_order: number; product?: { name: string; price: number; } }
interface Product { id: string; name: string; price: number; }

export default function HeroPage() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<HeroSlide | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({ title: '', subtitle: '', image_url: '', product_id: '', is_active: true, display_order: 0 });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const [sData, pData] = await Promise.all([getHeroSlides(), getProducts()]);
        setSlides(sData);
        setProducts(pData);
        setLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        const result = await uploadImage(formData);
        if (result.success && result.url) {
            setForm({ ...form, image_url: result.url });
        } else {
            alert('Upload failed: ' + result.error);
        }
        setUploading(false);
    };

    const handleSubmit = async () => {
        if (!form.image_url) return alert('Image is required');

        // Auto-fill title from product if generic
        let finalTitle = form.title;
        if (!finalTitle && form.product_id) {
            const prod = products.find(p => p.id === form.product_id);
            if (prod) finalTitle = prod.name;
        }

        const payload = {
            ...form,
            title: finalTitle,
            product_id: form.product_id || null // Convert empty string to null for UUID
        };

        if (editing) await updateHeroSlide(editing.id, payload);
        else await createHeroSlide(payload);

        loadData();
        closeModal();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this slide?')) return;
        await deleteHeroSlide(id);
        setSlides(slides.filter(s => s.id !== id));
    };

    const openEdit = (s: HeroSlide) => {
        setEditing(s);
        setForm({ title: s.title || '', subtitle: s.subtitle || '', image_url: s.image_url || '', product_id: s.product_id || '', is_active: s.is_active, display_order: s.display_order || 0 });
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditing(null); setForm({ title: '', subtitle: '', image_url: '', product_id: '', is_active: true, display_order: 0 }); };

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Hero Slides</h1>
                    <p className="page-subtitle">Manage app home screen carousel</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={18} /> Add Slide</button>
            </div>

            {/* Stats */}
            <div className="grid-3">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><Image size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{slides.length}</div>
                    <div className="stat-label">Total Slides</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><Eye size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{slides.filter(s => s.is_active).length}</div>
                    <div className="stat-label">Active</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6b7280, #4b5563)' }}><EyeOff size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{slides.filter(s => !s.is_active).length}</div>
                    <div className="stat-label">Inactive</div>
                </div>
            </div>

            {/* Slides Interface */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader"></div></div>
            ) : slides.length === 0 ? (
                <div className="card"><div className="empty-state">
                    <div className="empty-icon"><Image size={32} style={{ color: '#6b7280' }} /></div>
                    <p style={{ color: 'white', fontWeight: 500 }}>No hero slides yet</p>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: 16 }}><Plus size={16} /> Add Slide</button>
                </div></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                    {slides.map((slide) => (
                        <div key={slide.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ position: 'relative', height: 160, background: '#1f2937' }}>
                                <img src={slide.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                                    <span className={`badge ${slide.is_active ? 'badge-success' : 'badge-error'}`}>
                                        {slide.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 16px 12px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                    <h3 style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>{slide.title || 'Untitled'}</h3>
                                    {slide.subtitle && <p style={{ color: '#d1d5db', fontSize: 12 }}>{slide.subtitle}</p>}
                                </div>
                            </div>

                            <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'space-between' }}>
                                {slide.product ? (
                                    <div style={{ padding: '8px 12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }}></div>
                                        <div>
                                            <p style={{ fontSize: 11, color: '#93c5fd', fontWeight: 600, textTransform: 'uppercase' }}>Linked Product</p>
                                            <p style={{ fontSize: 13, color: 'white' }}>{slide.product.name}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ padding: '8px 12px', background: '#1f2937', borderRadius: 8 }}>
                                        <p style={{ fontSize: 12, color: '#9ca3af' }}>No product linked</p>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #1f2937' }}>
                                    <span style={{ fontSize: 12, color: '#6b7280' }}>Order: {slide.display_order}</span>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="action-btn" onClick={() => openEdit(slide)}><Pencil size={14} style={{ color: '#9ca3af' }} /></button>
                                        <button className="action-btn" onClick={() => handleDelete(slide.id)}><Trash2 size={14} style={{ color: '#f87171' }} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={closeModal} />
                    <div className="card" style={{ position: 'relative', width: '100%', maxWidth: 500, padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'white' }}>{editing ? 'Edit Slide' : 'New Hero Slide'}</h2>
                            <button onClick={closeModal} className="action-btn"><X size={20} style={{ color: '#9ca3af' }} /></button>
                        </div>

                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Image Upload */}
                            <div>
                                <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Banner Image *</label>
                                <div style={{ position: 'relative', height: 160, background: '#111827', borderRadius: 12, overflow: 'hidden', border: '1px dashed #374151' }}>
                                    {form.image_url ? (
                                        <>
                                            <img src={form.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button onClick={() => setForm({ ...form, image_url: '' })} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer' }}><X size={16} style={{ color: 'white' }} /></button>
                                        </>
                                    ) : (
                                        <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                            {uploading ? <Loader2 size={24} style={{ color: '#6b7280', animation: 'spin 1s linear infinite' }} /> : <Image size={24} style={{ color: '#6b7280' }} />}
                                            <span style={{ fontSize: 13, color: '#6b7280', marginTop: 10 }}>{uploading ? 'Uploading...' : 'Click to upload image'}</span>
                                        </button>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} />
                                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>Recommended Size: 1920x1080 or 800x600 px</p>
                            </div>

                            {/* Linked Product */}
                            <div>
                                <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Link Product (Optional)</label>
                                <select
                                    value={form.product_id}
                                    onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                                    style={{ width: '100%', height: 42, padding: '0 12px', background: '#111827', border: '1px solid #374151', borderRadius: 8, color: 'white', fontSize: 14 }}
                                >
                                    <option value="">Select a product...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                                    ))}
                                </select>
                                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>If selected, clicking the banner will open this product.</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div><label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Title (Overlay)</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Summer Sale" style={{ width: '100%', height: 42, padding: '0 12px', background: '#111827', border: '1px solid #374151', borderRadius: 8, color: 'white' }} /></div>
                                <div><label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Subtitle</label><input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="e.g. Up to 50% Off" style={{ width: '100%', height: 42, padding: '0 12px', background: '#111827', border: '1px solid #374151', borderRadius: 8, color: 'white' }} /></div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <div><label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Order</label><input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} style={{ width: 60, height: 36, textAlign: 'center', background: '#111827', border: '1px solid #374151', borderRadius: 8, color: 'white' }} /></div>
                                    <div style={{ display: 'flex', alignItems: 'center', paddingTop: 18 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} style={{ width: 18, height: 18 }} /><span style={{ color: '#e2e8f0', fontSize: 14 }}>Active</span></label>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, paddingTop: 12 }}>
                                <button onClick={closeModal} className="btn btn-secondary" style={{ flex: 1, height: 44 }}>Cancel</button>
                                <button onClick={handleSubmit} className="btn btn-primary" style={{ flex: 1, height: 44 }} disabled={uploading}>{editing ? 'Update Slide' : 'Create Slide'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
