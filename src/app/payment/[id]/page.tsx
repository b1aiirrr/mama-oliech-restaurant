'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types/orders';

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single();

                if (error) throw error;
                setOrder(data);
            } catch (err: any) {
                console.error('Order query error:', err);
                setError('Order not found');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const initiateMpesaPayment = async () => {
        setPaying(true);
        setError('');

        try {
            const response = await fetch('/api/mpesa/stk-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone_number: order!.customer_phone,
                    amount: order!.total_amount,
                    order_id: order!.id,
                }),
            });

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error(`Server Error: ${text.slice(0, 100)}${text.length > 100 ? '...' : ''}`);
            }

            if (!response.ok) {
                throw new Error(data.error || 'Payment initiation failed');
            }

            // Poll for payment status
            pollPaymentStatus();
        } catch (err: any) {
            setError(err.message);
            setPaying(false);
        }
    };

    const pollPaymentStatus = async () => {
        const maxAttempts = 60; // 60 seconds
        let attempts = 0;

        const interval = setInterval(async () => {
            attempts++;

            const { data } = await supabase
                .from('orders')
                .select('payment_status')
                .eq('id', orderId)
                .single();

            if (data?.payment_status === 'paid') {
                clearInterval(interval);
                router.push(`/order-confirmation/${orderId}`);
            } else if (data?.payment_status === 'failed' || attempts >= maxAttempts) {
                clearInterval(interval);
                setError('Payment failed or timed out. Please try again.');
                setPaying(false);
            }
        }, 1000);
    };

    const formatPrice = (price: number) => `KSh ${price.toLocaleString()}`;

    if (loading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-600 mx-auto mb-4"></div>
                    <p className="text-charcoal/80">Loading order...</p>
                </div>
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
                    <p className="text-charcoal/80 mb-8">{error}</p>
                    <button onClick={() => router.push('/')} className="btn-primary">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <div className="grid md:grid-cols-2">
                        {/* Order Details Side */}
                        <div className="bg-charcoal p-8 sm:p-12 text-white flex flex-col justify-between">
                            <div>
                                <h1 className="font-display text-3xl sm:text-4xl font-bold mb-8">Pay & Enjoy</h1>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">Order Reference</p>
                                        <p className="text-xl font-display font-medium">{order.order_number}</p>
                                    </div>
                                    <div className="pt-6 border-t border-white/10">
                                        <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">Amount Due</p>
                                        <p className="text-4xl font-display font-bold text-terracotta-500">{formatPrice(order.total_amount)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 space-y-4">
                                <div className="flex items-center gap-4 text-white/60">
                                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p>Freshly prepared items</p>
                                </div>
                                <div className="flex items-center gap-4 text-white/60">
                                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p>Instant M-Pesa push</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Side */}
                        <div className="p-8 sm:p-12 flex flex-col justify-center bg-gray-50/50">
                            {!paying ? (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-charcoal">Instructions</h3>
                                        <div className="space-y-4 text-charcoal/70">
                                            <p className="flex items-start gap-3">
                                                <span className="font-bold text-terracotta-600">01.</span>
                                                Ensure your phone <strong>{order.customer_phone}</strong> is unlocked and has enough balance.
                                            </p>
                                            <p className="flex items-start gap-3">
                                                <span className="font-bold text-terracotta-600">02.</span>
                                                Click the button below to receive an M-Pesa STK push.
                                            </p>
                                            <p className="flex items-start gap-3">
                                                <span className="font-bold text-terracotta-600">03.</span>
                                                Enter your M-Pesa PIN when prompted on your phone.
                                            </p>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 font-medium text-sm rounded-r-xl">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <button
                                            onClick={initiateMpesaPayment}
                                            className="btn-primary w-full py-4 text-lg rounded-xl shadow-xl shadow-terracotta-600/20 active:scale-[0.98] transition-all"
                                        >
                                            Send M-Pesa Prompt
                                        </button>
                                        <button
                                            onClick={() => router.push('/')}
                                            className="w-full py-4 text-charcoal/40 hover:text-charcoal font-bold uppercase tracking-widest text-xs transition-colors"
                                        >
                                            Cancel Order
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                                    <div className="relative inline-block">
                                        <div className="animate-ping absolute inset-0 rounded-full bg-terracotta-500/20 h-full w-full"></div>
                                        <div className="relative p-6 bg-white rounded-full shadow-xl border-4 border-terracotta-100">
                                            <svg className="w-12 h-12 text-terracotta-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-charcoal mb-4">Awaiting PIN...</h3>
                                        <p className="text-charcoal/60 leading-relaxed text-base">
                                            An M-Pesa prompt has been sent to <br />
                                            <span className="text-charcoal font-bold text-lg">{order.customer_phone}</span>
                                        </p>
                                    </div>
                                    <div className="flex justify-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-terracotta-600 animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 rounded-full bg-terracotta-600 animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 rounded-full bg-terracotta-600 animate-bounce"></div>
                                    </div>
                                    <p className="text-xs text-charcoal/40 font-medium uppercase tracking-widest">
                                        System will automatically confirm once paid
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
