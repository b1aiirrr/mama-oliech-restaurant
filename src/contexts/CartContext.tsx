'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '@/types/orders';
import { MenuItem } from '@/data/menu';

interface CartContextType {
    items: CartItem[];
    addToCart: (menuItem: MenuItem) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalAmount: () => number;
    getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('mama-oliech-cart');
        if (savedCart) {
            setItems(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('mama-oliech-cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (menuItem: MenuItem) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === menuItem.id);

            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === menuItem.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [
                ...prevItems,
                {
                    id: menuItem.id,
                    name: menuItem.name,
                    price: menuItem.price,
                    quantity: 1,
                    image: menuItem.image,
                },
            ];
        });
    };

    const removeFromCart = (itemId: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const getTotalAmount = () => {
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getItemCount = () => {
        return items.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalAmount,
                getItemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
