'use client';

import { useState, useEffect } from 'react';
import { getProducts } from '@/lib/actions';
import { Tag, Search, Package, ArrowRight, Edit3, Plus } from 'lucide-react';
import Link from 'next/link';

export default function PriceTiersPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const data = await getProducts();
        // Filter products that have tiers or wholesale pricing
        setProducts(data);
        setLoading(false);
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        (p.price_wholesale > 0 || (p.price_tiers && p.price_tiers.length > 0))
    );

    const formatPrice = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Price Tiers</h1>
                    <p className="page-subtitle">Manage volume-based discounts and wholesale rates</p>
                </div>
                <Link href="/products/new" className="btn btn-primary">
                    <Plus size={18} className="mr-2" />
                    New Product
                </Link>
            </div>

            <div className="card mb-6">
                <div style={{ padding: 16 }}>
                    <div className="input-group">
                        <Search size={18} className="input-icon" />
                        <input
                            placeholder="Search products with tiers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-with-icon"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center"><div className="loader"></div></div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full card p-20 text-center text-slate-500">
                        <Tag size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No volume pricing rules found.</p>
                        <p className="text-sm">Edit a product to add wholesale rates or tiered pricing.</p>
                    </div>
                ) : (
                    filtered.map((product) => (
                        <div key={product.id} className="card hover:border-slate-600 transition-colors flex flex-col">
                            <div className="p-5 flex gap-4 border-b border-slate-800">
                                <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0">
                                    <img src={product.thumbnail || product.images?.[0]} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-white truncate mb-1">{product.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-400 line-through">{formatPrice(product.price)}</span>
                                        <span className="text-sm text-indigo-400 font-bold">WS: {formatPrice(product.price_wholesale)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 flex-1 space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Volume Tiers</h4>
                                    <div className="space-y-2">
                                        {product.price_tiers?.length > 0 ? (
                                            product.price_tiers.sort((a: any, b: any) => a.min_quantity - b.min_quantity).map((tier: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                                    <span className="text-sm text-slate-300">Buy {tier.min_quantity}+</span>
                                                    <span className="text-sm font-bold text-emerald-400">{formatPrice(tier.unit_price)}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-xs text-slate-500 italic p-3 bg-slate-800/30 rounded-lg text-center">
                                                No tiers defined. Using flat wholesale rate.
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <p className="text-xs text-slate-500">MOQ: <span className="text-white font-medium">{product.moq || 1} units</span></p>
                                </div>
                            </div>

                            <Link
                                href={`/products/${product.id}/edit`}
                                className="p-4 bg-slate-800/50 border-t border-slate-800 flex justify-center items-center gap-2 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
                            >
                                <Edit3 size={16} />
                                Update Pricing
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
