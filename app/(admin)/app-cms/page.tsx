'use client';

import { useState, useEffect } from 'react';
import { getBanners, createBanner, deleteBanner, getHeroSlides, createHeroSlide, deleteHeroSlide, uploadImage } from '@/lib/actions';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Image as ImageIcon, Layout, Smartphone, Save, Loader2, ArrowUp, ArrowDown } from 'lucide-react';

export default function AppCMSPage() {
    const [activeTab, setActiveTab] = useState<'hero' | 'banners' | 'layout'>('hero');

    return (
        <div className="page animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="page-title">App Content Management</h1>
                    <p className="page-subtitle">Manage home screen banners, sliders, and layout</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50 w-fit">
                {[
                    { id: 'hero', label: 'Hero Slides', icon: Layout },
                    { id: 'banners', label: 'Promo Banners', icon: ImageIcon },
                    { id: 'layout', label: 'Home Layout', icon: Smartphone }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-lg transition-all
                            ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}
                        `}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'hero' && <HeroSlidesManager />}
                {activeTab === 'banners' && <BannersManager />}
                {activeTab === 'layout' && <LayoutManager />}
            </div>
        </div>
    );
}

// --- Sub Components ---

function HeroSlidesManager() {
    const [slides, setSlides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => { loadSlides(); }, []);

    const loadSlides = async () => {
        const data = await getHeroSlides();
        setSlides(data);
        setLoading(false);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        const res = await uploadImage(formData);
        if (res.success && res.url) {
            await createHeroSlide({
                image_url: res.url,
                display_order: slides.length + 1,
                title: 'New Slide',
                is_active: true
            });
            loadSlides();
        } else {
            alert('Upload failed');
        }
        setUploading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this slide?')) return;
        await deleteHeroSlide(id);
        loadSlides();
    };

    if (loading) return <div className="text-center p-8"><div className="loader"></div></div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Upload Card */}
                <label className="card border-2 border-dashed border-slate-700 bg-slate-800/20 hover:bg-slate-800/40 cursor-pointer flex flex-col items-center justify-center p-8 gap-4 transition-all group">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {uploading ? <Loader2 className="animate-spin text-blue-400" /> : <Plus className="text-blue-400" size={32} />}
                    </div>
                    <span className="text-slate-400 font-medium">Add New Slide</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                </label>

                {/* Slides */}
                {slides.map((slide) => (
                    <div key={slide.id} className="card overflow-hidden group">
                        <div className="relative aspect-video">
                            <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button onClick={() => handleDelete(slide.id)} className="p-2 bg-red-500/80 rounded-full text-white hover:bg-red-500">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                                Order: {slide.display_order}
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-white font-medium truncate">{slide.title || 'Untitled Slide'}</h3>
                            <p className="text-xs text-slate-400">Linked to: {slide.product?.name || 'No Link'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BannersManager() {
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => { loadBanners(); }, []);

    const loadBanners = async () => {
        const data = await getBanners();
        setBanners(data);
        setLoading(false);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        const res = await uploadImage(formData);
        if (res.success && res.url) {
            await createBanner({
                image_url: res.url,
                display_order: banners.length + 1,
                title: 'New Banner',
                is_active: true,
                section: 'home_middle' // Default section
            });
            loadBanners();
        }
        setUploading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete banner?')) return;
        await deleteBanner(id);
        loadBanners();
    };

    if (loading) return <div className="text-center p-8"><div className="loader"></div></div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Upload */}
                <label className="card border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-8 gap-3 cursor-pointer hover:bg-slate-800/50">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                        {uploading ? <Loader2 className="animate-spin text-purple-400" /> : <Plus className="text-purple-400" size={24} />}
                    </div>
                    <span className="text-sm text-slate-400">Add Promo Banner</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                </label>

                {/* List */}
                {banners.map((banner) => (
                    <div key={banner.id} className="card relative group">
                        <div className="w-full h-32 bg-slate-800 relative">
                            <img src={banner.image_url} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => handleDelete(banner.id)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={14} />
                            </button>
                        </div>
                        <div className="p-3">
                            <div className="flex justify-between items-center">
                                <span className="text-white text-sm font-medium">{banner.title}</span>
                                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{banner.section}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LayoutManager() {
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch from app_config
        const fetchLayout = async () => {
            const { data } = await supabase.from('app_config').select('value').eq('key', 'home_layout').single();
            if (data) {
                setSections(data.value);
            }
            setLoading(false);
        };
        fetchLayout();
    }, []);

    const moveSection = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === sections.length - 1) return;

        const newSections = [...sections];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]];
        // Update order property
        newSections.forEach((s, i) => s.order = i + 1);
        setSections(newSections);
    };

    const toggleVisibility = (index: number) => {
        const newSections = [...sections];
        newSections[index].visible = !newSections[index].visible;
        setSections(newSections);
    };

    const saveLayout = async () => {
        setLoading(true);
        const { error } = await supabase.from('app_config').update({ value: sections }).eq('key', 'home_layout');
        if (error) alert('Error saving layout');
        else alert('Layout saved!');
        setLoading(false);
    };

    if (loading) return <div className="text-center p-8"><div className="loader"></div></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-end">
                <button onClick={saveLayout} className="btn btn-primary flex items-center gap-2">
                    <Save size={18} /> Save Layout
                </button>
            </div>

            <div className="space-y-3">
                {sections.map((section, index) => (
                    <div key={section.id} className="card flex items-center gap-4 p-4 border border-slate-700/50">
                        <div className="text-slate-500 font-mono text-xs w-6">{index + 1}</div>
                        <div className="flex-1">
                            <h4 className="text-white font-medium capitalize">{section.id.replace('_', ' ')}</h4>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400 mr-4">
                                <input
                                    type="checkbox"
                                    checked={section.visible}
                                    onChange={() => toggleVisibility(index)}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                                />
                                {section.visible ? 'Visible' : 'Hidden'}
                            </label>

                            <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-2 hover:bg-slate-700 rounded text-slate-400 disabled:opacity-30">
                                <ArrowUp size={18} />
                            </button>
                            <button onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1} className="p-2 hover:bg-slate-700 rounded text-slate-400 disabled:opacity-30">
                                <ArrowDown size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
