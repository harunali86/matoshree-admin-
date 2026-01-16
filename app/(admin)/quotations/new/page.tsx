'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createQuotation, getProducts } from '@/lib/actions';
import { ArrowLeft, Save, Plus, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function NewQuotationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [customerId, setCustomerId] = useState('');
    const [items, setItems] = useState<{ product_id: string, name: string, quantity: number, unit_price: number }[]>([]);
    const [validUntil, setValidUntil] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Fetch customers (profiles)
        const { data: profiles } = await supabase.from('profiles').select('*').order('full_name');
        if (profiles) setCustomers(profiles);

        // Fetch products
        const prods = await getProducts();
        setProducts(prods);

        // Set default validity (7 days)
        const date = new Date();
        date.setDate(date.getDate() + 7);
        setValidUntil(date.toISOString().split('T')[0]);
    };

    const addItem = (product: any) => {
        const existing = items.find(i => i.product_id === product.id);
        if (existing) return;

        setItems([...items, {
            product_id: product.id,
            name: product.name,
            quantity: 1,
            unit_price: product.price_wholesale || product.price
        }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: string) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = parseFloat(value);
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerId || items.length === 0) {
            alert('Please select a customer and add at least one item.');
            return;
        }

        setLoading(true);
        const result = await createQuotation({
            customer_id: customerId,
            items: items,
            total_amount: calculateTotal(),
            status: 'pending',
            valid_until: validUntil
        });

        if (result.success) {
            router.push('/quotations');
        } else {
            alert('Error: ' + result.error);
        }
        setLoading(false);
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="page animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/quotations" className="btn btn-secondary p-2.5"><ArrowLeft size={18} /></Link>
                <div>
                    <h1 className="page-title">New Quotation</h1>
                    <p className="page-subtitle">Create a price quote for a customer</p>
                </div>
            </div>

            <div className="grid grid-cols-[1fr_350px] gap-6">
                {/* Left: Quote Builder */}
                <div className="space-y-6">
                    {/* Customer Selection */}
                    <div className="card">
                        <div className="card-header"><h3 className="font-semibold text-white">Customer Details</h3></div>
                        <div className="card-body">
                            <label className="block text-sm text-slate-400 mb-2">Select Customer</label>
                            <select
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">-- Choose Customer --</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.business_name ? `${c.business_name} (${c.full_name})` : c.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="card">
                        <div className="card-header flex justify-between items-center">
                            <h3 className="font-semibold text-white">Line Items</h3>
                            <span className="text-sm text-slate-400">{items.length} items added</span>
                        </div>
                        <div className="card-body">
                            <div className="overflow-hidden rounded-lg border border-slate-700/50 mb-4">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-800/50 text-slate-400">
                                        <tr>
                                            <th className="p-3">Product</th>
                                            <th className="p-3 w-24">Qty</th>
                                            <th className="p-3 w-32">Unit Price</th>
                                            <th className="p-3 w-32 text-right">Total</th>
                                            <th className="p-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="p-3 text-white font-medium">{item.name}</td>
                                                <td className="p-3">
                                                    <input type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-center text-white" min="1" />
                                                </td>
                                                <td className="p-3">
                                                    <input type="number" value={item.unit_price} onChange={(e) => updateItem(index, 'unit_price', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-right text-white" />
                                                </td>
                                                <td className="p-3 text-right text-emerald-400 font-medium">
                                                    ₹{(item.quantity * item.unit_price).toLocaleString()}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <button onClick={() => removeItem(index)} className="text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {items.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-slate-500 italic">No products added yet. Select from the list on the right.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {items.length > 0 && (
                                        <tfoot className="bg-slate-800/30">
                                            <tr>
                                                <td colSpan={3} className="p-3 text-right text-slate-400 font-medium">Grand Total:</td>
                                                <td className="p-3 text-right text-white font-bold text-lg">₹{calculateTotal().toLocaleString()}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <label className="text-sm text-slate-400">Valid Until:</label>
                                <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-white text-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Product Selector */}
                <div className="flex flex-col h-[calc(100vh-140px)] sticky top-6">
                    <div className="card h-full flex flex-col">
                        <div className="card-header">
                            <h3 className="font-semibold text-white mb-3">Add Products</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                                <input
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="card-body p-0 flex-1 overflow-y-auto">
                            <div className="divide-y divide-slate-700/50">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="p-3 hover:bg-slate-800/50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-slate-800 overflow-hidden">
                                                <img src={product.thumbnail || product.images?.[0]} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-white font-medium line-clamp-1">{product.name}</p>
                                                <p className="text-xs text-slate-500">Stock: {product.stock}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => addItem(product)}
                                            className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn btn-primary w-full mt-4 py-3 text-base shadow-lg shadow-indigo-500/20"
                    >
                        <Save size={18} className="mr-2" />
                        {loading ? 'Creating Quote...' : 'Create Quotation'}
                    </button>
                </div>
            </div>
        </div>
    );
}
