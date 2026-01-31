'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Order, OrderItem } from '@/types/orders';

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
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-cream py-20">
                <div className="container max-w-2xl mx-auto px-4 text-center">
                    <h1 className="font-display text-4xl font-semibold text-charcoal mb-4">
                        Order Not Found
                    </h1>
                    <button onClick={() => router.push('/')} className="btn-primary">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream py-20">
            <div className="container max-w-3xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="font-display text-3xl font-semibold text-charcoal mb-2">
                            Order Confirmed!
                        </h1>
                        <p className="text-charcoal/80">Thank you for your order, {order.customer_name}</p>
                    </div>

                    {/* Order Details */}
                    <div className="bg-terracotta-50 border border-terracotta-200 rounded-xl p-6 mb-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-charcoal/60 mb-1">Order Number</p>
                                <p className="font-display text-xl font-semibold text-charcoal">
                                    {order.order_number}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-charcoal/60 mb-1">Status</p>
                                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                    {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-charcoal/60 mb-1">Payment Status</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${order.payment_status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                </span>
                            </div>
                            {order.mpesa_receipt && (
                                <div>
                                    <p className="text-sm text-charcoal/60 mb-1">M-Pesa Receipt</p>
                                    <p className="font-semibold text-charcoal">{order.mpesa_receipt}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-charcoal mb-4">Order Items</h3>
                        <div className="space-y-3">
                            {orderItems.map((item) => (
                                <div key={item.id} className="flex justify-between items-center bg-cream rounded-lg p-4">
                                    <div>
                                        <p className="font-semibold text-charcoal">{item.menu_item_name}</p>
                                        <p className="text-sm text-charcoal/60">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-terracotta-600">
                                        {formatPrice(item.subtotal)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-200 pt-4 mb-6">
                        <div className="flex justify-between text-xl font-semibold">
                            <span>Total:</span>
                            <span className="text-terracotta-600">{formatPrice(order.total_amount)}</span>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <p className="text-sm text-charcoal/80">
                            <strong>Thank you!</strong> We&apos;ll call you at <strong>{order.customer_phone}</strong> when your order is ready.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="btn-primary flex-1"
                        >
                            Back to Home
                        </button>
                        <button
                            onClick={() => router.push('/#menu')}
                            className="btn-secondary flex-1"
                        >
                            Order Again
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
