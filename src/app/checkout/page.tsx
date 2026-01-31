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
        <div className="min-h-screen bg-cream py-20">
            <div className="container max-w-6xl mx-auto px-4">
                <h1 className="font-display text-4xl font-semibold text-charcoal mb-8">Checkout</h1>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Customer Information Form */}
                    <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
                        <h2 className="font-display text-2xl font-semibold text-charcoal mb-6">
                            Your Information
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block font-semibold text-charcoal mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={customerInfo.name}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block font-semibold text-charcoal mb-2">
                                    Phone Number * (M-Pesa)
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    required
                                    value={customerInfo.phone}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                                    placeholder="0712345678"
                                />
                                <p className="text-sm text-charcoal/60 mt-1">
                                    We'll send M-Pesa payment request to this number
                                </p>
                            </div>

                            <div>
                                <label htmlFor="email" className="block font-semibold text-charcoal mb-2">
                                    Email (Optional)
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={customerInfo.email}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="address" className="block font-semibold text-charcoal mb-2">
                                    Delivery Address (Optional)
                                </label>
                                <textarea
                                    id="address"
                                    value={customerInfo.delivery_address}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, delivery_address: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Enter your delivery address"
                                />
                            </div>

                            <div>
                                <label htmlFor="notes" className="block font-semibold text-charcoal mb-2">
                                    Special Instructions (Optional)
                                </label>
                                <textarea
                                    id="notes"
                                    value={customerInfo.notes}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Any special requests?"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Processing...' : `Pay ${formatPrice(totalAmount)} via M-Pesa`}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 h-fit sticky top-24">
                        <h2 className="font-display text-2xl font-semibold text-charcoal mb-6">
                            Order Summary
                        </h2>

                        <div className="space-y-4 mb-6">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-charcoal">{item.name}</h3>
                                        <p className="text-sm text-charcoal/60">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-terracotta-600">
                                        {formatPrice(item.price * item.quantity)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex justify-between text-lg font-semibold mb-4">
                                <span>Total:</span>
                                <span className="text-terracotta-600">{formatPrice(totalAmount)}</span>
                            </div>

                            <div className="bg-terracotta-50 border border-terracotta-200 rounded-lg p-4">
                                <p className="text-sm text-charcoal/80">
                                    <strong>Payment Method:</strong> M-Pesa
                                </p>
                                <p className="text-sm text-charcoal/80 mt-2">
                                    You'll receive an M-Pesa prompt on your phone to complete the payment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
