'use client';

import { useEffect, useState } from 'react';
import { getSettings, saveSettings, getAppConfig, updateAppConfig } from '@/lib/actions';
import { Save, Store, Phone, Clock, Instagram, Smartphone, Bell, Power, AlertTriangle, Send } from 'lucide-react';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('store');

    // Store Settings
    const [settings, setSettings] = useState({
        store_name: '', tagline: '', gst_number: '', store_timing: '',
        phone: '', whatsapp: '', email: '', address: '',
        instagram: '', facebook: '',
        min_order: '', delivery_charge: '', free_delivery_above: '',
        privacy_policy: '', terms: '', about: '',
    });

    // System Settings
    const [systemSettings, setSystemSettings] = useState({
        maintenance_mode: false,
        min_app_version: '1.0.0',
        enable_cod: true,
        enable_b2b_credit: false
    });

    // Notification State
    const [notif, setNotif] = useState({ title: '', body: '', target: 'all' });

    useEffect(() => {
        const loadSettings = async () => {
            const [storeData, systemData] = await Promise.all([
                getSettings(),
                getAppConfig('system_settings')
            ]);

            if (storeData) {
                setSettings({
                    store_name: storeData.store?.name || 'Matoshree Footwear',
                    tagline: storeData.store?.tagline || '',
                    gst_number: storeData.store?.gst_number || '',
                    store_timing: storeData.store?.timing || '',
                    phone: storeData.store?.phone || '',
                    whatsapp: storeData.store?.whatsapp || '',
                    email: storeData.store?.email || '',
                    address: storeData.store?.address || '',
                    instagram: storeData.store?.instagram || '',
                    facebook: storeData.store?.facebook || '',
                    min_order: storeData.shipping?.min_order?.toString() || '',
                    delivery_charge: storeData.shipping?.delivery_charge?.toString() || '',
                    free_delivery_above: storeData.shipping?.free_delivery_above?.toString() || '',
                    privacy_policy: storeData.pages?.privacy_policy || '',
                    terms: storeData.pages?.terms || '',
                    about: storeData.pages?.about || '',
                });
            }

            if (systemData) {
                setSystemSettings(systemData);
            }
            setLoading(false);
        };
        loadSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        // Save Store Settings
        await saveSettings({
            store: { name: settings.store_name, tagline: settings.tagline, gst_number: settings.gst_number, timing: settings.store_timing, phone: settings.phone, whatsapp: settings.whatsapp, email: settings.email, address: settings.address, instagram: settings.instagram, facebook: settings.facebook },
            shipping: { min_order: parseFloat(settings.min_order) || 0, delivery_charge: parseFloat(settings.delivery_charge) || 0, free_delivery_above: parseFloat(settings.free_delivery_above) || 0 },
            pages: { privacy_policy: settings.privacy_policy, terms: settings.terms, about: settings.about },
        });

        // Save System Settings
        await updateAppConfig('system_settings', systemSettings);

        setSaving(false);
        alert('All settings saved successfully!');
    };

    const sendNotification = () => {
        alert(`Sending "${notif.title}" to ${notif.target.toUpperCase()} users... (Simulation)`);
        setNotif({ title: '', body: '', target: 'all' });
    };

    const tabs = [
        { id: 'store', label: 'Store', icon: Store },
        { id: 'contact', label: 'Contact', icon: Phone },
        { id: 'social', label: 'Social', icon: Instagram },
        { id: 'shipping', label: 'Shipping', icon: Clock },
        { id: 'system', label: 'App Control', icon: Smartphone },
        { id: 'notifications', label: 'Push Notif.', icon: Bell },
    ];

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="loader"></div></div>;

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings & Control</h1>
                    <p className="page-subtitle">Manage store config and global app controls</p>
                </div>
                <button onClick={handleSave} className="btn btn-primary" disabled={saving}><Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
                {/* Tabs */}
                <div className="card" style={{ padding: 8, height: 'fit-content' }}>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', background: activeTab === tab.id ? '#3b82f6' : 'transparent', border: 'none', borderRadius: 8, color: activeTab === tab.id ? 'white' : '#9ca3af', fontSize: 14, cursor: 'pointer', textAlign: 'left' }}>
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="card">
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {activeTab === 'store' && (
                            <>
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 8 }}>Store Information</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div><label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Store Name</label><input value={settings.store_name} onChange={(e) => setSettings({ ...settings, store_name: e.target.value })} /></div>
                                    <div><label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Tagline</label><input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} /></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div><label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>GST Number</label><input value={settings.gst_number} onChange={(e) => setSettings({ ...settings, gst_number: e.target.value })} placeholder="Optional" /></div>
                                    <div><label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Store Timing</label><input value={settings.store_timing} onChange={(e) => setSettings({ ...settings, store_timing: e.target.value })} placeholder="10 AM - 9 PM" /></div>
                                </div>
                                <div><label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Address</label><textarea value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} style={{ height: 80, resize: 'none', padding: 12 }} placeholder="Store address" /></div>
                            </>
                        )}

                        {activeTab === 'contact' && (
                            <>
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 8 }}>Contact Information</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div><label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Phone</label><input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" /></div>
                                    <div><label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>WhatsApp</label><input value={settings.whatsapp} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} placeholder="+91 XXXXX XXXXX" /></div>
                                </div>
                                <div><label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Email</label><input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} placeholder="store@example.com" /></div>
                            </>
                        )}

                        {activeTab === 'social' && (
                            <>
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 8 }}>Social Media</h3>
                                <div><label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Instagram Username</label><input value={settings.instagram} onChange={(e) => setSettings({ ...settings, instagram: e.target.value })} placeholder="@username" /></div>
                                <div><label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Facebook Page</label><input value={settings.facebook} onChange={(e) => setSettings({ ...settings, facebook: e.target.value })} placeholder="facebook.com/page" /></div>
                            </>
                        )}

                        {activeTab === 'shipping' && (
                            <>
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 8 }}>Shipping Settings</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                                    <div><label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Min Order (₹)</label><input type="number" value={settings.min_order} onChange={(e) => setSettings({ ...settings, min_order: e.target.value })} placeholder="500" /></div>
                                    <div><label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Delivery Charge (₹)</label><input type="number" value={settings.delivery_charge} onChange={(e) => setSettings({ ...settings, delivery_charge: e.target.value })} placeholder="50" /></div>
                                    <div><label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Free Above (₹)</label><input type="number" value={settings.free_delivery_above} onChange={(e) => setSettings({ ...settings, free_delivery_above: e.target.value })} placeholder="1000" /></div>
                                </div>
                            </>
                        )}

                        {activeTab === 'system' && (
                            <div className="space-y-6">
                                <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="text-red-400" size={24} />
                                            <div>
                                                <h4 className="text-white font-medium">Maintenance Mode</h4>
                                                <p className="text-sm text-red-200/70">Instantly lock the app for all users</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={systemSettings.maintenance_mode} onChange={(e) => setSystemSettings({ ...systemSettings, maintenance_mode: e.target.checked })} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="card border border-slate-700 p-4">
                                        <h4 className="text-white font-medium mb-4 flex items-center gap-2"><Smartphone size={18} /> App Version</h4>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-400">Min. Required Version</label>
                                            <input
                                                value={systemSettings.min_app_version}
                                                onChange={(e) => setSystemSettings({ ...systemSettings, min_app_version: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                                            />
                                            <p className="text-xs text-slate-500">Force users to update if below this version</p>
                                        </div>
                                    </div>

                                    <div className="card border border-slate-700 p-4">
                                        <h4 className="text-white font-medium mb-4 flex items-center gap-2"><Power size={18} /> Feature Toggles</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-300">Enable Cash on Delivery</span>
                                                <input type="checkbox" checked={systemSettings.enable_cod} onChange={(e) => setSystemSettings({ ...systemSettings, enable_cod: e.target.checked })} className="w-4 h-4 rounded" />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-300">Enable B2B Credit Limits</span>
                                                <input type="checkbox" checked={systemSettings.enable_b2b_credit} onChange={(e) => setSystemSettings({ ...systemSettings, enable_b2b_credit: e.target.checked })} className="w-4 h-4 rounded" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div className="card border border-slate-700 p-6 bg-slate-800/30">
                                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                        <Send size={20} className="text-blue-400" /> Send Push Notification
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Title</label>
                                            <input
                                                value={notif.title}
                                                onChange={(e) => setNotif({ ...notif, title: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                                                placeholder="e.g. Mega Sale - 50% Off!"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Message Body</label>
                                            <textarea
                                                value={notif.body}
                                                onChange={(e) => setNotif({ ...notif, body: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white h-24"
                                                placeholder="Enter notification content..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Target Audience</label>
                                            <select
                                                value={notif.target}
                                                onChange={(e) => setNotif({ ...notif, target: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                                            >
                                                <option value="all">All Users</option>
                                                <option value="retail">Retail Customers</option>
                                                <option value="wholesale">Wholesale Dealers</option>
                                            </select>
                                        </div>

                                        <button
                                            onClick={sendNotification}
                                            disabled={!notif.title || !notif.body}
                                            className="btn btn-primary w-full flex justify-center items-center gap-2 mt-4"
                                        >
                                            <Send size={18} /> Send Blast
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
