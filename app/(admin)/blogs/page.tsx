'use client';

import { useEffect, useState } from 'react';
import { getBlogs, createBlog, updateBlog, deleteBlog } from '@/lib/actions';
import { Plus, Search, Pencil, Trash2, FileText, X, Eye } from 'lucide-react';

interface Blog { id: string; title: string; content: string; is_published: boolean; created_at: string; }

export default function BlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Blog | null>(null);
    const [form, setForm] = useState({ title: '', content: '', is_published: false });

    useEffect(() => { fetchBlogs(); }, []);

    const fetchBlogs = async () => { const data = await getBlogs(); setBlogs(data); setLoading(false); };

    const handleSubmit = async () => {
        if (!form.title) return;
        if (editing) await updateBlog(editing.id, form);
        else await createBlog(form);
        fetchBlogs();
        closeModal();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete?')) return;
        await deleteBlog(id);
        setBlogs(blogs.filter(b => b.id !== id));
    };

    const openEdit = (blog: Blog) => { setEditing(blog); setForm({ title: blog.title, content: blog.content || '', is_published: blog.is_published }); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditing(null); setForm({ title: '', content: '', is_published: false }); };

    const filtered = blogs.filter(b => b.title?.toLowerCase().includes(search.toLowerCase()));
    const published = blogs.filter(b => b.is_published).length;
    const drafts = blogs.length - published;

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Blogs</h1>
                    <p className="page-subtitle">Manage blog posts and articles</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={18} /> New Post</button>
            </div>

            {/* Stats */}
            <div className="grid-3">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}><FileText size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{blogs.length}</div>
                    <div className="stat-label">Total Posts</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><Eye size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{published}</div>
                    <div className="stat-label">Published</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><FileText size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{drafts}</div>
                    <div className="stat-label">Drafts</div>
                </div>
            </div>

            {/* Search */}
            <div className="card"><div style={{ padding: 16 }}>
                <div className="input-group"><Search size={18} className="input-icon" /><input placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-with-icon" /></div>
            </div></div>

            {/* Posts */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader"></div></div>
            ) : filtered.length === 0 ? (
                <div className="card"><div className="empty-state">
                    <div className="empty-icon"><FileText size={32} style={{ color: '#6b7280' }} /></div>
                    <p style={{ color: 'white', fontWeight: 500 }}>No blog posts yet. Start writing!</p>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: 16 }}><Plus size={16} /> Create Post</button>
                </div></div>
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Title</th><th>Status</th><th>Date</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                            <tbody>
                                {filtered.map((blog) => (
                                    <tr key={blog.id}>
                                        <td style={{ fontWeight: 500, color: 'white' }}>{blog.title}</td>
                                        <td><span className={`badge ${blog.is_published ? 'badge-success' : 'badge-warning'}`}>{blog.is_published ? 'Published' : 'Draft'}</span></td>
                                        <td style={{ color: '#9ca3af' }}>{new Date(blog.created_at).toLocaleDateString()}</td>
                                        <td><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                            <button className="action-btn" onClick={() => openEdit(blog)}><Pencil size={14} style={{ color: '#9ca3af' }} /></button>
                                            <button className="action-btn" onClick={() => handleDelete(blog.id)}><Trash2 size={14} style={{ color: '#f87171' }} /></button>
                                        </div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={closeModal} />
                    <div className="card" style={{ position: 'relative', width: '100%', maxWidth: 600, padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'white' }}>{editing ? 'Edit Post' : 'New Post'}</h2>
                            <button onClick={closeModal} className="action-btn"><X size={18} style={{ color: '#9ca3af' }} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div><label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Post title" /></div>
                            <div><label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Content</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your post..." style={{ height: 150, resize: 'none', padding: 12 }} /></div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} style={{ width: 18, height: 18 }} /><span style={{ color: '#e2e8f0' }}>Publish immediately</span></label>
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
