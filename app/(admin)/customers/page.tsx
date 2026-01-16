'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getCustomers } from '@/lib/actions';
import { Search, Users, CheckCircle, Clock, ShieldCheck, Store, User } from 'lucide-react';

interface Customer {
    id: string;
    email: string;
    full_name: string;
    created_at: string;
    role?: 'retail' | 'wholesale';
    is_verified?: boolean;
    business_name?: string;
    gst_number?: string;
    shop_address?: string;
    profile_image_url?: string;
}

export default function CustomersPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabParam = searchParams.get('tab');
    const activeTab = (tabParam === 'wholesale' || tabParam === 'pending' || tabParam === 'retail') ? tabParam : 'retail';

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        const data = await getCustomers();
        setCustomers(data);
        setLoading(false);
    };

    const pendingCount = customers.filter(c => c.role === 'wholesale' && !c.is_verified).length;

    const filtered = customers.filter(c => {
        const matchesSearch = c.email?.toLowerCase().includes(search.toLowerCase()) ||
            c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            c.business_name?.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (activeTab === 'retail') return c.role === 'retail' || (!c.role);
        if (activeTab === 'wholesale') return c.role === 'wholesale' && c.is_verified;
        if (activeTab === 'pending') return c.role === 'wholesale' && !c.is_verified;
        return false;
    });

    const handleVerify = async (id: string, currentStatus: boolean | undefined) => {
        if (!confirm(`Approve this wholesaler application?`)) return;
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, is_verified: true } : c));
        try {
            const { updateProfile } = await import('@/lib/actions');
            const { success, error } = await updateProfile(id, { is_verified: true });
            if (!success) throw new Error(error);
        } catch (err: any) {
            alert(`Failed: ${err.message}`);
            setCustomers(prev => prev.map(c => c.id === id ? { ...c, is_verified: currentStatus } : c));
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white p-6 space-y-8 animate-fadeIn">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        {activeTab === 'retail' && 'Retail Customers'}
                        {activeTab === 'wholesale' && 'Trusted Dealers'}
                        {activeTab === 'pending' && 'Application Requests'}
                    </h1>
                    <p className="text-slate-400 mt-1 flex items-center gap-2">
                        {activeTab === 'retail' && <User size={16} />}
                        {activeTab === 'wholesale' && <ShieldCheck size={16} />}
                        {activeTab === 'pending' && <Clock size={16} />}
                        {activeTab === 'pending'
                            ? 'Review and verify business credentials for new wholesaler access.'
                            : `Manage and track your ${activeTab} base.`}
                    </p>
                </div>

                {/* KPI Card */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-xl flex items-center gap-4 min-w-[200px]">
                    <div className={`p-3 rounded-lg ${activeTab === 'pending' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-600/20 text-blue-500'}`}>
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total {activeTab === 'pending' ? 'Pending' : 'Users'}</p>
                        <p className="text-2xl font-bold text-white">{filtered.length}</p>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="sticky top-0 z-10 bg-[#020617]/95 backdrop-blur py-4 flex flex-col sm:flex-row gap-4 border-b border-slate-800/50">
                <div className="flex p-1 bg-slate-900/80 rounded-lg border border-slate-800 self-start">
                    {[
                        { id: 'retail', label: 'Retailers', icon: User },
                        { id: 'wholesale', label: 'Dealers', icon: ShieldCheck },
                        { id: 'pending', label: 'Requests', icon: Clock }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => router.push(`/customers?tab=${tab.id}`)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/10'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                            {tab.id === 'pending' && pendingCount > 0 && (
                                <span className="ml-1 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    />
                </div>
            </div>

            {/* List View */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="flex justify-center p-12"><div className="loader"></div></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                            <Users size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-300">No {activeTab} users found</h3>
                        <p className="text-slate-500 text-sm">Try adjusting your search filters</p>
                    </div>
                ) : (
                    filtered.map((user) => (
                        <div key={user.id} className="group bg-slate-900/40 hover:bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all duration-200">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                {/* Avatar & Basic Info */}
                                <div className="flex items-center gap-4 min-w-[30%]">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg ${user.role === 'wholesale'
                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/20'
                                            : 'bg-gradient-to-br from-slate-700 to-slate-600 text-slate-200'
                                        }`}>
                                        {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{user.full_name || 'Guest User'}</h3>
                                        <p className="text-sm text-slate-400">{user.email}</p>
                                    </div>
                                </div>

                                {/* B2B Specific Details */}
                                {(activeTab === 'wholesale' || activeTab === 'pending') && (
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-slate-950/30 p-3 rounded-lg border border-slate-800/50">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Store size={14} className="text-indigo-400" />
                                                <span className="text-xs font-semibold text-slate-300 uppercase">Business</span>
                                            </div>
                                            <p className="text-sm text-white truncate">{user.business_name || 'N/A'}</p>
                                        </div>
                                        <div className="bg-slate-950/30 p-3 rounded-lg border border-slate-800/50">
                                            <div className="flex items-center gap-2 mb-1">
                                                <ShieldCheck size={14} className="text-purple-400" />
                                                <span className="text-xs font-semibold text-slate-300 uppercase">GST Number</span>
                                            </div>
                                            <p className="text-sm font-mono text-slate-300">{user.gst_number || 'N/A'}</p>
                                        </div>
                                        {user.shop_address && (
                                            <div className="col-span-full text-xs text-slate-500 truncate px-1">
                                                📍 {user.shop_address}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Actions & Status */}
                                <div className="flex items-center gap-4 md:ml-auto">
                                    <div className="text-right mr-4">
                                        <p className="text-xs text-slate-500">Joined</p>
                                        <p className="text-sm font-medium text-slate-300">{new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>

                                    {activeTab === 'pending' ? (
                                        <button
                                            onClick={() => handleVerify(user.id, user.is_verified)}
                                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
                                        >
                                            <CheckCircle size={16} />
                                            <span>Approve Application</span>
                                        </button>
                                    ) : user.is_verified ? (
                                        <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Verified</span>
                                        </div>
                                    ) : (
                                        <div className="px-4 py-1.5 bg-slate-800 border border-slate-700 rounded-full">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Standard</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
