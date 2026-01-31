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
                            className="fixed inset-0 bg-charcoal/80 backdrop-blur-[4px] z-[9998]"
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                        />

                        {/* Full Screen Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed inset-0 w-full h-full bg-white z-[9999] flex flex-col"
                            style={{ backgroundColor: '#ffffff', position: 'fixed', right: 0, top: 0, height: '100%', width: '100%', opacity: 1 }}
                        >
                            {/* Header */}
                            <div className="p-4 sm:p-6 border-b border-gray-200 bg-white" style={{ backgroundColor: '#ffffff' }}>
                                <div className="container-wide flex items-center justify-between">
                                    <h2 className="font-display text-2xl sm:text-3xl font-semibold text-charcoal">
                                        Your Cart ({itemCount})
                                    </h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                                        aria-label="Close cart"
                                    >
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white" style={{ backgroundColor: '#ffffff' }}>
                                <div className="max-w-3xl mx-auto w-full">
                                    {items.length === 0 ? (
                                        <div className="text-center py-20 bg-white" style={{ backgroundColor: '#ffffff' }}>
                                            <div className="mb-6 opacity-20">
                                                <svg className="w-32 h-32 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                            </div>
                                            <p className="text-2xl text-charcoal/60 mb-8 font-display">Your cart is empty</p>
                                            <button
                                                onClick={() => setIsOpen(false)}
                                                className="btn-primary px-10 py-4 text-lg"
                                            >
                                                Start Ordering
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex flex-col sm:flex-row gap-6 p-6 bg-cream rounded-2xl border border-terracotta-100/50 shadow-sm"
                                                >
                                                    <div className="relative w-full sm:w-32 h-48 sm:h-32 rounded-xl overflow-hidden flex-shrink-0">
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-between pt-2">
                                                        <div>
                                                            <div className="flex justify-between items-start">
                                                                <h3 className="font-display text-xl sm:text-2xl font-bold text-charcoal">{item.name}</h3>
                                                                <p className="text-terracotta-700 font-bold text-xl ml-4">
                                                                    {formatPrice(item.price)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-6">
                                                            <div className="flex items-center gap-4 bg-white p-1 rounded-lg border border-gray-200">
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded hover:bg-terracotta-50 text-xl font-bold transition-colors"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="font-bold text-xl  w-8 text-center">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded hover:bg-terracotta-50 text-xl font-bold transition-colors"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                            <button
                                                                onClick={() => removeFromCart(item.id)}
                                                                className="text-red-500 hover:text-red-700 font-semibold text-sm uppercase tracking-wider p-2"
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
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 p-4 sm:p-8 bg-white" style={{ backgroundColor: '#ffffff' }}>
                                <div className="max-w-3xl mx-auto w-full space-y-6">
                                    {items.length > 0 && (
                                        <>
                                            <div className="flex justify-between text-2xl sm:text-3xl font-bold border-b border-gray-100 pb-4">
                                                <span className="text-charcoal/60">Total Amount:</span>
                                                <span className="text-terracotta-600">{formatPrice(totalAmount)}</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                                <Link
                                                    href="/checkout"
                                                    onClick={() => setIsOpen(false)}
                                                    className="btn-primary py-5 text-xl text-center shadow-lg shadow-terracotta-600/20"
                                                >
                                                    Proceed to Checkout
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to empty your cart?')) {
                                                            clearCart();
                                                        }
                                                    }}
                                                    className="btn-secondary py-5 text-xl"
                                                >
                                                    Empty Cart
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {/* Global Reset Button (Helpful for users with sync issues) */}
                                    <div className="pt-8 border-t border-gray-100 flex justify-center">
                                        <button
                                            onClick={() => {
                                                if (confirm('This will completely RESET your session and clear all cart/order data. Continue?')) {
                                                    localStorage.clear();
                                                    window.location.reload();
                                                }
                                            }}
                                            className="text-gray-400 hover:text-charcoal transition-colors text-xs uppercase tracking-widest flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Reset Site Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
