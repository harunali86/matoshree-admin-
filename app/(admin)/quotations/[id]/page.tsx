'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getQuotation, updateQuotationStatus } from '@/lib/actions';
import { ArrowLeft, CheckCircle, XCircle, FileText, Calendar, User, Printer, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function QuotationDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const [quotation, setQuotation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuotation();
    }, []);

    const loadQuotation = async () => {
        const data = await getQuotation(params.id as string);
        setQuotation(data);
        setLoading(false);
    };

    const handleStatusChange = async (status: string) => {
        if (!confirm(`Mark quotation as ${status}?`)) return;

        const res = await updateQuotationStatus(quotation.id, status);
        if (res.success) {
            loadQuotation();
        } else {
            alert('Error updating status: ' + res.error);
        }
    };

    if (loading) return <div className="p-12 text-center"><div className="loader"></div></div>;
    if (!quotation) return <div className="p-12 text-center text-slate-400">Quotation not found</div>;

    return (
        <div className="page animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/quotations" className="btn btn-secondary p-2.5"><ArrowLeft size={18} /></Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-white">Quote #{quotation.id.slice(0, 8)}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wide ${quotation.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    quotation.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        quotation.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            'bg-slate-700 text-slate-300 border-slate-600'
                                }`}>
                                {quotation.status}
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><Calendar size={14} /> Created: {new Date(quotation.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1.5"><Calendar size={14} /> Valid Until: {new Date(quotation.valid_until).toLocaleDateString()}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="btn btn-secondary flex items-center gap-2" onClick={() => window.print()}>
                        <Printer size={18} /> Print
                    </button>
                    {quotation.status === 'pending' && (
                        <>
                            <button
                                onClick={() => handleStatusChange('rejected')}
                                className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                                <XCircle size={18} /> Reject
                            </button>
                            <button
                                onClick={() => handleStatusChange('approved')}
                                className="btn btn-primary bg-emerald-600 hover:bg-emerald-500 flex items-center gap-2"
                            >
                                <CheckCircle size={18} /> Approve Quote
                            </button>
                        </>
                    )}
                    {quotation.status === 'approved' && (
                        <button
                            className="btn btn-primary flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500"
                            onClick={() => alert('Order conversion logic would go here!')}
                        >
                            <ShoppingBag size={18} /> Convert to Order
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-[1fr_350px] gap-6">
                {/* Details */}
                <div className="space-y-6">
                    {/* Items */}
                    <div className="card">
                        <div className="card-header"><h3 className="font-semibold text-white">Line Items</h3></div>
                        <div className="card-body p-0">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-800/50 text-slate-400">
                                    <tr>
                                        <th className="p-4 pl-6">Product</th>
                                        <th className="p-4 text-center">Qty</th>
                                        <th className="p-4 text-right">Unit Price</th>
                                        <th className="p-4 pr-6 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {quotation.items.map((item: any, i: number) => (
                                        <tr key={i}>
                                            <td className="p-4 pl-6 font-medium text-white">{item.name}</td>
                                            <td className="p-4 text-center text-slate-300">{item.quantity}</td>
                                            <td className="p-4 text-right text-slate-300">₹{item.unit_price.toLocaleString()}</td>
                                            <td className="p-4 pr-6 text-right text-emerald-400 font-medium">₹{(item.quantity * item.unit_price).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-800/30 border-t border-slate-700/50">
                                    <tr>
                                        <td colSpan={3} className="p-4 pl-6 text-right text-slate-400 font-medium">Subtotal</td>
                                        <td className="p-4 pr-6 text-right text-white font-medium">₹{quotation.total_amount.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="p-4 pl-6 text-right text-slate-400 font-medium text-lg pt-2">Grand Total</td>
                                        <td className="p-4 pr-6 text-right text-emerald-400 font-bold text-lg pt-2">₹{quotation.total_amount.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="card">
                        <div className="card-header"><h3 className="font-semibold text-white">Terms & Conditions</h3></div>
                        <div className="card-body text-slate-400 text-sm space-y-2">
                            <p>1. This quotation is valid until {new Date(quotation.valid_until).toLocaleDateString()}.</p>
                            <p>2. Payment terms: 50% advance, balance on delivery.</p>
                            <p>3. Delivery timeline: 3-5 business days after approval.</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="card">
                        <div className="card-header flex items-center gap-2"><User size={18} className="text-slate-400" /> <h3 className="font-semibold text-white">Customer</h3></div>
                        <div className="card-body">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-300">
                                    {quotation.profile?.full_name?.charAt(0) || 'C'}
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">{quotation.profile?.business_name || 'Individual'}</h4>
                                    <p className="text-sm text-slate-400">{quotation.profile?.full_name}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-slate-400 border-t border-slate-700/50 pt-4">
                                <div className="flex justify-between">
                                    <span>GSTIN:</span>
                                    <span className="text-slate-300">{quotation.profile?.gst_number || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phone:</span>
                                    <span className="text-slate-300">{quotation.profile?.phone || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
