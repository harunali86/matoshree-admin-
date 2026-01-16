'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Plus, Eye, FileText, Calendar, User, ArrowRight } from 'lucide-react';
import { Quotation } from '@/lib/types';

export default function QuotationsPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        const { data, error } = await supabase
            .from('quotations')
            .select(`
                *,
                profile:profiles(full_name, business_name)
            `)
            .order('created_at', { ascending: false });

        if (data) setQuotations(data);
        setLoading(false);
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading quotations...</div>;

    return (
        <div className="page animate-fadeIn">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Quotations</h1>
                    <p className="text-slate-400 text-sm">Manage B2B price quotes and requests</p>
                </div>
                <Link href="/quotations/new" className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    New Quote
                </Link>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-700/50 bg-slate-800/50">
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Quote ID</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Value</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {quotations.map((quote) => (
                                <tr key={quote.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                                <FileText size={16} />
                                            </div>
                                            <span className="font-medium text-slate-200">#{quote.id.slice(0, 8)}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-white font-medium">{(quote as any).profile?.business_name || (quote as any).profile?.full_name || 'Unknown'}</span>
                                            <span className="text-xs text-slate-500">{(quote as any).profile?.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <Calendar size={14} />
                                            {new Date(quote.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-emerald-400 font-medium">₹{quote.total_amount.toLocaleString()}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${quote.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                quote.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    quote.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-slate-700 text-slate-300 border-slate-600'
                                            }`}>
                                            {quote.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link href={`/quotations/${quote.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
                                            <ArrowRight size={18} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {quotations.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        No quotations found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
