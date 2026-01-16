'use client';

import { useEffect, useState } from 'react';
import { getProducts, updateProduct, deleteProduct } from '@/lib/actions';
import { Plus, Search, Pencil, Trash2, Package, RefreshCw, Eye, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    price: number;
    sale_price: number | null;
    stock: number;
    thumbnail: string;
    is_active: boolean;
    is_bestseller: boolean;
    is_new_arrival: boolean;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchProducts = async () => {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setLoading(false);
    };

    useEffect(() => { fetchProducts(); }, []);

    const toggleActive = async (id: string, current: boolean) => {
        await updateProduct(id, { is_active: !current });
        setProducts(products.map(p => p.id === id ? { ...p, is_active: !current } : p));
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
    };

    const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
    const formatPrice = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

    return (
        <div className="page animate-fadeIn">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Products</h1>
                    <p className="page-subtitle">Manage your product inventory</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={fetchProducts} className="btn btn-secondary"><RefreshCw size={16} /> Refresh</button>
                    <Link href="/products/new" className="btn btn-primary"><Plus size={18} /> Add Product</Link>
                </div>
            </div>

            {/* Search */}
            <div className="card">
                <div style={{ padding: 16 }}>
                    <div className="input-group">
                        <Search size={18} className="input-icon" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-with-icon"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                        <div className="loader"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><Package size={32} style={{ color: '#6b7280' }} /></div>
                        <p style={{ color: 'white', fontWeight: 500 }}>No products found</p>
                        <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>Add your first product</p>
                        <Link href="/products/new" className="btn btn-primary" style={{ marginTop: 16 }}><Plus size={16} /> Add Product</Link>
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((p) => (
                                        <tr key={p.id} className={p.stock < 10 ? 'bg-red-500/5 hover:bg-red-500/10' : ''}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div className="product-thumb">
                                                        {p.thumbnail ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={p.thumbnail} alt={p.name} />
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Package size={18} style={{ color: '#6b7280' }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: 500, color: 'white' }}>{p.name}</p>
                                                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                                            {p.is_bestseller && <span className="badge badge-warning">Bestseller</span>}
                                                            {p.is_new_arrival && <span className="badge badge-success">New</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <p style={{ fontWeight: 600, color: 'white' }}>{formatPrice(p.price)}</p>
                                                {p.sale_price && <p style={{ color: '#34d399', fontSize: 13 }}>{formatPrice(p.sale_price)}</p>}
                                            </td>
                                            <td>
                                                {p.stock < 10 ? (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/20 w-fit">
                                                        <AlertTriangle size={12} className="text-red-500" />
                                                        <span className="text-xs font-bold text-red-500">{p.stock} LOW STOCK</span>
                                                    </div>
                                                ) : (
                                                    <span className={`badge ${p.stock > 10 ? 'badge-success' : 'badge-warning'}`}>
                                                        {p.stock} in stock
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <button onClick={() => toggleActive(p.id, p.is_active)} className={`badge ${p.is_active ? 'badge-success' : 'badge-error'}`} style={{ cursor: 'pointer', border: 'none' }}>
                                                    {p.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                                    <button className="action-btn" title="View"><Eye size={16} style={{ color: '#9ca3af' }} /></button>
                                                    <Link href={`/products/${p.id}/edit`} className="action-btn" title="Edit"><Pencil size={16} style={{ color: '#9ca3af' }} /></Link>
                                                    <button className="action-btn" onClick={() => handleDelete(p.id)} title="Delete"><Trash2 size={16} style={{ color: '#f87171' }} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ padding: 16, borderTop: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: 14, color: '#9ca3af' }}>Showing {filtered.length} of {products.length} products</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
