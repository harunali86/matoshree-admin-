'use client';

import { Search, Bell, LogOut } from 'lucide-react';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';

export function Header() {
    const router = useRouter();

    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            await logout();
            router.push('/login');
            router.refresh();
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
            <div className="h-16 flex items-center justify-between px-4 md:px-6">
                {/* Left - Spacer for mobile menu */}
                <div className="w-12 lg:w-0" />

                {/* Center / Left on desktop - Search */}
                <div className="hidden sm:flex flex-1 max-w-lg">
                    <div className="relative w-full">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="w-full h-11 pl-12 pr-4 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3">
                    {/* Mode Toggle */}
                    <div className="mr-2">
                        <ModeToggle />
                    </div>

                    {/* Mobile Search */}
                    <button className="sm:hidden p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                        <Search size={20} className="text-slate-400" />
                    </button>

                    {/* Notifications */}
                    <button className="relative p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                        <Bell size={20} className="text-slate-400" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                    </button>

                    {/* Date/Time - Desktop only */}
                    <div className="hidden md:flex flex-col items-end pl-3 border-l border-slate-700">
                        <span className="text-sm font-medium text-white">
                            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-xs text-slate-400">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="p-2.5 bg-slate-800 hover:bg-red-600/20 hover:border-red-500 border border-transparent rounded-xl transition-all"
                        title="Logout"
                    >
                        <LogOut size={20} className="text-slate-400 hover:text-red-400" />
                    </button>
                </div>
            </div>
        </header>
    );
}
