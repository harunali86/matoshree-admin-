'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/lib/actions';
import { Package, ShoppingCart, IndianRupee, Clock, Plus, Factory, TrendingUp, Users, ArrowRight, Wallet, Activity, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useAdminMode } from '@/components/providers/AdminModeProvider';

export default function Dashboard() {
  const { isWholesale } = useAdminMode();
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0, recentOrders: [] as any[], pendingWholesalers: 0 });
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    const [dashboardData, customers, products] = await Promise.all([
      getDashboardStats(),
      import('@/lib/actions').then(m => m.getCustomers()),
      import('@/lib/actions').then(m => m.getProducts())
    ]);

    const pendingWholesalers = customers.filter(c => c.role === 'wholesale' && !c.is_verified).length;

    // Filter Low Stock
    const lowStock = products.filter((p: any) => p.stock < 10).slice(0, 5);

    setStats({ ...dashboardData, pendingWholesalers });
    setLowStockItems(lowStock);
    setLoading(false);
  };

  useEffect(() => { loadStats(); }, [isWholesale]);

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filter orders for display based on mode (Client-side simulation for now until getDashboardStats supports filter)
  const displayOrders = stats.recentOrders.filter(o => {
    const role = o.user?.role || 'retail';
    return isWholesale ? role === 'wholesale' : role === 'retail';
  });

  // Calculate some fake trends based on mode for UI demo
  const revenueValue = isWholesale ? stats.totalRevenue * 4.5 : stats.totalRevenue;
  const ordersValue = isWholesale ? 42 : stats.totalOrders;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            {isWholesale ? 'Wholesale Overview' : 'Retail Dashboard'}
          </h1>
          <p className="text-slate-400">
            {isWholesale
              ? 'Monitor bulk operations, dealer performance, and credit flow.'
              : 'Track daily sales, orders, and customer activity.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={isWholesale ? '/quotations/new' : '/products/new'}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>{isWholesale ? 'New Quotation' : 'Add Product'}</span>
          </Link>
        </div>
      </div>

      {/* B2B Pending Alert */}
      {isWholesale && stats.pendingWholesalers > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500">
              <Users size={20} />
            </div>
            <div>
              <p className="text-amber-500 font-bold">New Wholesale Applications</p>
              <p className="text-amber-400/80 text-sm">You have {stats.pendingWholesalers} new business registration requests waiting for approval.</p>
            </div>
          </div>
          <Link href="/customers?tab=pending" className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg font-bold text-xs transition-colors">
            REVIEW NOW
          </Link>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          label={isWholesale ? "Total Revenue (B2B)" : "Total Revenue"}
          value={formatCurrency(revenueValue)}
          icon={IndianRupee}
          trend="+12.5%"
          trendUp={true}
          color="emerald"
        />
        <StatsCard
          label={isWholesale ? "Active Dealers" : "Total Orders"}
          value={ordersValue.toString()}
          icon={isWholesale ? Users : ShoppingCart}
          trend={isWholesale ? "+3 this week" : "+8 today"}
          trendUp={true}
          color="blue"
        />
        <StatsCard
          label="Products"
          value={stats.totalProducts.toString()}
          icon={Package}
          color="purple"
        />
        <StatsCard
          label={isWholesale ? "Pending Approvals" : "Pending Orders"}
          value={isWholesale ? stats.pendingWholesalers.toString() : stats.pendingOrders.toString()}
          icon={isWholesale ? Users : Clock}
          trend={isWholesale ? "Wholesale Requests" : "Needs Attention"}
          trendUp={isWholesale ? stats.pendingWholesalers > 0 : false}
          color="amber"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Orders - Takes up 2 columns */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity size={18} className="text-blue-500" />
              {isWholesale ? 'Recent Purchase Orders' : 'Recent Retail Orders'}
            </h2>
            <Link href="/orders" className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 group">
              View All <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="p-0">
            {displayOrders.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-3">
                  <ShoppingCart size={24} className="opacity-50" />
                </div>
                <p>No recent {isWholesale ? 'B2B' : 'retail'} orders found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {displayOrders.slice(0, 5).map((order, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isWholesale ? 'bg-indigo-500/10 text-indigo-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                        {isWholesale ? <Factory size={20} /> : <ShoppingCart size={20} />}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{order.user?.email || 'Guest User'}</p>
                        <p className="text-xs text-slate-500">ID: #{order.id?.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm tracking-wide">{formatCurrency(order.total_amount || 0)}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Insight Side Panel */}
        <div className="space-y-6">

          {/* Low Stock Alert - NEW */}
          {lowStockItems.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-red-500 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} /> Low Stock Alert
              </h2>
              <div className="space-y-3">
                {lowStockItems.map(item => (
                  <Link key={item.id} href={`/products/${item.id}/edit`} className="flex justify-between items-center p-2 rounded hover:bg-red-500/10 transition-colors">
                    <span className="text-sm text-slate-300 truncate w-32">{item.name}</span>
                    <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded">{item.stock} left</span>
                  </Link>
                ))}
              </div>
              <Link href="/products" className="block text-center text-xs font-medium text-red-400 mt-4 hover:underline">
                View All Inventory
              </Link>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              <QuickActionTile
                icon={isWholesale ? Factory : Plus}
                label={isWholesale ? "Create Quotation" : "Add New Product"}
                href={isWholesale ? "/quotations/new" : "/products/new"}
                color="blue"
              />
              <QuickActionTile
                icon={isWholesale ? Users : ShoppingCart}
                label={isWholesale ? "Manage Dealers" : "View All Orders"}
                href={isWholesale ? "/customers" : "/orders"}
                color="emerald"
              />
              <QuickActionTile
                icon={Package}
                label="Manage Inventory"
                href="/products"
                color="slate"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Components ---

function StatsCard({ label, value, icon: Icon, trend, trendUp, color }: any) {
  const colorStyles: any = {
    emerald: "text-emerald-500 bg-emerald-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    amber: "text-amber-500 bg-amber-500/10",
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorStyles[color] || colorStyles.blue}`}>
          <Icon size={22} />
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</h3>
        <p className="text-sm text-slate-400 font-medium">{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: "text-amber-400 bg-amber-400/10",
    processing: "text-blue-400 bg-blue-400/10",
    shipped: "text-indigo-400 bg-indigo-400/10",
    delivered: "text-emerald-400 bg-emerald-400/10",
    cancelled: "text-red-400 bg-red-400/10",
  };

  return (
    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

function QuickActionTile({ icon: Icon, label, href, color }: any) {
  const hoverColors: any = {
    blue: "group-hover:text-blue-400 group-hover:bg-blue-400/10",
    emerald: "group-hover:text-emerald-400 group-hover:bg-emerald-400/10",
    slate: "group-hover:text-slate-300 group-hover:bg-slate-400/10",
  };

  return (
    <Link href={href} className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700">
      <div className={`p-2 rounded-lg bg-slate-900 text-slate-400 transition-colors ${hoverColors[color]}`}>
        <Icon size={18} />
      </div>
      <span className="text-sm font-medium text-slate-300 group-hover:text-white">{label}</span>
    </Link>
  );
}
