'use client';

import { useEffect, useState } from 'react';
import { getCustomers } from '@/lib/actions';
import { Search, Users, ShoppingCart, IndianRupee } from 'lucide-react';

interface Customer { id: string; email: string; full_name: string; created_at: string; }

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        const data = await getCustomers();
        setCustomers(data);
        setLoading(false);
    };

    const filtered = customers.filter(c =>
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Customers</h1>
                    <p className="page-subtitle">View and manage customer accounts</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid-3">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                        <Users size={22} style={{ color: 'white' }} />
                    </div>
                    <div className="stat-value">{customers.length}</div>
                    <div className="stat-label">Total Customers</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        <ShoppingCart size={22} style={{ color: 'white' }} />
                    </div>
                    <div className="stat-value">0</div>
                    <div className="stat-label">Total Orders</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                        <IndianRupee size={22} style={{ color: 'white' }} />
                    </div>
                    <div className="stat-value">₹0</div>
                    <div className="stat-label">Total Revenue</div>
                </div>
            </div>

            {/* Search */}
            <div className="card">
                <div style={{ padding: 16 }}>
                    <div className="input-group">
                        <Search size={18} className="input-icon" />
                        <input placeholder="Search by email or name..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-with-icon" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader"></div></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><Users size={32} style={{ color: '#6b7280' }} /></div>
                        <p style={{ color: 'white', fontWeight: 500 }}>No customers found</p>
                        <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>Customers will appear here when they sign up</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Role</th>
                                    <th>Business Details</th>
                                    <th>Status</th>
                                    <th>Member Since</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c: any) => (
                                    <tr key={c.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                                                    {(c.full_name || c.email)?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500, color: 'white' }}>{c.full_name || 'Unknown'}</div>
                                                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{c.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                                                background: c.role === 'wholesale' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                                color: c.role === 'wholesale' ? '#a78bfa' : '#60a5fa',
                                                border: `1px solid ${c.role === 'wholesale' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`
                                            }}>
                                                {c.role === 'wholesale' ? 'Wholesale (B2B)' : 'Retail'}
                                            </span>
                                        </td>
                                        <td>
                                            {c.role === 'wholesale' ? (
                                                <div>
                                                    <div style={{ color: 'white', fontSize: 13 }}>{c.business_name || '-'}</div>
                                                    <div style={{ color: '#9ca3af', fontSize: 12 }}>GST: {c.gst_number || '-'}</div>
                                                </div>
                                            ) : <span style={{ color: '#6b7280' }}>-</span>}
                                        </td>
                                        <td>
                                            {c.role === 'wholesale' ? (
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm('Change verification status?')) return;
                                                        await import('@/lib/actions').then(m => m.updateProfile(c.id, { is_verified: !c.is_verified }));
                                                        fetchCustomers();
                                                    }}
                                                    style={{
                                                        cursor: 'pointer', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                                                        background: c.is_verified ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                        color: c.is_verified ? '#4ade80' : '#f87171',
                                                        border: `1px solid ${c.is_verified ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                                                    }}
                                                >
                                                    {c.is_verified ? 'Verified' : 'Pending Approval'}
                                                </button>
                                            ) : <span style={{ color: '#9ca3af', fontSize: 12 }}>Auto-Verified</span>}
                                        </td>
                                        <td style={{ color: '#9ca3af' }}>{formatDate(c.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
