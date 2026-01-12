'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/lib/actions';
import { Package, ShoppingCart, IndianRupee, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0, recentOrders: [] as any[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const data = await getDashboardStats();
    setStats(data);
    setLoading(false);
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><div className="loader"></div></div>;
  }

  return (
    <div className="page animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back! 👋</h1>
          <p className="page-subtitle">Here's what's happening with your store today.</p>
        </div>
        <Link href="/products/new" className="btn btn-primary"><Plus size={18} /> Add Product</Link>
      </div>

      {/* Stats */}
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <IndianRupee size={22} style={{ color: 'white' }} />
          </div>
          <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            <ShoppingCart size={22} style={{ color: 'white' }} />
          </div>
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
            <Package size={22} style={{ color: 'white' }} />
          </div>
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <Clock size={22} style={{ color: 'white' }} />
          </div>
          <div className="stat-value">{stats.pendingOrders}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      {/* Recent Orders & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>Recent Orders</h2>
            <Link href="/orders" style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div className="card-body">
            {stats.recentOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <ShoppingCart size={36} style={{ color: '#374151', marginBottom: 12 }} />
                <p style={{ color: '#9ca3af', fontSize: 14 }}>No orders yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.recentOrders.slice(0, 5).map((order, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1f2937' }}>
                    <span style={{ fontFamily: 'monospace', color: '#9ca3af', fontSize: 13 }}>#{order.id?.slice(0, 8)}</span>
                    <span style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>{formatCurrency(order.total_amount || 0)}</span>
                    <span className={`badge ${order.status === 'delivered' ? 'badge-success' : 'badge-warning'}`}>{order.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>Quick Actions</h2>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Add New Product', href: '/products/new', icon: Plus },
              { label: 'View Orders', href: '/orders', icon: ShoppingCart },
              { label: 'Manage Categories', href: '/categories', icon: Package },
            ].map((item, i) => (
              <Link key={i} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, textDecoration: 'none', background: '#1f2937' }}>
                <div style={{ width: 40, height: 40, background: '#374151', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={18} style={{ color: '#3b82f6' }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'white' }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
