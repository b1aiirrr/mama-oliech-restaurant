'use client';

export const dynamic = 'force-dynamic';

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
    const [activeTab, setActiveTab] = useState<'stk' | 'qr' | 'stripe' | 'airtel'>('stk');
    const [paying, setPaying] = useState(false);
    const [stripeLoading, setStripeLoading] = useState(false);
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

    const handleStripeClick = async () => {
        setStripeLoading(true);
        setError('');
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: order!.id,
                    amount: order!.total_amount,
                    email: order!.customer_email
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to start Stripe checkout');
            window.location.href = data.url;
        } catch (err: any) {
            setError(err.message);
            setStripeLoading(false);
        }
    };

    const handleAirtmClick = async () => {
        // Airtm flow often involves a simple redirect or modal. Here we'll show a placeholder
        setError('Airtm integration is currently in sandbox mode. Checkout not available for this currency yet.');
    };

    const handleAirtelClick = async () => {
        setError('Airtel Money integration is pending. Please use M-Pesa or Card for now.');
    };

    const handleTabChange = (tab: 'stk' | 'qr' | 'stripe' | 'airtel') => {
        setActiveTab(tab);
        setError('');
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
                            <div className="flex bg-gray-200/50 p-1 rounded-2xl mb-8">
                                <button 
                                    onClick={() => handleTabChange('stk')}
                                    className={`flex-1 py-3 text-xs font-bold rounded-[0.9rem] transition-all ${activeTab === 'stk' ? 'bg-white text-charcoal shadow-md scale-[1.02]' : 'text-charcoal/50 hover:text-charcoal'}`}
                                >
                                    STK Push
                                </button>
                                <button 
                                    onClick={() => handleTabChange('qr')}
                                    className={`flex-1 py-3 text-xs font-bold rounded-[0.9rem] transition-all ${activeTab === 'qr' ? 'bg-white text-charcoal shadow-md scale-[1.02]' : 'text-charcoal/50 hover:text-charcoal'}`}
                                >
                                    Scan QR
                                </button>
                                <button 
                                    onClick={() => handleTabChange('stripe')}
                                    className={`flex-1 py-3 text-[10px] font-bold rounded-[0.9rem] transition-all ${activeTab === 'stripe' ? 'bg-white text-charcoal shadow-md scale-[1.02]' : 'text-charcoal/50 hover:text-charcoal'}`}
                                >
                                    Card
                                </button>
                                <button 
                                    onClick={() => handleTabChange('airtel')}
                                    className={`flex-1 py-3 text-[10px] font-bold rounded-[0.9rem] transition-all ${activeTab === 'airtel' ? 'bg-white text-charcoal shadow-md scale-[1.02]' : 'text-charcoal/50 hover:text-charcoal'}`}
                                >
                                    Airtel
                                </button>
                            </div>

                            {(activeTab === 'stk' || activeTab === 'qr') && (
                                <div className="text-center mb-6">
                                    <span className="text-[10px] font-bold text-terracotta-600 bg-terracotta-50 px-3 py-1 rounded-full uppercase tracking-tighter">Powered by M-Pesa</span>
                                </div>
                            )}

                            {activeTab === 'stk' && (
                                !paying ? (
                                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-bold text-charcoal tracking-tight">STK Push Instructions</h3>
                                            <div className="space-y-4 text-charcoal/70 text-sm leading-relaxed">
                                                <p className="flex items-start gap-4">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-terracotta-100 text-terracotta-600 flex items-center justify-center font-bold text-xs ring-4 ring-terracotta-50">1</span>
                                                    Unlock your phone <strong>{order.customer_phone}</strong>.
                                                </p>
                                                <p className="flex items-start gap-4">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-terracotta-100 text-terracotta-600 flex items-center justify-center font-bold text-xs ring-4 ring-terracotta-50">2</span>
                                                    Click below to trigger the secure M-Pesa prompt.
                                                </p>
                                                <p className="flex items-start gap-4">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-terracotta-100 text-terracotta-600 flex items-center justify-center font-bold text-xs ring-4 ring-terracotta-50">3</span>
                                                    Enter your PIN to complete the <strong>{formatPrice(order.total_amount)}</strong> payment.
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
                                                className="btn-primary w-full py-5 text-lg rounded-2xl shadow-2xl shadow-terracotta-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                            >
                                                <span>Send M-Pesa Prompt</span>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => router.push('/')}
                                                className="w-full py-4 text-charcoal/30 hover:text-charcoal font-bold uppercase tracking-widest text-[10px] transition-colors"
                                            >
                                                Cancel and Return
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-10 animate-in fade-in zoom-in duration-700 mt-6">
                                        <div className="relative inline-block">
                                            <div className="animate-ping absolute inset-0 rounded-full bg-terracotta-500/20 h-full w-full speed-slow"></div>
                                            <div className="relative p-8 bg-white rounded-full shadow-2xl border-4 border-terracotta-50">
                                                <div className="w-16 h-16 rounded-full border-t-4 border-terracotta-600 animate-spin"></div>
                                                <svg className="w-8 h-8 text-terracotta-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-charcoal tracking-tight">Secure Connection...</h3>
                                            <p className="text-charcoal/50 text-base">
                                                We've sent a prompt to <strong>{order.customer_phone}</strong>.<br />
                                                Please check your phone screen.
                                            </p>
                                        </div>
                                        {error && (
                                            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 font-medium text-sm rounded-r-xl text-left">
                                                {error}
                                                <button onClick={() => setPaying(false)} className="block mt-2 text-terracotta-600 font-bold underline">Try again</button>
                                            </div>
                                        )}
                                        <div className="flex justify-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-terracotta-600 animate-pulse"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-terracotta-400 animate-pulse [animation-delay:200ms]"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-terracotta-200 animate-pulse [animation-delay:400ms]"></div>
                                        </div>
                                    </div>
                                )
                            )}

                            {activeTab === 'qr' && (
                                <div className="space-y-8 animate-in slide-in-from-right-2 duration-500">
                                    <div className="text-center space-y-4">
                                        <h3 className="text-xl font-bold text-charcoal tracking-tight">Scan QR to Pay</h3>
                                        <p className="text-charcoal/60 text-sm leading-relaxed">Open your M-Pesa or MySafaricom App and scan the dynamic code below.</p>
                                    </div>

                                    {qrLoading ? (
                                        <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                            <div className="w-16 h-16 rounded-full border-t-4 border-terracotta-600 animate-spin"></div>
                                            <p className="text-charcoal/40 text-xs font-bold uppercase tracking-widest">Generating Code...</p>
                                        </div>
                                    ) : qrError ? (
                                        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 font-medium text-sm rounded-r-xl">
                                            {qrError}
                                            <button onClick={fetchQrCode} className="ml-4 underline font-bold">Retry</button>
                                        </div>
                                    ) : qrCodeImage ? (
                                        <div className="flex flex-col items-center space-y-8">
                                            <div className="p-6 bg-white rounded-3xl shadow-2xl border-4 border-gray-50 relative group transition-transform hover:scale-[1.02]">
                                                <img src={qrCodeImage} alt="M-Pesa Dynamic QR" className="w-56 h-56 object-contain rounded-xl" />
                                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none"></div>
                                            </div>
                                            <div className="flex items-center gap-4 text-terracotta-600 bg-terracotta-50 px-6 py-3 rounded-2xl ring-4 ring-terracotta-50/50">
                                                <div className="w-2.5 h-2.5 rounded-full bg-terracotta-600 animate-ping"></div>
                                                <p className="text-sm font-bold uppercase tracking-widest">Awaiting Scan...</p>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            {activeTab === 'stripe' && (
                                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 py-4">
                                    <div className="text-center space-y-4">
                                        <div className="flex justify-center gap-4 mb-4 opacity-50 grayscale group-hover:grayscale-0 transition-all">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" className="h-4" alt="Stripe" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-charcoal tracking-tight">Pay securely by Card</h3>
                                        <p className="text-charcoal/50 text-sm max-w-xs mx-auto">We accept Visa, Mastercard, American Express, Apple Pay, and Google Pay.</p>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 font-medium text-sm rounded-r-xl">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <button
                                            onClick={handleStripeClick}
                                            disabled={stripeLoading}
                                            className="w-full bg-[#635BFF] hover:bg-[#5851e0] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                        >
                                            {stripeLoading ? (
                                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <span>Secure Checkout</span>
                                                    <svg className="w-6 h-6 opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                                                </>
                                            )}
                                        </button>

                                        <div className="flex flex-col items-center gap-4 pt-6 mt-4 border-t border-gray-100/50">
                                            <div className="flex items-center gap-5 opacity-40">
                                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 32'%3E%3Cpath fill='%231a1f71' d='M35 0h-5.4c-.4 0-.8.2-1 .6l-7.4 17.6L18.8 3.8C18.6 1.4 16.4 0 14.1 0H0l-.2.6c2.8.7 5.4 1.8 7.4 3.1 1.2.8 1.6 1.4 1.9 2.5L16.2 32h5.8L31.1 9.4 35 32H42L35 0zm19.6 19.3c.1-4.7-6.5-5-6.5-8.5 0-1.1 1-1.9 2.1-1.9 1.6 0 2.7.4 3.5.8l.4.2.8-5c-1.1-.4-2.5-.8-4.1-.8-5.9 0-10.1 3.1-10.2 7.7 0 3.3 3 5.2 5.2 6.3 2.3 1.1 3 1.8 3 2.8 0 1.5-1.9 2.2-3.6 2.2-2.4 0-3.8-.4-5.8-1.3l-.7-.4-.8 5c1.6.7 4.5 1.3 7 1.3 6.3 0 10.3-3.1 10.3-7.7zM66.4 10.3c.5-.1 1-.1 1.5-.1 3.5 0 6.6 1.5 8.1 4.5l.3.6L79.4 0h-6.2l-3.3 15.6c-.7-3.1-2.3-5.3-3.5-5.3zM99.8.6L94.3 32h-5.4L83.4.6h6l2.7 18.2L94.8.6z'/%3E%3C/svg%3E" className="h-2.5" alt="Visa" />
                                                <img src="https://raw.githubusercontent.com/aaronfriel/stripe-payment-icons/master/dist/svg/mastercard.svg" className="h-5" alt="Mastercard" />
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                                                Secure Stripe Gateway
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'airtel' && (
                                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 py-4 text-center">
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 bg-red-600 rounded-full mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-red-50">
                                            A
                                        </div>
                                        <h3 className="text-2xl font-bold text-charcoal tracking-tight font-display">Pay with Airtel Money</h3>
                                        <p className="text-charcoal/50 text-sm max-w-xs mx-auto leading-relaxed">
                                            Use your Airtel Money account to pay securely.
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 font-medium text-sm rounded-r-xl text-left">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleAirtelClick}
                                        className="w-full bg-[#E30613] hover:bg-[#c40510] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-red-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                    >
                                        Trigger Airtel Prompt
                                    </button>

                                    <p className="text-[10px] text-charcoal/30 flex items-center justify-center gap-2 font-bold uppercase tracking-widest">
                                        Secure Mobile Payment
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
