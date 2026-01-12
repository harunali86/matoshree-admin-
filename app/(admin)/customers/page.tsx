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
                                    <th>Email</th>
                                    <th>Member Since</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                                                    {(c.full_name || c.email)?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <span style={{ fontWeight: 500, color: 'white' }}>{c.full_name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: '#9ca3af' }}>{c.email}</td>
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
