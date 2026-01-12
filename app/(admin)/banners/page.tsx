'use client';

import { useEffect, useState, useRef } from 'react';
import { getBanners, createBanner, updateBanner, deleteBanner, uploadImage } from '@/lib/actions';
import { Plus, Search, Pencil, Trash2, Image, X, Eye, EyeOff, ExternalLink, Loader2 } from 'lucide-react';

interface Banner { id: string; title: string; subtitle: string; image_url: string; link_url: string; is_active: boolean; display_order: number; }

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Banner | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({ title: '', subtitle: '', image_url: '', link_url: '', is_active: true, display_order: 0 });

    useEffect(() => { fetchBanners(); }, []);

    const fetchBanners = async () => { const data = await getBanners(); setBanners(data); setLoading(false); };

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
        if (!form.title || !form.image_url) return alert('Title and Image required');
        if (editing) await updateBanner(editing.id, form);
        else await createBanner(form);
        fetchBanners();
        closeModal();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this banner?')) return;
        await deleteBanner(id);
        setBanners(banners.filter(b => b.id !== id));
    };

    const toggleActive = async (id: string, current: boolean) => {
        await updateBanner(id, { is_active: !current });
        setBanners(banners.map(b => b.id === id ? { ...b, is_active: !current } : b));
    };

    const openEdit = (b: Banner) => {
        setEditing(b);
        setForm({ title: b.title || '', subtitle: b.subtitle || '', image_url: b.image_url || '', link_url: b.link_url || '', is_active: b.is_active, display_order: b.display_order || 0 });
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditing(null); setForm({ title: '', subtitle: '', image_url: '', link_url: '', is_active: true, display_order: 0 }); };

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Banners</h1>
                    <p className="page-subtitle">Manage homepage banners and promotions</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={18} /> Add Banner</button>
            </div>

            {/* Stats */}
            <div className="grid-3">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}><Image size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{banners.length}</div>
                    <div className="stat-label">Total Banners</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><Eye size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{banners.filter(b => b.is_active).length}</div>
                    <div className="stat-label">Active</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6b7280, #4b5563)' }}><EyeOff size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{banners.filter(b => !b.is_active).length}</div>
                    <div className="stat-label">Inactive</div>
                </div>
            </div>

            {/* Banners Grid */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader"></div></div>
            ) : banners.length === 0 ? (
                <div className="card"><div className="empty-state">
                    <div className="empty-icon"><Image size={32} style={{ color: '#6b7280' }} /></div>
                    <p style={{ color: 'white', fontWeight: 500 }}>No banners yet</p>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: 16 }}><Plus size={16} /> Add Banner</button>
                </div></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                    {banners.map((banner) => (
                        <div key={banner.id} className="card" style={{ overflow: 'hidden' }}>
                            <div style={{ position: 'relative', height: 180, background: '#1f2937' }}>
                                {banner.image_url ? (
                                    <img src={banner.image_url} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Image size={40} style={{ color: '#374151' }} /></div>
                                )}
                                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                                    <button onClick={() => toggleActive(banner.id, banner.is_active)} className={`badge ${banner.is_active ? 'badge-success' : 'badge-error'}`} style={{ cursor: 'pointer', border: 'none' }}>
                                        {banner.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 4 }}>{banner.title || 'Untitled'}</h3>
                                <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>{banner.subtitle || 'No subtitle'}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: '#6b7280' }}>Order: {banner.display_order || 0}</span>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {banner.link_url && <a href={banner.link_url} target="_blank" className="action-btn"><ExternalLink size={14} style={{ color: '#9ca3af' }} /></a>}
                                        <button className="action-btn" onClick={() => openEdit(banner)}><Pencil size={14} style={{ color: '#9ca3af' }} /></button>
                                        <button className="action-btn" onClick={() => handleDelete(banner.id)}><Trash2 size={14} style={{ color: '#f87171' }} /></button>
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
                    <div className="card" style={{ position: 'relative', width: '100%', maxWidth: 500, padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'white' }}>{editing ? 'Edit Banner' : 'Add Banner'}</h2>
                            <button onClick={closeModal} className="action-btn"><X size={18} style={{ color: '#9ca3af' }} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Image Upload */}
                            <div>
                                <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Banner Image *</label>
                                <div style={{ position: 'relative', height: 150, background: '#1f2937', borderRadius: 8, overflow: 'hidden', border: '2px dashed #374151' }}>
                                    {form.image_url ? (
                                        <>
                                            <img src={form.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button onClick={() => setForm({ ...form, image_url: '' })} style={{ position: 'absolute', top: 8, right: 8, padding: 4, background: '#ef4444', border: 'none', borderRadius: 4, cursor: 'pointer' }}><X size={14} style={{ color: 'white' }} /></button>
                                        </>
                                    ) : (
                                        <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                            {uploading ? <Loader2 size={24} style={{ color: '#6b7280', animation: 'spin 1s linear infinite' }} /> : <Image size={24} style={{ color: '#6b7280' }} />}
                                            <span style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>{uploading ? 'Uploading...' : 'Click to upload'}</span>
                                        </button>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} />
                            </div>
                            <div><label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Banner title" /></div>
                            <div><label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Subtitle</label><input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Banner subtitle" /></div>
                            <div><label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Link URL</label><input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Display Order</label><input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} /></div>
                                <div style={{ display: 'flex', alignItems: 'end' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', paddingBottom: 10 }}><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} style={{ width: 18, height: 18 }} /><span style={{ color: '#e2e8f0' }}>Active</span></label>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                <button onClick={closeModal} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button onClick={handleSubmit} className="btn btn-primary" style={{ flex: 1 }} disabled={uploading}>{editing ? 'Update' : 'Create'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
