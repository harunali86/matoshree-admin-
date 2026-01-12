'use client';

import { useState } from 'react';
import { sendNotificationToAll } from '@/lib/actions';
import { Send, CheckCircle, AlertTriangle } from 'lucide-react';

export default function NotificationsPage() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [resultMsg, setResultMsg] = useState('');

    const handleSend = async () => {
        if (!title || !body) return;
        setSending(true);
        setStatus('idle');

        const res = await sendNotificationToAll(title, body);
        setSending(false);

        if (res.success) {
            setStatus('success');
            setResultMsg(`Success! Notification sent to ${res.count} devices.`);
            setTitle('');
            setBody('');
        } else {
            setStatus('error');
            setResultMsg(res.error || 'Failed to send');
        }
    };

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Push Notifications</h1>
                    <p className="page-subtitle">Send marketing alerts to all app users</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 600 }}>
                <div style={{ padding: 24 }}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#9ca3af' }}>Notification Title</label>
                        <input
                            placeholder="e.g. Flash Sale Live! ⚡"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px', background: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#9ca3af' }}>Message Body</label>
                        <textarea
                            placeholder="Get 50% off on all Nike shoes today..."
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            style={{ width: '100%', height: 120, padding: '12px 16px', background: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: 'white', outline: 'none', resize: 'none' }}
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={sending || !title || !body}
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', height: 48, fontSize: 15 }}
                    >
                        {sending ? 'Sending...' : <><Send size={18} /> Send Notification</>}
                    </button>

                    {status === 'success' && (
                        <div style={{ marginTop: 20, padding: 12, background: 'rgba(220, 252, 231, 0.1)', borderRadius: 8, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                            <CheckCircle size={20} />
                            <span>{resultMsg}</span>
                        </div>
                    )}
                    {status === 'error' && (
                        <div style={{ marginTop: 20, padding: 12, background: 'rgba(254, 226, 226, 0.1)', borderRadius: 8, color: '#f87171', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                            <AlertTriangle size={20} />
                            <span>{resultMsg}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
