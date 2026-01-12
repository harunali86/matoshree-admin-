'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/lib/actions';
import { IndianRupee, ShoppingCart, Package, TrendingUp, Download, BarChart3 } from 'lucide-react';

export default function ReportsPage() {
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0 });
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        const loadStats = async () => {
            const data = await getDashboardStats();
            setStats(data);
            setLoading(false);
        };
        loadStats();
    }, []);

    const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="loader"></div></div>;

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reports</h1>
                    <p className="page-subtitle">Track your business performance</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ display: 'flex', background: '#1f2937', borderRadius: 8, overflow: 'hidden' }}>
                        {['week', 'month', 'year'].map(p => (
                            <button key={p} onClick={() => setPeriod(p)} style={{ padding: '8px 16px', background: period === p ? '#3b82f6' : 'transparent', border: 'none', color: 'white', fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}>{p}</button>
                        ))}
                    </div>
                    <button className="btn btn-secondary"><Download size={16} /> Export</button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid-4">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><IndianRupee size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
                    <div className="stat-label">Total Revenue</div>
                    <p style={{ fontSize: 12, color: '#4ade80', marginTop: 8 }}>↑ +12.5%</p>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}><ShoppingCart size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{stats.totalOrders}</div>
                    <div className="stat-label">Total Orders</div>
                    <p style={{ fontSize: 12, color: '#4ade80', marginTop: 8 }}>↑ +8.3%</p>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><Package size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{stats.totalProducts}</div>
                    <div className="stat-label">Total Products</div>
                    <p style={{ fontSize: 12, color: '#4ade80', marginTop: 8 }}>↑ +5.2%</p>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><TrendingUp size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{stats.totalOrders > 0 ? formatCurrency(stats.totalRevenue / stats.totalOrders) : '₹0'}</div>
                    <div className="stat-label">Avg Order Value</div>
                </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
                <div className="card">
                    <div className="card-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>Revenue Overview</h3></div>
                    <div className="card-body" style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <BarChart3 size={48} style={{ color: '#374151', marginBottom: 12 }} />
                            <p style={{ color: '#9ca3af', fontSize: 14 }}>Chart visualization</p>
                            <p style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>Connect to analytics for live data</p>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>Top Selling Products</h3></div>
                    <div className="card-body" style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Package size={48} style={{ color: '#374151', marginBottom: 12 }} />
                            <p style={{ color: '#9ca3af', fontSize: 14 }}>No data available</p>
                            <p style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>Sales data will appear here</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
