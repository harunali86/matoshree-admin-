'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Shield, ShieldAlert, CreditCard, Building2, User, Phone, Mail } from 'lucide-react';

export default function CustomerDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit States
    const [creditLimit, setCreditLimit] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [role, setRole] = useState('retail');

    useEffect(() => {
        const fetchCustomer = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setCustomer(data);
                setCreditLimit(data.credit_limit?.toString() || '0');
                setIsVerified(data.is_verified || false);
                setRole(data.role || 'retail');
            }
            setLoading(false);
        };
        fetchCustomer();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = {
                credit_limit: parseFloat(creditLimit) || 0,
                is_verified: isVerified,
                role: role
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            alert('Customer updated successfully!');
            router.refresh();
        } catch (error: any) {
            alert('Error updating customer: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!customer) return <div className="p-8">Customer not found</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-black mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Customers
            </button>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{customer.full_name || 'Unknown User'}</h1>
                    <div className="flex items-center gap-2 text-gray-500">
                        <Mail className="w-4 h-4" /> {customer.email || 'No Email'}
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Basic Info Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" /> Personal Details
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Full Name</label>
                            <div className="mt-1 font-medium">{customer.full_name || '-'}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Email</label>
                            <div className="mt-1 font-medium">{customer.email || '-'}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Phone</label>
                            <div className="mt-1 font-medium">{customer.phone || '-'}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Joined Date</label>
                            <div className="mt-1 font-medium">{new Date(customer.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>

                {/* B2B Control Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5" /> Business & Access Control
                    </h2>

                    <div className="space-y-5">
                        {/* Role Switcher */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            >
                                <option value="retail">Retail User</option>
                                <option value="wholesale">Wholesaler / B2B</option>
                            </select>
                        </div>

                        {/* Verification Toggle */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <div className="font-medium">Verification Status</div>
                                <div className="text-sm text-gray-500">Grant full B2B access</div>
                            </div>
                            <button
                                onClick={() => setIsVerified(!isVerified)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${isVerified ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isVerified ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {/* Business Details (Read Only for now) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Business Name</label>
                                <div className="mt-1 font-medium">{customer.business_name || '-'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">GST Number</label>
                                <div className="mt-1 font-medium">{customer.gst_number || '-'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Credit & Financials (B2B Only) */}
                {role === 'wholesale' && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm md:col-span-2">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" /> Financial Configuration
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit (₹)</label>
                                <input
                                    type="number"
                                    value={creditLimit}
                                    onChange={(e) => setCreditLimit(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 font-mono"
                                />
                                <p className="text-xs text-gray-500 mt-1">Maximum credit allowed for this customer.</p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <label className="block text-sm font-medium text-blue-800">Current Balance</label>
                                <div className="text-2xl font-bold text-blue-900 mt-1">
                                    ₹{customer.credit_balance?.toLocaleString() || '0'}
                                </div>
                                <p className="text-xs text-blue-600 mt-1">Amount utilized from credit limit.</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-sm text-gray-500">Available Credit</div>
                                    <div className="text-xl font-bold text-green-600">
                                        ₹{((parseFloat(creditLimit) || 0) - (customer.credit_balance || 0)).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
