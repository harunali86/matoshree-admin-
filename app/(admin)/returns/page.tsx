'use client';

import { useState, useEffect } from 'react';
import { getReturns, updateReturnStatus, createReplacementOrder } from '@/lib/actions';
import { RefreshCw, CheckCircle, XCircle, RotateCcw, AlertCircle, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReturnRequest {
    id: string;
    order_id: string;
    user_id: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    action_type: 'refund' | 'replacement' | null;
    created_at: string;
    order?: {
        id: string;
        user?: { email: string };
        total_amount: number;
    };
}

export default function ReturnsPage() {
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadReturns = async () => {
        setLoading(true);
        // Assuming getReturns fetches with related order info
        const data = await getReturns();
        setReturns(data);
        setLoading(false);
    };

    useEffect(() => { loadReturns(); }, []);

    const handleApproveReplacement = async (id: string) => {
        if (!confirm('Approve this return and auto-create a FREE replacement order?')) return;
        setProcessingId(id);
        const result = await createReplacementOrder(id);
        if (result.success) {
            alert('Replacement Order Created Successfully!');
            loadReturns();
        } else {
            alert('Error: ' + result.error);
        }
        setProcessingId(null);
    };

    const handleReject = async (id: string) => {
        if (!confirm('Reject this return request?')) return;
        setProcessingId(id);
        const result = await updateReturnStatus(id, 'rejected');
        if (result) loadReturns();
        setProcessingId(null);
    };

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Returns & Replacements</h1>
                    <p className="page-subtitle">Manage customer return requests and approvals</p>
                </div>
                <button onClick={loadReturns} className="btn btn-secondary"><RefreshCw size={16} /> Refresh</button>
            </div>

            <div className="card">
                {loading ? <div className="loader mx-auto my-10" /> : returns.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No active return requests found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800">
                        {returns.map((ret) => (
                            <div key={ret.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`badge ${ret.status === 'pending' ? 'badge-warning' : ret.status === 'approved' ? 'badge-success' : 'badge-error'}`}>
                                            {ret.status.toUpperCase()}
                                        </span>
                                        <span className="text-sm text-slate-400">Request from {ret.order?.user?.email || 'Unknown User'}</span>
                                    </div>
                                    <p className="text-white font-medium">Reason: "{ret.reason}"</p>
                                    <p className="text-xs text-slate-500 mt-1">Order ID: #{ret.order_id.slice(0, 8)} • Date: {new Date(ret.created_at).toLocaleDateString()}</p>
                                    {ret.action_type === 'replacement' && (
                                        <p className="text-xs text-blue-400 mt-1 font-medium flex items-center gap-1">
                                            <CheckCircle size={12} /> Replacement Order Created
                                        </p>
                                    )}
                                </div>

                                {ret.status === 'pending' && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleApproveReplacement(ret.id)}
                                            disabled={!!processingId}
                                            className="btn bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 px-3 flex items-center gap-2"
                                        >
                                            {processingId === ret.id ? <div className="loader w-4 h-4 border-2" /> : <RotateCcw size={16} />}
                                            Approve Replacement
                                        </button>
                                        <button
                                            onClick={() => handleReject(ret.id)}
                                            disabled={!!processingId}
                                            className="btn bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 text-sm py-2 px-3"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
