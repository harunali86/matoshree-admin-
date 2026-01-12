'use client';

import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '@/lib/actions';
import { Search, Download, Package, Clock, Truck, CheckCircle } from 'lucide-react';

interface Order { id: string; created_at: string; total_amount: number; status: string; payment_method: string; }

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => { const data = await getOrders(); setOrders(data); setLoading(false); };

    const handleStatusChange = async (id: string, status: string) => {
        await updateOrderStatus(id, status);
        setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    };

    const formatPrice = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const stats = [
        { label: 'Total', value: orders.length, icon: Package, gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
        { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: Clock, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
        { label: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, icon: Truck, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
        { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle, gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    ];

    const filtered = orders.filter(o => {
        if (filter !== 'all' && o.status !== filter) return false;
        if (search && !o.id.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Orders</h1>
                    <p className="page-subtitle">Manage and track customer orders</p>
                </div>
                <button className="btn btn-secondary"><Download size={16} /> Export</button>
            </div>

            {/* Stats */}
            <div className="grid-4">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon" style={{ background: stat.gradient }}>
                            <stat.icon size={22} style={{ color: 'white' }} />
                        </div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card">
                <div style={{ padding: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    <div className="input-group" style={{ flex: 1, minWidth: 200 }}>
                        <Search size={18} className="input-icon" />
                        <input placeholder="Search by order ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-with-icon" />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {['all', 'pending', 'shipped', 'delivered'].map((f) => (
                            <button key={f} onClick={() => setFilter(f)} className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`} style={{ textTransform: 'capitalize' }}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader"></div></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><Package size={32} style={{ color: '#6b7280' }} /></div>
                        <p style={{ color: 'white', fontWeight: 500 }}>No orders found</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((order) => (
                                    <tr key={order.id}>
                                        <td><span style={{ fontFamily: 'monospace', color: 'white' }}>#{order.id.slice(0, 8)}</span></td>
                                        <td style={{ color: '#9ca3af' }}>{formatDate(order.created_at)}</td>
                                        <td style={{ fontWeight: 600, color: 'white' }}>{formatPrice(order.total_amount || 0)}</td>
                                        <td style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: 12 }}>{order.payment_method || 'COD'}</td>
                                        <td>
                                            <span className={`badge ${order.status === 'delivered' ? 'badge-success' :
                                                    order.status === 'shipped' ? 'badge-info' :
                                                        order.status === 'pending' ? 'badge-warning' : 'badge-error'
                                                }`} style={{ textTransform: 'capitalize' }}>{order.status}</span>
                                        </td>
                                        <td>
                                            <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} style={{ height: 32, padding: '0 8px', fontSize: 12 }}>
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
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
