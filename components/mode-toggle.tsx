
'use client';

import { useAdminMode } from '@/components/providers/AdminModeProvider';
import { ShoppingBag, Factory, ArrowRightLeft } from 'lucide-react';

export function ModeToggle() {
    const { mode, toggleMode } = useAdminMode();

    const isWholesale = mode === 'wholesale';

    return (
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
                onClick={() => mode === 'wholesale' && toggleMode()}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'retail'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
            >
                <ShoppingBag size={14} />
                RETAIL
            </button>
            <button
                onClick={() => mode === 'retail' && toggleMode()}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'wholesale'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
            >
                <Factory size={14} />
                B2B (Wholesale)
            </button>
        </div>
    );
}
