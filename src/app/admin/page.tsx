'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Order, OrderItem } from '@/types/orders';
import { AdminMenuEditor } from '@/components/AdminMenuEditor';

export default function AdminPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'new' | 'preparing' | 'ready' | 'completed'>('all');
    const [view, setView] = useState<'orders' | 'menu'>('orders');

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, filter]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === (process.env.NEXT_PUBLIC_ADMIN_PIN || '2026')) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Incorrect PIN');
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('order_status', filter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (orderId: string) => {
        try {
            const { data, error } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderId);

            if (error) throw error;
            setOrderItems(data || []);
        } catch (err) {
            console.error('Failed to fetch order items:', err);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ order_status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            // Refresh orders
            fetchOrders();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, order_status: newStatus as any });
            }
        } catch (err) {
            console.error('Failed to update order status:', err);
            alert('Failed to update order status');
        }
    };

    const formatPrice = (price: number) => `KSh ${price.toLocaleString()}`;
    const formatDate = (date: string) => new Date(date).toLocaleString('en-KE');

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-terracotta-100 to-cream flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                    <h1 className="font-display text-3xl font-semibold text-charcoal mb-6 text-center">
                        Admin Login
                    </h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="pin" className="block font-semibold text-charcoal mb-2">
                                Enter PIN
                            </label>
                            <input
                                type="password"
                                id="pin"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent text-center text-2xl tracking-widest"
                                placeholder="••••"
                                maxLength={4}
                                autoFocus
                            />
                        </div>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}
                        <button type="submit" className="btn-primary w-full text-lg py-3">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream py-12">
            <div className="container max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="font-display text-4xl sm:text-5xl font-bold text-charcoal">
                            Admin Dashboard
                        </h1>
                        <p className="text-charcoal/40 font-medium mt-2 uppercase tracking-widest text-sm">
                            Management Portal
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-1 rounded-xl shadow-inner border border-gray-100 hidden sm:flex">
                            <button
                                onClick={() => setView('orders')}
                                className={`px-6 py-2 rounded-lg font-bold transition-all ${view === 'orders' ? 'bg-charcoal text-white' : 'text-charcoal/40 hover:text-charcoal'}`}
                            >
                                Orders
                            </button>
                            <button
                                onClick={() => setView('menu')}
                                className={`px-6 py-2 rounded-lg font-bold transition-all ${view === 'menu' ? 'bg-charcoal text-white' : 'text-charcoal/40 hover:text-charcoal'}`}
                            >
                                Menu
                            </button>
                        </div>
                        <button
                            onClick={() => setIsAuthenticated(false)}
                            className="btn-secondary"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Mobile View Toggle */}
                <div className="sm:hidden grid grid-cols-2 gap-2 mb-8 bg-white p-1 rounded-xl shadow-inner border border-gray-100">
                    <button
                        onClick={() => setView('orders')}
                        className={`py-3 rounded-lg font-bold text-sm transition-all ${view === 'orders' ? 'bg-charcoal text-white' : 'text-charcoal/40'}`}
                    >
                        Orders
                    </button>
                    <button
                        onClick={() => setView('menu')}
                        className={`py-3 rounded-lg font-bold text-sm transition-all ${view === 'menu' ? 'bg-charcoal text-white' : 'text-charcoal/40'}`}
                    >
                        Menu
                    </button>
                </div>

                {view === 'orders' ? (
                    <>
                        {/* Filter Tabs */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                            {['all', 'new', 'preparing', 'ready', 'completed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status as any)}
                                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${filter === status
                                        ? 'bg-terracotta-600 text-white'
                                        : 'bg-white text-charcoal hover:bg-terracotta-50'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Orders Grid */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Orders List */}
                            <div className="bg-white rounded-2xl shadow-md p-6">
                                <h2 className="font-semibold text-xl text-charcoal mb-4">
                                    Orders ({orders.length})
                                </h2>

                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta-600 mx-auto"></div>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <p className="text-center text-charcoal/60 py-12">No orders found</p>
                                ) : (
                                    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    fetchOrderDetails(order.id);
                                                }}
                                                className={`p-4 rounded-xl cursor-pointer transition-all ${selectedOrder?.id === order.id
                                                    ? 'bg-terracotta-100 border-2 border-terracotta-600'
                                                    : 'bg-cream hover:bg-terracotta-50 border-2 border-transparent'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-semibold text-charcoal">{order.order_number}</p>
                                                        <p className="text-sm text-charcoal/60">{order.customer_name}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${order.payment_status === 'paid'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {order.payment_status}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-charcoal/60">
                                                        {formatDate(order.created_at)}
                                                    </span>
                                                    <span className="font-semibold text-terracotta-600">
                                                        {formatPrice(order.total_amount)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Order Details */}
                            <div className="bg-white rounded-2xl shadow-md p-6">
                                <h2 className="font-semibold text-xl text-charcoal mb-4">Order Details</h2>

                                {selectedOrder ? (
                                    <div className="space-y-6">
                                        {/* Customer Info */}
                                        <div className="bg-cream rounded-xl p-4">
                                            <h3 className="font-semibold text-charcoal mb-3">Customer Information</h3>
                                            <div className="space-y-2 text-sm">
                                                <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                                                <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                                                {selectedOrder.customer_email && (
                                                    <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                                                )}
                                                {selectedOrder.delivery_address && (
                                                    <p><strong>Address:</strong> {selectedOrder.delivery_address}</p>
                                                )}
                                                {selectedOrder.notes && (
                                                    <p><strong>Notes:</strong> {selectedOrder.notes}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div>
                                            <h3 className="font-semibold text-charcoal mb-3">Items</h3>
                                            <div className="space-y-2">
                                                {orderItems.map((item) => (
                                                    <div key={item.id} className="flex justify-between bg-cream rounded-lg p-3">
                                                        <div>
                                                            <p className="font-semibold text-charcoal">{item.menu_item_name}</p>
                                                            <p className="text-sm text-charcoal/60">Qty: {item.quantity}</p>
                                                        </div>
                                                        <p className="font-semibold text-terracotta-600">
                                                            {formatPrice(item.subtotal)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                                                <span className="font-semibold">Total:</span>
                                                <span className="font-semibold text-terracotta-600 text-lg">
                                                    {formatPrice(selectedOrder.total_amount)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Update */}
                                        <div>
                                            <h3 className="font-semibold text-charcoal mb-3">Update Status</h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['new', 'preparing', 'ready', 'completed', 'cancelled'].map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                                                        className={`py-2 px-4 rounded-lg font-semibold transition-colors ${selectedOrder.order_status === status
                                                            ? 'bg-terracotta-600 text-white'
                                                            : 'bg-gray-100 text-charcoal hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-charcoal/60 py-12">
                                        Select an order to view details
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <AdminMenuEditor />
                )}
            </div>
        </div>
    );
}
