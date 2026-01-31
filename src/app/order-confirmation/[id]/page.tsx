'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Order, OrderItem } from '@/types/orders';
import Link from 'next/link';
import Image from 'next/image';

export default function OrderConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single();

                if (orderError) throw orderError;

                const { data: itemsData, error: itemsError } = await supabase
                    .from('order_items')
                    .select('*')
                    .eq('order_id', orderId);

                if (itemsError) throw itemsError;

                setOrder(orderData);
                setOrderItems(itemsData);
            } catch (err) {
                console.error('Failed to fetch order:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const formatPrice = (price: number) => `KSh ${price.toLocaleString()}`;

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-terracotta-100 border-t-terracotta-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-charcoal font-bold animate-pulse uppercase tracking-[0.2em]">Authenticating Receipt...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-white py-20 px-4 flex items-center justify-center">
                <div className="max-w-xl w-full text-center space-y-8">
                    <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-red-500">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="font-display text-4xl font-bold text-charcoal">Order Missing</h1>
                    <p className="text-gray-500 text-lg">We couldn't find the documentation for this order reference. Please check your history.</p>
                    <Link href="/" className="btn-primary inline-block px-12 py-4 rounded-2xl">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col pt-12 sm:pt-20 px-4 pb-20">
            <div className="max-w-6xl mx-auto w-full">
                {/* Header Section */}
                <div className="text-center space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="inline-block relative">
                        <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-20 scale-150"></div>
                        <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="font-display text-4xl sm:text-5xl font-bold text-charcoal tracking-tight">
                        Thank You!
                    </h1>
                    <p className="text-xl sm:text-2xl text-charcoal/60 max-w-2xl mx-auto leading-relaxed">
                        Your order has been received and is being prepared with love at Mama Oliech.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Order Metadata */}
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-5 duration-700 delay-150">
                        <div className="bg-charcoal text-white rounded-[3rem] p-10 sm:p-12 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta-600/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-terracotta-600/20 transition-all duration-700"></div>

                            <h2 className="font-display text-2xl font-bold mb-10 text-terracotta-500 uppercase tracking-widest">Order Details</h2>

                            <div className="grid sm:grid-cols-2 gap-10">
                                <div className="space-y-2">
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Reference Number</p>
                                    <p className="text-xl font-display font-medium">{order.order_number}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Current Status</p>
                                    <span className="inline-flex px-4 py-2 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 backdrop-blur-sm">
                                        {order.order_status}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Payment Status</p>
                                    <span className={`inline-flex px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border backdrop-blur-sm ${order.payment_status === 'paid'
                                        ? 'bg-green-500/20 text-green-400 border-green-500/20'
                                        : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20'
                                        }`}>
                                        {order.payment_status}
                                    </span>
                                </div>
                                {order.mpesa_receipt && (
                                    <div className="space-y-2">
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">M-Pesa Receipt</p>
                                        <p className="text-2xl font-display font-bold text-white">{order.mpesa_receipt}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-12 pt-10 border-t border-white/10">
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-4">What's Next?</p>
                                <div className="space-y-4">
                                    <p className="text-white/80 leading-relaxed">
                                        We'll notify you at <strong className="text-white">{order.customer_phone}</strong> the moment your food is ready. Please keep your phone close!
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Link
                                href="/"
                                className="btn-primary flex-1 py-4 text-base rounded-xl text-center shadow-lg shadow-terracotta-600/20"
                            >
                                Back to Home
                            </Link>
                            <Link
                                href="/#menu"
                                className="btn-secondary flex-1 py-4 text-base rounded-xl text-center bg-gray-50 border-gray-100"
                            >
                                Order Again
                            </Link>
                        </div>
                    </div>

                    {/* Order Items Summary */}
                    <div className="bg-gray-50/50 border-2 border-gray-100 rounded-[3rem] p-10 sm:p-12 animate-in fade-in slide-in-from-right-5 duration-700 delay-300">
                        <h3 className="font-display text-2xl font-bold text-charcoal mb-10 flex items-center gap-3">
                            Items Ordered
                            <span className="text-sm font-bold bg-white px-3 py-1 rounded-full border border-gray-200 text-charcoal/40">{orderItems.length}</span>
                        </h3>

                        <div className="space-y-6 mb-12">
                            {orderItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center font-bold text-charcoal shadow-sm group-hover:scale-110 transition-transform">
                                            {item.quantity}x
                                        </div>
                                        <div>
                                            <p className="font-bold text-charcoal text-lg group-hover:text-terracotta-600 transition-colors">{item.menu_item_name}</p>
                                            <p className="text-xs text-charcoal/40 font-bold uppercase tracking-widest">{formatPrice(item.unit_price)} per item</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-charcoal text-lg">
                                        {formatPrice(item.subtotal)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-10 border-t-2 border-dashed border-gray-200">
                            <div className="flex justify-between text-charcoal/40 font-bold uppercase tracking-widest text-sm">
                                <span>Subtotal Cost</span>
                                <span>{formatPrice(order.total_amount)}</span>
                            </div>
                            <div className="flex justify-between text-charcoal/40 font-bold uppercase tracking-widest text-sm">
                                <span>Delivery Fee</span>
                                <span className="text-green-600">Free Delivery</span>
                            </div>
                            <div className="flex justify-between items-end pt-6">
                                <span className="text-base font-bold text-charcoal/40 uppercase tracking-[0.2em]">Paid Amount</span>
                                <span className="text-3xl sm:text-4xl font-display font-bold text-terracotta-600">{formatPrice(order.total_amount)}</span>
                            </div>
                        </div>

                        <div className="mt-12 p-8 bg-white border border-gray-100 rounded-3xl flex items-center gap-6">
                            <div className="w-14 h-14 bg-terracotta-50 text-terracotta-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-bold text-charcoal">Mama Oliech Restaurant</p>
                                <p className="text-charcoal/40 text-sm">Our team has started preparing your order. Your meal will be hot and fresh!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
