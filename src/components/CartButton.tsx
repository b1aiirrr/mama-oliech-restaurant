'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';

export function CartButton() {
    const [isOpen, setIsOpen] = useState(false);
    const { items, removeFromCart, updateQuantity, getTotalAmount, getItemCount, clearCart } = useCart();

    const itemCount = getItemCount();
    const totalAmount = getTotalAmount();

    const formatPrice = (price: number) => `KSh ${price.toLocaleString()}`;

    return (
        <>
            {/* Cart Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 hover:bg-terracotta-50 rounded-full transition-colors"
                aria-label="Shopping cart"
            >
                <svg
                    className="w-6 h-6 text-charcoal"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-terracotta-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {itemCount}
                    </span>
                )}
            </button>

            {/* Cart Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-[60]"
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.15)] z-[70] flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-display text-2xl font-semibold text-charcoal">
                                        Your Cart ({itemCount})
                                    </h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        aria-label="Close cart"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {items.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-charcoal/60 mb-4">Your cart is empty</p>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="btn-secondary"
                                        >
                                            Browse Menu
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex gap-4 p-4 bg-cream rounded-xl"
                                            >
                                                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-charcoal truncate">{item.name}</h3>
                                                    <p className="text-terracotta-600 font-semibold mt-1">
                                                        {formatPrice(item.price)}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-7 h-7 flex items-center justify-center bg-white rounded border border-gray-300 hover:bg-gray-50"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="font-semibold  w-8 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-7 h-7 flex items-center justify-center bg-white rounded border border-gray-300 hover:bg-gray-50"
                                                        >
                                                            +
                                                        </button>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="ml-auto text-red-600 hover:text-red-700 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {items.length > 0 && (
                                <div className="border-t border-gray-200 p-6 space-y-4">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total:</span>
                                        <span className="text-terracotta-600">{formatPrice(totalAmount)}</span>
                                    </div>
                                    <Link
                                        href="/checkout"
                                        onClick={() => setIsOpen(false)}
                                        className="btn-primary w-full text-center block"
                                    >
                                        Proceed to Checkout
                                    </Link>
                                    <button
                                        onClick={() => {
                                            if (confirm('Clear all items from cart?')) {
                                                clearCart();
                                            }
                                        }}
                                        className="btn-secondary w-full"
                                    >
                                        Clear Cart
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
