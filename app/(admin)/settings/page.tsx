'use client';

import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '@/lib/actions';
import { Save, Store, Phone, Clock, Instagram } from 'lucide-react';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('store');
    const [settings, setSettings] = useState({
        store_name: '', tagline: '', gst_number: '', store_timing: '',
        phone: '', whatsapp: '', email: '', address: '',
        instagram: '', facebook: '',
        min_order: '', delivery_charge: '', free_delivery_above: '',
        privacy_policy: '', terms: '', about: '',
    });

    useEffect(() => {
        const loadSettings = async () => {
            const data = await getSettings();
            if (data) {
                setSettings({
                    store_name: data.store?.name || 'Matoshree Footwear',
                    tagline: data.store?.tagline || '',
                    gst_number: data.store?.gst_number || '',
                    store_timing: data.store?.timing || '',
                    phone: data.store?.phone || '',
                    whatsapp: data.store?.whatsapp || '',
                    email: data.store?.email || '',
                    address: data.store?.address || '',
                    instagram: data.store?.instagram || '',
                    facebook: data.store?.facebook || '',
                    min_order: data.shipping?.min_order?.toString() || '',
                    delivery_charge: data.shipping?.delivery_charge?.toString() || '',
                    free_delivery_above: data.shipping?.free_delivery_above?.toString() || '',
                    privacy_policy: data.pages?.privacy_policy || '',
                    terms: data.pages?.terms || '',
                    about: data.pages?.about || '',
                });
            }
            setLoading(false);
        };
        loadSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        await saveSettings({
            store: { name: settings.store_name, tagline: settings.tagline, gst_number: settings.gst_number, timing: settings.store_timing, phone: settings.phone, whatsapp: settings.whatsapp, email: settings.email, address: settings.address, instagram: settings.instagram, facebook: settings.facebook },
            shipping: { min_order: parseFloat(settings.min_order) || 0, delivery_charge: parseFloat(settings.delivery_charge) || 0, free_delivery_above: parseFloat(settings.free_delivery_above) || 0 },
            pages: { privacy_policy: settings.privacy_policy, terms: settings.terms, about: settings.about },
        });
        setSaving(false);
        alert('Settings saved!');
    };

    const tabs = [
        { id: 'store', label: 'Store', icon: Store },
        { id: 'contact', label: 'Contact', icon: Phone },
        { id: 'social', label: 'Social', icon: Instagram },
        { id: 'shipping', label: 'Shipping', icon: Clock },
    ];

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="loader"></div></div>;

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your store configuration</p>
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
                    </div>
                </div>
            </div>
        </div>
    );
}
