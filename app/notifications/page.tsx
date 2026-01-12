'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Users, User, Clock, CheckCircle } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    audience: string;
    sent_at: string;
    status: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: '1', title: 'New Year Sale!', message: 'Get 20% off on all products', audience: 'all', sent_at: '2026-01-01', status: 'sent' },
        { id: '2', title: 'Flash Sale Today', message: 'Limited time offer - 50% off', audience: 'all', sent_at: '2026-01-10', status: 'sent' },
    ]);
    const [form, setForm] = useState({ title: '', message: '', audience: 'all' });
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!form.title || !form.message) return alert('Fill all fields');
        setSending(true);

        // Simulate sending
        await new Promise(r => setTimeout(r, 1500));

        setNotifications([
            { id: Date.now().toString(), ...form, sent_at: new Date().toISOString(), status: 'sent' },
            ...notifications
        ]);
        setForm({ title: '', message: '', audience: 'all' });
        setSending(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Push Notifications</h1>
                <p className="text-gray-500 mt-1">Send notifications to your customers</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Send Form */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <Bell size={20} className="text-orange-500" />
                            Send Notification
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium block mb-2">Title</label>
                                <Input
                                    placeholder="Notification title"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-2">Message</label>
                                <textarea
                                    className="w-full border rounded-lg p-3 text-sm min-h-[100px]"
                                    placeholder="Your message here..."
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-2">Send To</label>
                                <select
                                    className="w-full border rounded-lg p-2 text-sm"
                                    value={form.audience}
                                    onChange={(e) => setForm({ ...form, audience: e.target.value })}
                                >
                                    <option value="all">All Users</option>
                                    <option value="active">Active Customers</option>
                                    <option value="new">New Signups</option>
                                </select>
                            </div>
                            <Button
                                onClick={handleSend}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                                disabled={sending}
                            >
                                {sending ? (
                                    <>Sending...</>
                                ) : (
                                    <><Send size={16} className="mr-2" /> Send Notification</>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* History */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Clock size={20} className="text-gray-500" />
                        Notification History
                    </h3>

                    {notifications.length === 0 ? (
                        <Card className="border-0 shadow-sm">
                            <CardContent className="py-12 text-center">
                                <Bell size={48} className="mx-auto mb-3 text-gray-300" />
                                <p className="text-gray-500">No notifications sent yet</p>
                            </CardContent>
                        </Card>
                    ) : (
                        notifications.map((notif) => (
                            <Card key={notif.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <CheckCircle size={20} className="text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{notif.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Users size={12} />
                                                        {notif.audience === 'all' ? 'All Users' : notif.audience}
                                                    </span>
                                                    <span>{new Date(notif.sent_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-700">Sent</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
