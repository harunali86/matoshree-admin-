'use client';

import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/actions';
import { Plus, Search, Pencil, Trash2, FolderOpen, X } from 'lucide-react';

interface Category { id: string; name: string; description: string; }

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [form, setForm] = useState({ name: '', description: '' });

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        const data = await getCategories();
        setCategories(data);
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) return;
        if (editing) await updateCategory(editing.id, form);
        else await createCategory(form);
        fetchCategories();
        closeModal();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete?')) return;
        await deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
    };

    const openEdit = (cat: Category) => {
        setEditing(cat);
        setForm({ name: cat.name, description: cat.description || '' });
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditing(null); setForm({ name: '', description: '' }); };

    const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Categories</h1>
                    <p className="page-subtitle">Organize your products</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={18} /> Add Category</button>
            </div>

            <div className="card">
                <div style={{ padding: 16 }}>
                    <div className="input-group">
                        <Search size={18} className="input-icon" />
                        <input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-with-icon" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader"></div></div>
            ) : filtered.length === 0 ? (
                <div className="card"><div className="empty-state">
                    <div className="empty-icon"><FolderOpen size={32} style={{ color: '#6b7280' }} /></div>
                    <p style={{ color: 'white', fontWeight: 500 }}>No categories found</p>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: 16 }}><Plus size={16} /> Add Category</button>
                </div></div>
            ) : (
                <div className="grid-4">
                    {filtered.map((cat) => (
                        <div key={cat.id} className="card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FolderOpen size={22} style={{ color: 'white' }} />
                                </div>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button className="action-btn" onClick={() => openEdit(cat)}><Pencil size={14} style={{ color: '#9ca3af' }} /></button>
                                    <button className="action-btn" onClick={() => handleDelete(cat.id)}><Trash2 size={14} style={{ color: '#f87171' }} /></button>
                                </div>
                            </div>
                            <h3 style={{ marginTop: 16, fontWeight: 600, color: 'white' }}>{cat.name}</h3>
                            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>{cat.description || 'No description'}</p>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={closeModal} />
                    <div className="card" style={{ position: 'relative', width: '100%', maxWidth: 420, padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'white' }}>{editing ? 'Edit Category' : 'Add Category'}</h2>
                            <button onClick={closeModal} className="action-btn"><X size={18} style={{ color: '#9ca3af' }} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>Name</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" style={{ height: 80, resize: 'none', padding: 12 }} />
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                <button onClick={closeModal} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button onClick={handleSubmit} className="btn btn-primary" style={{ flex: 1 }}>{editing ? 'Update' : 'Create'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
