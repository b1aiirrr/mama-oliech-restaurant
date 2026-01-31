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
        fetchOrder();
    }, [orderId]);

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
            setError('Order not found');
        } finally {
            setLoading(false);
        }
    };

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

            const data = await response.json();

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
        <div className="min-h-screen bg-cream py-20">
            <div className="container max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
                    <h1 className="font-display text-3xl font-semibold text-charcoal mb-6 text-center">
                        Complete Payment
                    </h1>

                    <div className="bg-terracotta-50 border border-terracotta-200 rounded-xl p-6 mb-6">
                        <div className="text-center mb-4">
                            <p className="text-charcoal/80 mb-2">Order Number</p>
                            <p className="font-display text-2xl font-semibold text-charcoal">
                                {order.order_number}
                            </p>
                        </div>

                        <div className="flex justify-between items-center border-t border-terracotta-200 pt-4">
                            <span className="text-charcoal/80">Total Amount:</span>
                            <span className="font-display text-3xl font-semibold text-terracotta-600">
                                {formatPrice(order.total_amount)}
                            </span>
                        </div>
                    </div>

                    {!paying ? (
                        <>
                            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                                <h3 className="font-semibold text-charcoal mb-3">📱 M-Pesa Payment Steps:</h3>
                                <ol className="list-decimal list-inside space-y-2 text-charcoal/80">
                                    <li>Click "Pay with M-Pesa" button below</li>
                                    <li>You'll receive an M-Pesa prompt on <strong>{order.customer_phone}</strong></li>
                                    <li>Enter your M-Pesa PIN to complete payment</li>
                                    <li>Wait for confirmation</li>
                                </ol>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={initiateMpesaPayment}
                                className="btn-primary w-full text-lg py-4 mb-4"
                            >
                                Pay with M-Pesa
                            </button>

                            <button
                                onClick={() => router.push('/')}
                                className="btn-secondary w-full py-3"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-terracotta-600 mx-auto mb-6"></div>
                            <h3 className="font-semibold text-charcoal text-xl mb-2">Processing Payment...</h3>
                            <p className="text-charcoal/80 mb-4">
                                Please check your phone for the M-Pesa prompt
                            </p>
                            <p className="text-sm text-charcoal/60">
                                Enter your M-Pesa PIN to complete the payment
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
