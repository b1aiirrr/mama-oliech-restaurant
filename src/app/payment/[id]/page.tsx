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
    const [activeTab, setActiveTab] = useState<'stk' | 'qr'>('stk');
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState('');
    const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [qrError, setQrError] = useState('');

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

    const fetchQrCode = async () => {
        if (qrCodeImage || qrLoading) return;
        setQrLoading(true);
        setQrError('');
        try {
            const response = await fetch('/api/mpesa/qr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: order!.total_amount,
                    order_id: order!.id,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch QR');
            setQrCodeImage(`data:image/png;base64,${data.qrCode}`);
            
            // Start polling as soon as QR is displayed
            pollPaymentStatus();
        } catch (err: any) {
            setQrError(err.message);
        } finally {
            setQrLoading(false);
        }
    };

    const handleTabChange = (tab: 'stk' | 'qr') => {
        setActiveTab(tab);
        if (tab === 'qr') fetchQrCode();
    };

    const pollPaymentStatus = async () => {
        const maxAttempts = 60; // 60 seconds
        let attempts = 0;

        const interval = setInterval(async () => {
            attempts++;

            try {
                const { data } = await supabase
                    .from('orders')
                    .select('payment_status')
                    .eq('id', orderId)
                    .single();

                if (data?.payment_status === 'paid') {
                    clearInterval(interval);
                    router.push(`/order-confirmation/${orderId}`);
                } else if (data?.payment_status === 'failed') {
                    clearInterval(interval);
                    setError('Payment was not completed. You may have cancelled or there was an issue with your M-Pesa account.');
                    setPaying(false);
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    setError('We didn\'t receive a response in time. If you entered your PIN, please wait a moment and refresh. Otherwise, try again.');
                    setPaying(false);
                }
            } catch {
                // Ignore transient network errors during polling
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
                        <div className="p-8 sm:p-12 flex flex-col justify-start bg-gray-50/50">
                            
                            {/* Payment Tabs */}
                            <div className="flex bg-gray-200/50 p-1 rounded-xl mb-8">
                                <button 
                                    onClick={() => handleTabChange('stk')}
                                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'stk' ? 'bg-white text-charcoal shadow-sm' : 'text-charcoal/50 hover:text-charcoal'}`}
                                >
                                    Phone Prompt
                                </button>
                                <button 
                                    onClick={() => handleTabChange('qr')}
                                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'qr' ? 'bg-white text-charcoal shadow-sm' : 'text-charcoal/50 hover:text-charcoal'}`}
                                >
                                    Scan QR
                                </button>
                            </div>

                            {activeTab === 'stk' && (
                                !paying ? (
                                    <div className="space-y-8 animate-in fade-in duration-300">
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
                                    <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500 mt-10">
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
                                        {error && (
                                            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 font-medium text-sm rounded-r-xl text-left">
                                                {error}
                                            </div>
                                        )}
                                        <div className="flex justify-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-terracotta-600 animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-2 h-2 rounded-full bg-terracotta-600 animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-2 h-2 rounded-full bg-terracotta-600 animate-bounce"></div>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-xs text-charcoal/40 font-medium uppercase tracking-widest">
                                                System will automatically confirm once paid
                                            </p>
                                            {error && (
                                                <button onClick={() => setPaying(false)} className="text-terracotta-600 text-sm font-bold border-b border-terracotta-600">Try Again</button>
                                            )}
                                        </div>
                                    </div>
                                )
                            )}

                            {activeTab === 'qr' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="text-center space-y-4">
                                        <h3 className="text-xl font-bold text-charcoal">Scan to Pay</h3>
                                        <p className="text-charcoal/70 text-sm">Open your M-Pesa or MySafaricom App on your phone and scan the QR code below.</p>
                                    </div>

                                    {qrLoading ? (
                                        <div className="flex justify-center items-center py-12">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-600"></div>
                                        </div>
                                    ) : qrError ? (
                                        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 font-medium text-sm rounded-r-xl">
                                            {qrError}
                                            <button onClick={fetchQrCode} className="ml-4 underline font-bold">Retry</button>
                                        </div>
                                    ) : qrCodeImage ? (
                                        <div className="flex flex-col items-center space-y-6">
                                            <div className="p-4 bg-white rounded-2xl shadow-xl border-2 border-gray-100 relative group">
                                                <img src={qrCodeImage} alt="M-Pesa Dynamic QR" className="w-48 h-48 object-contain rounded-lg" />
                                            </div>
                                            <div className="flex items-center gap-3 text-terracotta-600 bg-terracotta-50 px-4 py-2 rounded-full">
                                                <div className="w-2 h-2 rounded-full bg-terracotta-600 animate-ping"></div>
                                                <p className="text-sm font-bold uppercase tracking-widest">Awaiting Payment...</p>
                                            </div>
                                        </div>
                                    ) : null}

                                    <button
                                        onClick={() => router.push('/')}
                                        className="w-full py-4 text-charcoal/40 hover:text-charcoal font-bold uppercase tracking-widest text-xs transition-colors mt-8"
                                    >
                                        Cancel Order
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
