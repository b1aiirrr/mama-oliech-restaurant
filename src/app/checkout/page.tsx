'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { CustomerInfo } from '@/types/orders';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getTotalAmount, clearCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        name: '',
        phone: '',
        email: '',
        delivery_address: '',
        notes: '',
    });

    const totalAmount = getTotalAmount();
    const formatPrice = (price: number) => `KSh ${price.toLocaleString()}`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Validate cart
            if (items.length === 0) {
                throw new Error('Your cart is empty');
            }

            // Validate phone number (Kenyan format)
            const phoneRegex = /^(254|0)[17]\d{8}$/;
            if (!phoneRegex.test(customerInfo.phone.replace(/\s/g, ''))) {
                throw new Error('Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678)');
            }

            // Generate order number using database function
            const { data: orderNumberData, error: orderNumberError } = await supabase
                .rpc('generate_order_number');

            if (orderNumberError) throw orderNumberError;

            const orderNumber = orderNumberData;

            // Create order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    order_number: orderNumber,
                    customer_name: customerInfo.name,
                    customer_phone: customerInfo.phone.replace(/\s/g, ''),
                    customer_email: customerInfo.email || null,
                    delivery_address: customerInfo.delivery_address || null,
                    notes: customerInfo.notes || null,
                    total_amount: totalAmount,
                    payment_status: 'pending',
                    order_status: 'new',
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Create order items
            const orderItems = items.map((item) => ({
                order_id: order.id,
                menu_item_id: item.id,
                menu_item_name: item.name,
                quantity: item.quantity,
                unit_price: item.price,
                subtotal: item.price * item.quantity,
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Clear cart
            clearCart();

            // Redirect to payment page
            router.push(`/payment/${order.id}`);
        } catch (err: any) {
            console.error('Order creation error:', err);
            setError(err.message || 'Failed to create order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-cream py-20">
                <div className="container max-w-2xl mx-auto px-4 text-center">
                    <h1 className="font-display text-4xl font-semibold text-charcoal mb-4">
                        Your Cart is Empty
                    </h1>
                    <p className="text-charcoal/80 mb-8">Add some delicious items from our menu!</p>
                    <Link href="/#menu" className="btn-primary">
                        Browse Menu
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container-wide py-12 sm:py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-12">
                        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <h1 className="font-display text-4xl sm:text-5xl font-bold text-charcoal">Checkout</h1>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                        {/* Customer Information Form */}
                        <div className="lg:col-span-7 space-y-10">
                            <section>
                                <h2 className="font-display text-2xl font-bold text-charcoal mb-8 pb-2 border-b-2 border-terracotta-100 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-terracotta-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                                    Your Information
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="block text-sm font-bold text-charcoal/70 uppercase tracking-wider">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                required
                                                value={customerInfo.name}
                                                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-terracotta-500 outline-none transition-all text-lg"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="phone" className="block text-sm font-bold text-charcoal/70 uppercase tracking-wider">
                                                Phone Number * (M-Pesa)
                                            </label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                required
                                                value={customerInfo.phone}
                                                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-terracotta-500 outline-none transition-all text-lg"
                                                placeholder="0712345678"
                                            />
                                            <p className="text-xs text-charcoal/60 font-medium">
                                                Used for the M-Pesa payment prompt.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block text-sm font-bold text-charcoal/70 uppercase tracking-wider">
                                            Email Address (Optional)
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={customerInfo.email}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-terracotta-500 outline-none transition-all text-lg"
                                            placeholder="john@example.com"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="address" className="block text-sm font-bold text-charcoal/70 uppercase tracking-wider">
                                            Delivery Address (Optional)
                                        </label>
                                        <textarea
                                            id="address"
                                            value={customerInfo.delivery_address}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, delivery_address: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-terracotta-500 outline-none transition-all text-lg min-h-[100px]"
                                            placeholder="Where should we bring your food?"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="notes" className="block text-sm font-bold text-charcoal/70 uppercase tracking-wider">
                                            Special Instructions
                                        </label>
                                        <textarea
                                            id="notes"
                                            value={customerInfo.notes}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-terracotta-500 outline-none transition-all text-lg min-h-[100px]"
                                            placeholder="Extra napkins, no onions, etc."
                                        />
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl font-medium animate-pulse">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-primary w-full text-xl py-6 rounded-2xl shadow-xl shadow-terracotta-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                                Setting up your order...
                                            </>
                                        ) : (
                                            <>
                                                Proceed to Payment • {formatPrice(totalAmount)}
                                            </>
                                        )}
                                    </button>
                                </form>
                            </section>
                        </div>

                        {/* Order Summary Sticky Card */}
                        <div className="lg:col-span-5 sticky top-24">
                            <div className="bg-charcoal text-white rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta-600/10 rounded-full -mr-16 -mt-16 blur-3xl" />

                                <h2 className="font-display text-2xl font-bold mb-8 flex items-center gap-3">
                                    Order Summary
                                </h2>

                                <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar mb-8">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4 group">
                                            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center">
                                                <h3 className="font-bold text-lg leading-tight mb-1">{item.name}</h3>
                                                <p className="text-white/60 text-sm">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-lg text-terracotta-400">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-8 border-t border-white/10 relative">
                                    <div className="flex justify-between text-white/60 text-lg">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-white/60 text-lg">
                                        <span>Delivery Fee</span>
                                        <span className="text-green-400 font-bold">FREE</span>
                                    </div>
                                    <div className="flex justify-between text-3xl font-bold pt-4 text-white">
                                        <span>Total</span>
                                        <span className="text-terracotta-500">{formatPrice(totalAmount)}</span>
                                    </div>
                                </div>

                                <div className="mt-8 p-5 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-4">
                                    <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.016 7.233 7.233 0 00-11.615 10.115l7.73 7.73a1 1 0 001.414 0l7.73-7.73a7.233 7.233 0 00-1.615-10.115z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Secure M-Pesa Payment</p>
                                        <p className="text-white/40 text-xs mt-1">Your payment details are protected with bank-level encryption.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
