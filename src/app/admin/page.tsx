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
            <div className="min-h-screen bg-cream flex items-center justify-center px-4">
                <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md border border-terracotta-100">
                    <div className="flex justify-center mb-8">
                        <img src="/logo.png" alt="Logo" className="w-20 h-20" />
                    </div>
                    <h1 className="font-display text-4xl font-bold text-charcoal mb-2 text-center">
                        Admin Login
                    </h1>
                    <p className="text-charcoal/40 text-center mb-8 font-medium italic">Authorized Access Only</p>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="pin" className="block text-xs font-bold text-charcoal/40 uppercase tracking-widest ml-1">
                                Secure Access PIN
                            </label>
                            <input
                                type="password"
                                id="pin"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-terracotta-500/10 focus:border-terracotta-600 text-center text-3xl tracking-[0.5em] font-bold bg-gray-50/50"
                                placeholder="••••"
                                maxLength={4}
                                autoFocus
                            />
                        </div>
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-center text-sm font-bold">
                                {error}
                            </div>
                        )}
                        <button type="submit" className="btn-primary w-full text-lg py-4 rounded-2xl shadow-xl shadow-terracotta-600/20 active:scale-95 transition-all">
                            Enter Dashboard 🥩
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
                        <div className="bg-white p-1.5 rounded-2xl shadow-lg border border-terracotta-100 hidden sm:flex">
                            <button
                                onClick={() => setView('orders')}
                                className={`px-8 py-2.5 rounded-xl font-bold transition-all ${view === 'orders' ? 'bg-terracotta-600 text-white shadow-md' : 'text-charcoal/40 hover:text-charcoal'}`}
                            >
                                Orders
                            </button>
                            <button
                                onClick={() => setView('menu')}
                                className={`px-8 py-2.5 rounded-xl font-bold transition-all ${view === 'menu' ? 'bg-terracotta-600 text-white shadow-md' : 'text-charcoal/40 hover:text-charcoal'}`}
                            >
                                Menu
                            </button>
                        </div>
                        <button
                            onClick={() => setIsAuthenticated(false)}
                            className="bg-white border-2 border-charcoal/5 px-6 py-2.5 rounded-xl font-bold text-charcoal hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center gap-2"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Mobile View Toggle */}
                <div className="sm:hidden grid grid-cols-2 gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-lg border border-terracotta-100">
                    <button
                        onClick={() => setView('orders')}
                        className={`py-3.5 rounded-xl font-bold text-sm transition-all ${view === 'orders' ? 'bg-terracotta-600 text-white shadow-md' : 'text-charcoal/40'}`}
                    >
                        Orders
                    </button>
                    <button
                        onClick={() => setView('menu')}
                        className={`py-3.5 rounded-xl font-bold text-sm transition-all ${view === 'menu' ? 'bg-terracotta-600 text-white shadow-md' : 'text-charcoal/40'}`}
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
                        <div className="grid lg:grid-cols-2 gap-10">
                            {/* Orders List */}
                            <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-terracotta-100/30">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-display font-bold text-2xl text-charcoal">
                                        Orders ({orders.length})
                                    </h2>
                                    <button onClick={fetchOrders} className="text-terracotta-600 hover:rotate-180 transition-transform duration-500">🔄</button>
                                </div>

                                {loading ? (
                                    <div className="text-center py-20">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-600 mx-auto"></div>
                                        <p className="mt-4 text-charcoal/40 font-medium italic">Fetching latest orders...</p>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-20 bg-cream/50 rounded-2xl border-2 border-dashed border-terracotta-100">
                                        <p className="text-charcoal/40 font-bold">No orders found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 custom-scrollbar">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    fetchOrderDetails(order.id);
                                                }}
                                                className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 transform group ${selectedOrder?.id === order.id
                                                    ? 'bg-terracotta-600 text-white shadow-xl shadow-terracotta-600/30 -translate-y-1'
                                                    : 'bg-cream hover:bg-white hover:shadow-lg border-2 border-transparent hover:border-terracotta-100'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <p className={`font-bold font-display text-lg ${selectedOrder?.id === order.id ? 'text-white' : 'text-charcoal'}`}>{order.order_number}</p>
                                                        <p className={`text-sm font-medium ${selectedOrder?.id === order.id ? 'text-white/80' : 'text-charcoal/40'}`}>{order.customer_name}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.payment_status === 'paid'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {order.payment_status}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className={`text-xs font-bold ${selectedOrder?.id === order.id ? 'text-white/60' : 'text-charcoal/30'}`}>
                                                        {formatDate(order.created_at)}
                                                    </span>
                                                    <span className={`font-bold text-lg ${selectedOrder?.id === order.id ? 'text-white' : 'text-terracotta-600'}`}>
                                                        {formatPrice(order.total_amount)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Order Details */}
                            <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-terracotta-100/30">
                                <h2 className="font-display font-bold text-2xl text-charcoal mb-6 flex items-center gap-3">
                                    <span>🧾</span> Order Details
                                </h2>

                                {selectedOrder ? (
                                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                        {/* Customer Info */}
                                        <div className="bg-cream/50 rounded-2xl p-6 border border-terracotta-100/20">
                                            <h3 className="text-xs font-bold text-terracotta-600 uppercase tracking-widest mb-4">Customer Info</h3>
                                            <div className="grid grid-cols-1 gap-3 text-sm font-medium">
                                                <div className="flex justify-between">
                                                    <span className="text-charcoal/40">Name</span>
                                                    <span className="text-charcoal">{selectedOrder.customer_name}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-charcoal/40">Phone</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-charcoal">{selectedOrder.customer_phone}</span>
                                                        <a
                                                            href={`https://wa.me/${selectedOrder.customer_phone.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(`Hello ${selectedOrder.customer_name}, this is Mama Oliech Restaurant. We have received your order ${selectedOrder.order_number}.`)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1"
                                                        >
                                                            <span>💬</span> WhatsApp
                                                        </a>
                                                    </div>
                                                </div>
                                                {selectedOrder.customer_email && (
                                                    <div className="flex justify-between">
                                                        <span className="text-charcoal/40">Email</span>
                                                        <span className="text-charcoal">{selectedOrder.customer_email}</span>
                                                    </div>
                                                )}
                                                {selectedOrder.delivery_address && (
                                                    <div className="pt-2 border-t border-terracotta-100/20">
                                                        <span className="text-charcoal/40 block mb-1 uppercase text-[10px] tracking-widest">Delivery Address</span>
                                                        <span className="text-charcoal">{selectedOrder.delivery_address}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-terracotta-600 uppercase tracking-widest">Order Items</h3>
                                            <div className="space-y-3">
                                                {orderItems.map((item) => (
                                                    <div key={item.id} className="flex justify-between items-center bg-cream/30 rounded-xl p-4 border border-terracotta-100/10">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-600 font-bold text-xs">
                                                                {item.quantity}
                                                            </div>
                                                            <p className="font-bold text-charcoal">{item.menu_item_name}</p>
                                                        </div>
                                                        <p className="font-bold text-terracotta-600">
                                                            {formatPrice(item.subtotal)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-end pt-6 border-t-2 border-dashed border-terracotta-100/30">
                                                <span className="font-display font-medium text-charcoal/40">Total Amount</span>
                                                <span className="font-display font-bold text-3xl text-terracotta-600">
                                                    {formatPrice(selectedOrder.total_amount)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Update */}
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-terracotta-600 uppercase tracking-widest">Update Order Status</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {['new', 'preparing', 'ready', 'completed', 'cancelled'].map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                                                        className={`py-3 px-4 rounded-xl text-xs font-bold transition-all ${selectedOrder.order_status === status
                                                            ? 'bg-charcoal text-white shadow-xl translate-y-[-2px]'
                                                            : 'bg-cream text-charcoal hover:bg-terracotta-100 hover:text-terracotta-700'
                                                            }`}
                                                    >
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-32 bg-cream/30 rounded-3xl border-2 border-dashed border-terracotta-100/30">
                                        <span className="text-4xl block mb-4">👀</span>
                                        <p className="text-charcoal/30 font-bold uppercase tracking-widest text-xs">
                                            Select an order to view details
                                        </p>
                                    </div>
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
