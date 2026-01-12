'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { logout as logoutAction } from '@/lib/auth';
import {
    LayoutDashboard, Package, FolderOpen, Tag, Palette, Image, ShoppingCart, Users,
    Ticket, Star, FileText, BarChart3, Settings, Menu, X, LogOut, Bell
} from 'lucide-react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Package, label: 'Products', href: '/products' },
    { icon: FolderOpen, label: 'Categories', href: '/categories' },
    { icon: Tag, label: 'Brands', href: '/brands' },
    { icon: Palette, label: 'Collections', href: '/collections' },
    { icon: Image, label: 'Banners', href: '/banners' },
    { icon: LayoutDashboard, label: 'Hero Slides', href: '/hero' },
    { icon: ShoppingCart, label: 'Orders', href: '/orders' },
    { icon: Users, label: 'Customers', href: '/customers' },
    { icon: Ticket, label: 'Coupons', href: '/coupons' },
    { icon: Star, label: 'Reviews', href: '/reviews' },
    { icon: FileText, label: 'Blogs', href: '/blogs' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: BarChart3, label: 'Reports', href: '/reports' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        if (confirm('Logout?')) {
            await logoutAction();
            router.push('/login');
            router.refresh();
        }
    };

    useEffect(() => {
        const checkWidth = () => setIsDesktop(window.innerWidth >= 1024);
        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
    }, []);

    const showSidebar = isDesktop || isOpen;

    return (
        <>
            {/* Mobile Toggle Button - Only on mobile */}
            {!isDesktop && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        position: 'fixed',
                        top: 16,
                        left: 16,
                        zIndex: 60,
                        padding: 10,
                        background: '#1e293b',
                        borderRadius: 12,
                        border: '1px solid #334155',
                    }}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={22} className="text-white" /> : <Menu size={22} className="text-white" />}
                </button>
            )}

            {/* Mobile Overlay */}
            {!isDesktop && isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 50,
                    }}
                />
            )}

            {/* Sidebar */}
            <aside
                style={{
                    position: isDesktop ? 'fixed' : 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 55,
                    height: '100vh',
                    width: 256,
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#0f172a',
                    borderRight: '1px solid #1e293b',
                    transform: showSidebar ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s ease',
                }}
            >
                {/* Logo */}
                <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40,
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            borderRadius: 12,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Package size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 style={{ fontWeight: 700, color: 'white', fontSize: 18, margin: 0 }}>Matoshree</h1>
                            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
                    <p style={{ padding: '0 12px', marginBottom: 12, fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: 1 }}>Menu</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '10px 16px',
                                        borderRadius: 12,
                                        fontSize: 14,
                                        fontWeight: 500,
                                        textDecoration: 'none',
                                        background: isActive ? '#3b82f6' : 'transparent',
                                        color: isActive ? 'white' : '#94a3b8',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <item.icon size={18} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Info */}
                <div style={{ padding: 16, borderTop: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, background: 'rgba(30,41,59,0.5)' }}>
                        <div style={{
                            width: 40, height: 40,
                            background: 'linear-gradient(135deg, #4ade80, #10b981)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700
                        }}>
                            A
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 500, color: 'white', margin: 0 }}>Admin</p>
                            <p style={{ fontSize: 12, color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 8, height: 8, background: '#4ade80', borderRadius: '50%' }}></span>
                                Online
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{ padding: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
                            title="Logout"
                        >
                            <LogOut size={16} className="text-slate-400 hover:text-red-400 transition-colors" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
