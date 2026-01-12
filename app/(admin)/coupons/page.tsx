'use client';

import { useEffect, useState } from 'react';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/lib/actions';
import { Plus, Search, Pencil, Trash2, Ticket, X, Percent } from 'lucide-react';

interface Coupon { id: string; code: string; discount_type: string; discount_value: number; min_order: number; max_discount: number; is_active: boolean; }

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Coupon | null>(null);
    const [form, setForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', min_order: '', max_discount: '', is_active: true });

    useEffect(() => { fetchCoupons(); }, []);

    const fetchCoupons = async () => { const data = await getCoupons(); setCoupons(data); setLoading(false); };

    const handleSubmit = async () => {
        if (!form.code) return;
        const data = { ...form, discount_value: parseFloat(form.discount_value) || 0, min_order: parseFloat(form.min_order) || 0, max_discount: parseFloat(form.max_discount) || 0 };
        if (editing) await updateCoupon(editing.id, data);
        else await createCoupon(data);
        fetchCoupons();
        closeModal();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete?')) return;
        await deleteCoupon(id);
        setCoupons(coupons.filter(c => c.id !== id));
    };

    const openEdit = (c: Coupon) => {
        setEditing(c);
        setForm({ code: c.code, discount_type: c.discount_type || 'percentage', discount_value: c.discount_value?.toString() || '', min_order: c.min_order?.toString() || '', max_discount: c.max_discount?.toString() || '', is_active: c.is_active });
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditing(null); setForm({ code: '', discount_type: 'percentage', discount_value: '', min_order: '', max_discount: '', is_active: true }); };

    const filtered = coupons.filter(c => c.code?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Coupons</h1>
                    <p className="page-subtitle">Manage discount codes and promotions</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={18} /> Add Coupon</button>
            </div>

            {/* Stats */}
            <div className="grid-3">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}><Ticket size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{coupons.length}</div>
                    <div className="stat-label">Total Coupons</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><Ticket size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{coupons.filter(c => c.is_active).length}</div>
                    <div className="stat-label">Active</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}><Ticket size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{coupons.filter(c => !c.is_active).length}</div>
                    <div className="stat-label">Inactive</div>
                </div>
            </div>

            {/* Search */}
            <div className="card"><div style={{ padding: 16 }}>
                <div className="input-group"><Search size={18} className="input-icon" /><input placeholder="Search coupons..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-with-icon" /></div>
            </div></div>

            {/* Table */}
            <div className="card">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader"></div></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><Ticket size={32} style={{ color: '#6b7280' }} /></div>
                        <p style={{ color: 'white', fontWeight: 500 }}>No coupons yet</p>
                        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: 16 }}><Plus size={16} /> Add Coupon</button>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Max Discount</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                            <tbody>
                                {filtered.map((c) => (
                                    <tr key={c.id}>
                                        <td><span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'white', background: '#1f2937', padding: '4px 8px', borderRadius: 4 }}>{c.code}</span></td>
                                        <td style={{ color: '#4ade80', fontWeight: 500 }}>{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                                        <td style={{ color: '#9ca3af' }}>₹{c.min_order || 0}</td>
                                        <td style={{ color: '#9ca3af' }}>₹{c.max_discount || '-'}</td>
                                        <td><span className={`badge ${c.is_active ? 'badge-success' : 'badge-error'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                                        <td><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                            <button className="action-btn" onClick={() => openEdit(c)}><Pencil size={14} style={{ color: '#9ca3af' }} /></button>
                                            <button className="action-btn" onClick={() => handleDelete(c.id)}><Trash2 size={14} style={{ color: '#f87171' }} /></button>
                                        </div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={closeModal} />
                    <div className="card" style={{ position: 'relative', width: '100%', maxWidth: 480, padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'white' }}>{editing ? 'Edit Coupon' : 'Add Coupon'}</h2>
                            <button onClick={closeModal} className="action-btn"><X size={18} style={{ color: '#9ca3af' }} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div><label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Coupon Code</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" style={{ textTransform: 'uppercase' }} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Type</label><select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option></select></div>
                                <div><label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Value</label><input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder={form.discount_type === 'percentage' ? '20' : '500'} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Min Order (₹)</label><input type="number" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} placeholder="500" /></div>
                                <div><label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Max Discount (₹)</label><input type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} placeholder="1000" /></div>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} style={{ width: 18, height: 18 }} /><span style={{ color: '#e2e8f0' }}>Active</span></label>
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
