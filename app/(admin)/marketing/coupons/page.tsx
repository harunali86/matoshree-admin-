'use client';

import { useState, useEffect } from 'react';
import { getCoupons, createCoupon, deleteCoupon } from '@/lib/actions';
import { Plus, Trash2, Tag, Calendar, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_value: number;
    usage_limit: number | null;
    usage_count: number;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
}

export default function CouponsPage() {
    const router = useRouter();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [form, setForm] = useState({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_value: '0',
        usage_limit: '',
        end_date: '',
        is_active: true
    });

    const loadCoupons = async () => {
        setLoading(true);
        const data = await getCoupons();
        setCoupons(data);
        setLoading(false);
    };

    useEffect(() => {
        loadCoupons();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...form,
            code: form.code.toUpperCase().trim(),
            discount_value: parseFloat(form.discount_value),
            min_order_value: parseFloat(form.min_order_value) || 0,
            usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
            end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
            usage_count: 0
        };

        const result = await createCoupon(payload);
        if (result.success) {
            setIsCreating(false);
            setForm({ code: '', discount_type: 'percentage', discount_value: '', min_order_value: '0', usage_limit: '', end_date: '', is_active: true });
            loadCoupons(); // Refresh
        } else {
            alert('Error creating coupon: ' + result.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        await deleteCoupon(id);
        loadCoupons();
    };

    return (
        <div className="page animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="page-title">Coupons & Offers</h1>
                    <p className="page-subtitle">Manage discount codes for marketing campaigns</p>
                </div>
                <button onClick={() => setIsCreating(!isCreating)} className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} /> {isCreating ? 'Cancel' : 'Create Coupon'}
                </button>
            </div>

            {/* CREATE FORM */}
            {isCreating && (
                <div className="card mb-8 animate-slideIn border-blue-500/30">
                    <div className="card-header bg-blue-500/10">
                        <h3 className="font-semibold text-blue-400">New Coupon Details</h3>
                    </div>
                    <form onSubmit={handleCreate} className="card-body grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Coupon Code</label>
                            <input
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value })}
                                placeholder="e.g. SUMMER50"
                                className="input-field uppercase font-bold tracking-wider"
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm text-slate-400 mb-1">Type</label>
                                <select
                                    value={form.discount_type}
                                    onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm text-slate-400 mb-1">Value</label>
                                <input
                                    type="number"
                                    value={form.discount_value}
                                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                                    placeholder={form.discount_type === 'percentage' ? '10' : '500'}
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Min Order Value (₹)</label>
                            <input
                                type="number"
                                value={form.min_order_value}
                                onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
                                placeholder="0"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Expiry Date</label>
                            <input
                                type="date"
                                value={form.end_date}
                                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Usage Limit (Total)</label>
                            <input
                                type="number"
                                value={form.usage_limit}
                                onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                                placeholder="Unlimited"
                                className="input-field"
                            />
                        </div>

                        <div className="col-span-2 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setIsCreating(false)} className="btn btn-secondary">Cancel</button>
                            <button type="submit" className="btn btn-primary">Create Campaign</button>
                        </div>
                    </form>
                </div>
            )}

            {/* LIST */}
            <div className="grid gap-4">
                {loading ? <div className="loader mx-auto my-10" /> : coupons.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-lg border border-slate-800">
                        <Tag size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No active coupons found. Create one to get started!</p>
                    </div>
                ) : (
                    coupons.map((coupon) => (
                        <div key={coupon.id} className="card p-4 flex items-center justify-between group hover:border-slate-600 transition-colors">
                            <div className="flex items-center gap-6">
                                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400 font-bold text-xl tracking-wider">
                                    {coupon.code}
                                </div>
                                <div>
                                    <div className="text-white font-medium flex items-center gap-2">
                                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} FLAT OFF`}
                                        {!coupon.is_active && <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded">INACTIVE</span>}
                                    </div>
                                    <div className="text-sm text-slate-500 flex items-center gap-3 mt-1">
                                        <span>Min Order: ₹{coupon.min_order_value}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><AlertCircle size={12} /> Used: {coupon.usage_count} / {coupon.usage_limit || '∞'}</span>
                                        {coupon.end_date && (
                                            <>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Calendar size={12} /> Expires: {new Date(coupon.end_date).toLocaleDateString()}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(coupon.id)}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                                title="Delete Coupon"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
