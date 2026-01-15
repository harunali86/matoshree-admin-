'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, MapPin, Phone, Mail, Package, Printer, Calendar, CreditCard, User } from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        // Fetch order with related data
        const { data: orderData, error } = await supabase
            .from('orders')
            .select(`
                *,
                address:addresses(*),
                user:user_id(email, raw_user_meta_data),
                items:order_items(
                    *,
                    product:products(name, thumbnail, price)
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching order:', error);
        } else {
            console.log('Order Data:', orderData);
            setOrder(orderData);
        }
        setLoading(false);
    };

    const updateStatus = async (newStatus: string) => {
        if (!confirm(`Update status to ${newStatus}?`)) return;

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            alert('Failed to update status');
        } else {
            fetchOrderDetails();
        }
    };

    if (loading) return <div className="flex justify-center items-center h-96"><div className="loader"></div></div>;
    if (!order) return <div className="text-center text-white py-20">Order not found</div>;

    const { address, user, items } = order;
    const userData = user?.raw_user_meta_data || {};

    return (
        <div className="page animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/orders" className="btn btn-secondary p-2"><ArrowLeft size={20} /></Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="page-title">Order #{order.invoice_number || order.id.slice(0, 8)}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${order.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="page-subtitle">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="btn btn-secondary flex items-center gap-2" onClick={() => window.print()}>
                        <Printer size={18} /> Print Invoice
                    </button>
                    {order.status === 'Pending' && (
                        <button onClick={() => updateStatus('Processing')} className="btn bg-blue-600 hover:bg-blue-700 text-white">
                            Mark Processing
                        </button>
                    )}
                    {order.status === 'Processing' && (
                        <button onClick={() => updateStatus('Shipped')} className="btn bg-purple-600 hover:bg-purple-700 text-white">
                            Mark Shipped
                        </button>
                    )}
                    {order.status === 'Shipped' && (
                        <button onClick={() => updateStatus('Delivered')} className="btn bg-green-600 hover:bg-green-700 text-white">
                            Mark Delivered
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <div className="card-header pb-4 border-b border-gray-700 mb-4">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                <Package size={20} className="text-blue-500" /> Order Items ({items.length})
                            </h3>
                        </div>
                        <div className="space-y-4">
                            {items.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-lg">
                                    <div className="w-16 h-16 bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.product?.thumbnail || '/placeholder.png'} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-medium">{item.product?.name || 'Unknown Product'}</h4>
                                        <p className="text-sm text-gray-400">Size: {item.size || 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-medium">₹{item.price?.toLocaleString()}</p>
                                        <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right w-24">
                                        <p className="text-blue-400 font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-700 space-y-2">
                            <div className="flex justify-between text-gray-400">
                                <span>Subtotal</span>
                                <span>₹{order.total_amount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-white mt-4 pt-4 border-t border-gray-700">
                                <span>Total</span>
                                <span>₹{order.total_amount?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Customer & Shipping */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="card">
                        <div className="card-header pb-4 border-b border-gray-700 mb-4">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                <User size={20} className="text-purple-500" /> Customer
                            </h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                    {(userData.full_name || order.user?.email || 'G')[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-white font-medium">{userData.full_name || 'Guest'}</p>
                                    <p className="text-sm text-gray-400">{order.user?.email || 'No email'}</p>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-gray-700/50">
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                    <Phone size={14} /> <span>{userData.phone || address?.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Calendar size={14} /> <span>Member since {new Date(order.user?.created_at || Date.now()).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="card">
                        <div className="card-header pb-4 border-b border-gray-700 mb-4">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                <MapPin size={20} className="text-orange-500" /> Shipping Address
                            </h3>
                        </div>
                        {address ? (
                            <div className="text-gray-300 space-y-1 text-sm">
                                <p className="font-medium text-white text-base mb-2">{address.name}</p>
                                <p>{address.address_line}</p>
                                <p>{address.city}, {address.state}</p>
                                <p>{address.pincode}</p>
                                <p className="mt-2 text-gray-400">Phone: {address.phone}</p>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No address details available</p>
                        )}
                    </div>

                    {/* Payment Info */}
                    <div className="card">
                        <div className="card-header pb-4 border-b border-gray-700 mb-4">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                <CreditCard size={20} className="text-green-500" /> Payment Info
                            </h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Method</span>
                                <span className="text-white font-medium uppercase">{order.payment_method || 'COD'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Status</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.payment_status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {order.payment_status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
