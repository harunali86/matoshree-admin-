'use client';

import { useEffect, useState } from 'react';
import { getReviews, updateReviewVerified, deleteReview } from '@/lib/actions';
import { Star, Search, Trash2, CheckCircle, XCircle, Filter, MessageSquare } from 'lucide-react';

interface Review { id: string; rating: number; comment: string; is_verified: boolean; created_at: string; }

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchReviews = async () => {
            const data = await getReviews();
            setReviews(data);
            setLoading(false);
        };
        fetchReviews();
    }, []);

    const toggleVerified = async (id: string, current: boolean) => {
        await updateReviewVerified(id, !current);
        setReviews(reviews.map(r => r.id === id ? { ...r, is_verified: !current } : r));
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete?')) return;
        await deleteReview(id);
        setReviews(reviews.filter(r => r.id !== id));
    };

    const verified = reviews.filter(r => r.is_verified).length;
    const avgRating = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : '0';
    const fourPlus = reviews.filter(r => r.rating >= 4).length;

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reviews</h1>
                    <p className="page-subtitle">Moderate customer reviews and ratings</p>
                </div>
                <button className="btn btn-secondary"><Filter size={16} /> Filter</button>
            </div>

            {/* Stats */}
            <div className="grid-4">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}><MessageSquare size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{reviews.length}</div>
                    <div className="stat-label">Total Reviews</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><CheckCircle size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{verified}</div>
                    <div className="stat-label">Verified</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><Star size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{fourPlus}</div>
                    <div className="stat-label">4+ Stars</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><Star size={22} style={{ color: 'white' }} /></div>
                    <div className="stat-value">{avgRating}</div>
                    <div className="stat-label">Avg Rating</div>
                </div>
            </div>

            {/* Search */}
            <div className="card"><div style={{ padding: 16 }}>
                <div className="input-group"><Search size={18} className="input-icon" /><input placeholder="Search reviews..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-with-icon" /></div>
            </div></div>

            {/* Table */}
            <div className="card">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader"></div></div>
                ) : reviews.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><MessageSquare size={32} style={{ color: '#6b7280' }} /></div>
                        <p style={{ color: 'white', fontWeight: 500 }}>No reviews yet</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Customer</th><th>Rating</th><th>Comment</th><th>Date</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                            <tbody>
                                {reviews.map((r) => (
                                    <tr key={r.id}>
                                        <td style={{ color: 'white' }}>Customer</td>
                                        <td><div style={{ display: 'flex', gap: 2 }}>{[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} style={{ color: i <= r.rating ? '#fbbf24' : '#374151' }} fill={i <= r.rating ? '#fbbf24' : 'none'} />)}</div></td>
                                        <td style={{ color: '#9ca3af', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.comment || '-'}</td>
                                        <td style={{ color: '#9ca3af' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                                        <td><button onClick={() => toggleVerified(r.id, r.is_verified)} className={`badge ${r.is_verified ? 'badge-success' : 'badge-warning'}`} style={{ cursor: 'pointer', border: 'none' }}>{r.is_verified ? 'Verified' : 'Pending'}</button></td>
                                        <td><div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="action-btn" onClick={() => handleDelete(r.id)}><Trash2 size={14} style={{ color: '#f87171' }} /></button></div></td>
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
