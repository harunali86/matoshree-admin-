import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { checkAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminModeProvider } from '@/components/providers/AdminModeProvider';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const { authenticated } = await checkAuth();
    if (!authenticated) {
        redirect('/login');
    }

    return (
        <AdminModeProvider>
            <style>{`
                @media (min-width: 1024px) {
                    .admin-main-content {
                        margin-left: 256px !important;
                    }
                }
            `}</style>
            <div style={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar />
                <div className="admin-main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#020617' }}>
                    <Header />
                    <main style={{ flex: 1, padding: 24, overflowX: 'hidden' }}>
                        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AdminModeProvider>
    );
}
