'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';

export function CartButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { items, removeFromCart, updateQuantity, getTotalAmount, getItemCount, clearCart } = useCart();

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const itemCount = getItemCount();
    const totalAmount = getTotalAmount();
    const formatPrice = (price: number) => `KSh ${price.toLocaleString()}`;

    const cartContent = (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[999999]"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-charcoal/60 backdrop-blur-md"
                    />

                    {/* Full Screen Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 35, stiffness: 350 }}
                        className="absolute inset-0 w-screen h-[100dvh] bg-white flex flex-col overflow-hidden"
                        style={{ backgroundColor: '#ffffff', width: '100vw', height: '100dvh' }}
                    >
                        {/* Header */}
                        <div className="flex-none p-6 sm:p-10 border-b border-gray-100 bg-white">
                            <div className="max-w-7xl mx-auto flex items-center justify-between">
                                <div className="flex flex-col">
                                    <h2 className="font-display text-4xl sm:text-6xl font-bold text-charcoal">
                                        Your Bag
                                    </h2>
                                    <p className="text-terracotta-600 font-bold text-xl uppercase tracking-widest mt-2">
                                        {itemCount} Delicacies Selected
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-5 hover:bg-gray-100 rounded-full transition-all bg-gray-50 text-charcoal active:scale-90"
                                    aria-label="Close cart"
                                >
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Items Area */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-20 bg-white">
                            <div className="max-w-4xl mx-auto w-full">
                                {items.length === 0 ? (
                                    <div className="text-center py-32">
                                        <div className="mb-12 opacity-10">
                                            <svg className="w-56 h-56 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        </div>
                                        <p className="text-4xl font-display text-charcoal/30 mb-12 italic">Hungry? Your cart is empty...</p>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="btn-primary px-20 py-8 text-3xl rounded-[3rem] shadow-2xl shadow-terracotta-600/30"
                                        >
                                            View Menu
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-16 pb-20">
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex flex-col sm:flex-row gap-12 items-center sm:items-stretch"
                                            >
                                                <div className="relative w-full sm:w-64 h-80 sm:h-auto rounded-[3rem] overflow-hidden flex-shrink-0 shadow-2xl">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between py-4 text-center sm:text-left w-full">
                                                    <div>
                                                        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                                                            <h3 className="font-display text-4xl sm:text-5xl font-bold text-charcoal">{item.name}</h3>
                                                            <p className="text-terracotta-700 font-bold text-3xl sm:text-4xl">
                                                                {formatPrice(item.price)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row items-center justify-between mt-12 gap-8">
                                                        <div className="flex items-center gap-10 bg-gray-50 p-3 rounded-[2.5rem] border border-gray-100 shadow-inner">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="w-16 h-16 flex items-center justify-center bg-white rounded-full hover:bg-terracotta-600 hover:text-white text-4xl font-bold transition-all shadow-md active:scale-90"
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                -
                                                            </button>
                                                            <span className="font-bold text-4xl min-w-[3rem] text-center">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="w-16 h-16 flex items-center justify-center bg-white rounded-full hover:bg-terracotta-600 hover:text-white text-4xl font-bold transition-all shadow-md active:scale-90"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-red-500 hover:text-red-700 font-black uppercase tracking-widest text-sm py-4 px-8 rounded-full bg-red-50 hover:bg-red-100 transition-colors"
                                                        >
                                                            Remove Item
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
                        <div className="flex-none p-10 sm:p-20 border-t border-gray-100 bg-white">
                            <div className="max-w-4xl mx-auto w-full space-y-12">
                                {items.length > 0 && (
                                    <div className="flex flex-col gap-10">
                                        <div className="flex justify-between items-end">
                                            <span className="text-3xl font-display text-charcoal/40 font-bold uppercase tracking-[0.3em]">Total Amount</span>
                                            <span className="text-6xl sm:text-8xl font-display font-bold text-terracotta-600">{formatPrice(totalAmount)}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            <Link
                                                href="/checkout"
                                                onClick={() => setIsOpen(false)}
                                                className="btn-primary py-10 text-3xl text-center rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(196,64,44,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            >
                                                Proceed to Checkout
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to empty your cart?')) {
                                                        clearCart();
                                                    }
                                                }}
                                                className="btn-secondary py-10 text-3xl rounded-[3rem]"
                                            >
                                                Clear Bag
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 opacity-30">
                                    <button
                                        onClick={() => {
                                            if (confirm('This will completely RESET your session and clear all cart/order data. Continue?')) {
                                                localStorage.clear();
                                                window.location.reload();
                                            }
                                        }}
                                        className="text-charcoal hover:opacity-100 transition-opacity text-xs uppercase font-bold tracking-[0.4em]"
                                    >
                                        Emergency Session Reset
                                    </button>
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">Mama Oliech Restaurant • Secure Checkout</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 hover:bg-terracotta-50 rounded-full transition-colors"
                aria-label="Shopping cart"
            >
                <svg
                    className="w-7 h-7 text-charcoal"
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
                    <span className="absolute -top-1 -right-1 bg-terracotta-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                        {itemCount}
                    </span>
                )}
            </button>

            {mounted && createPortal(cartContent, document.body)}
        </>
    );
}
