'use client';

import { useEffect, useState, useRef } from 'react';
import { getBrands, createBrand, updateBrand, deleteBrand, uploadImage } from '@/lib/actions';
import { Plus, Search, Pencil, Trash2, Tag, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface Brand { id: string; name: string; logo_url?: string; }

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Brand | null>(null);
    const [name, setName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchBrands(); }, []);

    const fetchBrands = async () => {
        const data = await getBrands();
        setBrands(data);
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
            setLogoUrl(result.url);
        } else {
            alert('Upload failed: ' + result.error);
        }
        setUploading(false);
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;
        if (editing) await updateBrand(editing.id, { name, logo_url: logoUrl });
        else await createBrand({ name, logo_url: logoUrl });
        fetchBrands();
        closeModal();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete?')) return;
        await deleteBrand(id);
        setBrands(brands.filter(b => b.id !== id));
    };

    const openEdit = (brand: Brand) => {
        setEditing(brand);
        setName(brand.name);
        setLogoUrl(brand.logo_url || '');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setName('');
        setLogoUrl('');
    };

    const filtered = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Brands</h1>
                    <p className="page-subtitle">Manage product brands</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={18} /> Add Brand</button>
            </div>

            <div className="card">
                <div style={{ padding: 16 }}>
                    <div className="input-group">
                        <Search size={18} className="input-icon" />
                        <input placeholder="Search brands..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-with-icon" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader"></div></div>
            ) : filtered.length === 0 ? (
                <div className="card"><div className="empty-state">
                    <div className="empty-icon"><Tag size={32} style={{ color: '#6b7280' }} /></div>
                    <p style={{ color: 'white', fontWeight: 500 }}>No brands found</p>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: 16 }}><Plus size={16} /> Add Brand</button>
                </div></div>
            ) : (
                <div className="grid-4">
                    {filtered.map((brand) => (
                        <div key={brand.id} className="card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ width: 60, height: 60, background: 'white', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #374151' }}>
                                    {brand.logo_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={brand.logo_url} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                                    ) : (
                                        <Tag size={22} style={{ color: '#9ca3af' }} />
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button className="action-btn" onClick={() => openEdit(brand)}><Pencil size={14} style={{ color: '#9ca3af' }} /></button>
                                    <button className="action-btn" onClick={() => handleDelete(brand.id)}><Trash2 size={14} style={{ color: '#f87171' }} /></button>
                                </div>
                            </div>
                            <h3 style={{ marginTop: 16, fontWeight: 600, color: 'white', textAlign: 'center' }}>{brand.name}</h3>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={closeModal} />
                    <div className="card" style={{ position: 'relative', width: '100%', maxWidth: 420, padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'white' }}>{editing ? 'Edit Brand' : 'Add Brand'}</h2>
                            <button onClick={closeModal} className="action-btn"><X size={18} style={{ color: '#9ca3af' }} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Logo Upload */}
                            <div>
                                <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Brand Logo</label>
                                <div style={{ position: 'relative', height: 100, background: '#1f2937', borderRadius: 8, overflow: 'hidden', border: '2px dashed #374151' }}>
                                    {logoUrl ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, background: 'white' }} />
                                            <button onClick={() => setLogoUrl('')} style={{ position: 'absolute', top: 4, right: 4, padding: 4, background: '#ef4444', border: 'none', borderRadius: 4, cursor: 'pointer' }}><X size={14} style={{ color: 'white' }} /></button>
                                        </>
                                    ) : (
                                        <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                            {uploading ? <Loader2 size={24} style={{ color: '#6b7280', animation: 'spin 1s linear infinite' }} /> : <ImageIcon size={24} style={{ color: '#6b7280' }} />}
                                            <span style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>{uploading ? 'Uploading...' : 'Upload Logo'}</span>
                                        </button>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>Brand Name</label>
                                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter brand name" />
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
