
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type AdminMode = 'retail' | 'wholesale';

interface AdminModeContextType {
    mode: AdminMode;
    setMode: (mode: AdminMode) => void;
    toggleMode: () => void;
    isWholesale: boolean;
}

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined);

export function AdminModeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<AdminMode>('retail');

    // Persist mode selection
    useEffect(() => {
        const savedMode = localStorage.getItem('admin_mode') as AdminMode;
        if (savedMode) setMode(savedMode);
    }, []);

    const handleSetMode = (newMode: AdminMode) => {
        setMode(newMode);
        localStorage.setItem('admin_mode', newMode);

        // Optional: visual feedback or toast could go here
        // but better handled in the UI component
    };

    const toggleMode = () => {
        handleSetMode(mode === 'retail' ? 'wholesale' : 'retail');
    };

    return (
        <AdminModeContext.Provider
            value={{
                mode,
                setMode: handleSetMode,
                toggleMode,
                isWholesale: mode === 'wholesale'
            }}
        >
            <div
                data-mode={mode}
                className={mode === 'wholesale' ? 'theme-wholesale' : 'theme-retail'}
            >
                {children}
            </div>
        </AdminModeContext.Provider>
    );
}

export function useAdminMode() {
    const context = useContext(AdminModeContext);
    if (context === undefined) {
        throw new Error('useAdminMode must be used within an AdminModeProvider');
    }
    return context;
}
