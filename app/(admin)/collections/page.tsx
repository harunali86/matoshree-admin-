'use client';

import { useEffect, useState, useRef } from 'react';
import { getCollections, createCollection, updateCollection, deleteCollection, uploadImage } from '@/lib/actions';
import { Plus, Search, Pencil, Trash2, FolderOpen, X, Eye, EyeOff, Image, Loader2 } from 'lucide-react';

interface Collection { id: string; name: string; description: string; image_url: string; is_active: boolean; }

export default function CollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Collection | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({ name: '', description: '', image_url: '', is_active: true });

    useEffect(() => { fetchCollections(); }, []);

    const fetchCollections = async () => { const data = await getCollections(); setCollections(data); setLoading(false); };

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
        if (!form.name) return alert('Name required');
        if (editing) await updateCollection(editing.id, form);
        else await createCollection(form);
        fetchCollections();
        closeModal();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this collection?')) return;
        await deleteCollection(id);
        setCollections(collections.filter(c => c.id !== id));
    };

    const openEdit = (c: Collection) => {
        setEditing(c);
        setForm({ name: c.name || '', description: c.description || '', image_url: c.image_url || '', is_active: c.is_active ?? true });
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditing(null); setForm({ name: '', description: '', image_url: '', is_active: true }); };

    const filtered = collections.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Collections</h1>
                    <p className="page-subtitle">Organize products into collections</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={18} /> Add Collection</button>
            </div>

            {/* Stats */}
            <div className="grid-3">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><FolderOpen size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{collections.length}</div>
                    <div className="stat-label">Total Collections</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><Eye size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{collections.filter(c => c.is_active).length}</div>
                    <div className="stat-label">Active</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6b7280, #4b5563)' }}><EyeOff size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{collections.filter(c => !c.is_active).length}</div>
                    <div className="stat-label">Inactive</div>
                </div>
            </div>

            {/* Search */}
            <div className="card"><div style={{ padding: 16 }}>
                <div className="input-group"><Search size={18} className="input-icon" /><input placeholder="Search collections..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-with-icon" /></div>
            </div></div>

            {/* Collections Grid */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader"></div></div>
            ) : filtered.length === 0 ? (
                <div className="card"><div className="empty-state">
                    <div className="empty-icon"><FolderOpen size={32} style={{ color: '#6b7280' }} /></div>
                    <p style={{ color: 'white', fontWeight: 500 }}>No collections yet</p>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: 16 }}><Plus size={16} /> Add Collection</button>
                </div></div>
            ) : (
                <div className="grid-4">
                    {filtered.map((collection) => (
                        <div key={collection.id} className="card" style={{ overflow: 'hidden' }}>
                            <div style={{ position: 'relative', height: 120, background: '#1f2937' }}>
                                {collection.image_url ? (
                                    <img src={collection.image_url} alt={collection.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                                        <FolderOpen size={32} style={{ color: 'white' }} />
                                    </div>
                                )}
                                <span className={`badge ${collection.is_active ? 'badge-success' : 'badge-error'}`} style={{ position: 'absolute', top: 8, right: 8 }}>
                                    {collection.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="card-body">
                                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 4 }}>{collection.name}</h3>
                                <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{collection.description || 'No description'}</p>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                    <button className="action-btn" onClick={() => openEdit(collection)}><Pencil size={14} style={{ color: '#9ca3af' }} /></button>
                                    <button className="action-btn" onClick={() => handleDelete(collection.id)}><Trash2 size={14} style={{ color: '#f87171' }} /></button>
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
                    <div className="card" style={{ position: 'relative', width: '100%', maxWidth: 450, padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'white' }}>{editing ? 'Edit Collection' : 'Add Collection'}</h2>
                            <button onClick={closeModal} className="action-btn"><X size={18} style={{ color: '#9ca3af' }} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Image Upload */}
                            <div>
                                <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Collection Image</label>
                                <div style={{ position: 'relative', height: 120, background: '#1f2937', borderRadius: 8, overflow: 'hidden', border: '2px dashed #374151' }}>
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
                            <div><label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Collection name" /></div>
                            <div><label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." style={{ height: 80, resize: 'none', padding: 12 }} /></div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} style={{ width: 18, height: 18 }} /><span style={{ color: '#e2e8f0' }}>Active</span></label>
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
