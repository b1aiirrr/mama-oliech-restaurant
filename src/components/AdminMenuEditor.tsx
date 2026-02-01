'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    is_available: boolean;
}

export function AdminMenuEditor() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchMenu();
    }, []);

    const importInitialMenu = async () => {
        if (!confirm('This will import all items from the static menu file to your database. Continue?')) return;

        setIsSaving(true);
        try {
            // Import the static menu items
            const { menuItems } = await import('@/data/menu');

            for (const item of menuItems) {
                await fetch('/api/admin/menu', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: item.name,
                        description: item.description,
                        price: item.price,
                        category: item.category,
                        image_url: item.image, // Migrate static image path
                        is_available: true
                    }),
                });
            }
            alert('Menu imported successfully!');
            fetchMenu();
        } catch (error) {
            console.error('Import error:', error);
            alert('Failed to import menu');
        } finally {
            setIsSaving(false);
        }
    };

    const fetchMenu = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/menu');
            const data = await response.json();
            if (response.ok) {
                setItems(data);
            }
        } catch (error) {
            console.error('Failed to fetch menu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        setIsSaving(true);
        try {
            const isNew = !editingItem.id;
            const url = isNew ? '/api/admin/menu' : `/api/admin/menu/${editingItem.id}`;
            const method = isNew ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingItem),
            });

            if (response.ok) {
                setEditingItem(null);
                fetchMenu();
            } else {
                const err = await response.json();
                alert(`Save failed: ${err.error}`);
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('An error occurred while saving');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const response = await fetch(`/api/admin/menu/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchMenu();
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingItem) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `menu/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('menu-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('menu-images')
                .getPublicUrl(filePath);

            setEditingItem({ ...editingItem, image_url: publicUrl });
        } catch (error: any) {
            console.error('Upload error:', error.message);
            alert('Image upload failed. Ensure you have created the "menu-images" bucket in Supabase and set it to Public.');
        } finally {
            setUploading(false);
        }
    };

    const formatPrice = (price: number) => `KSh ${price.toLocaleString()}`;

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-charcoal">Menu Management</h2>
                <div className="flex gap-4">
                    {items.length === 0 && (
                        <button
                            onClick={importInitialMenu}
                            className="bg-cream hover:bg-terracotta-50 text-terracotta-600 border border-terracotta-200 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                        >
                            <span>📥</span> Import Static Menu
                        </button>
                    )}
                    <button
                        onClick={() => setEditingItem({ category: 'fish', is_available: true })}
                        className="btn-primary"
                    >
                        + Add New Dish
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
                        <div className="relative h-48 w-full bg-gray-100">
                            {item.image_url ? (
                                <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-charcoal/20">
                                    No Image
                                </div>
                            )}
                            <div className="absolute top-4 right-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {item.is_available ? 'Available' : 'Out of Stock'}
                                </span>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-charcoal">{item.name}</h3>
                                <span className="text-terracotta-600 font-bold">{formatPrice(item.price)}</span>
                            </div>
                            <p className="text-sm text-charcoal/60 line-clamp-2 mb-4 flex-1">{item.description}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingItem(item)}
                                    className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-charcoal text-sm font-bold rounded-lg transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Editor Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-charcoal">
                                {editingItem.id ? 'Edit Dish' : 'Add New Dish'}
                            </h3>
                            <button onClick={() => setEditingItem(null)} className="text-charcoal/40 hover:text-charcoal font-bold p-2">✕</button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-charcoal/60 uppercase tracking-widest">Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={editingItem.name || ''}
                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                                        placeholder="e.g. Whole Tilapia"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-charcoal/60 uppercase tracking-widest">Category</label>
                                    <select
                                        value={editingItem.category || 'fish'}
                                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                                    >
                                        <option value="fish">Fish</option>
                                        <option value="accompaniments">Accompaniments</option>
                                        <option value="drinks">Drinks</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-charcoal/60 uppercase tracking-widest">Price (KSh)</label>
                                    <input
                                        required
                                        type="number"
                                        value={editingItem.price || ''}
                                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                                        placeholder="1200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-charcoal/60 uppercase tracking-widest">Availability</label>
                                    <div className="flex items-center gap-4 py-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={editingItem.is_available}
                                                onChange={(e) => setEditingItem({ ...editingItem, is_available: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta-600"></div>
                                            <span className="ml-3 text-sm font-bold text-charcoal">
                                                {editingItem.is_available ? 'Visible on Menu' : 'Hidden / Out of Stock'}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-charcoal/60 uppercase tracking-widest">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={editingItem.description || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                                    placeholder="Tell customers about this dish..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-charcoal/60 uppercase tracking-widest">Dish Image</label>
                                <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <div className="relative w-24 h-24 bg-white rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                                        {editingItem.image_url ? (
                                            <Image src={editingItem.image_url} alt="Preview" fill className="object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-charcoal/20">
                                                No Image
                                            </div>
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                <div className="animate-spin h-6 w-6 border-2 border-terracotta-600 rounded-full border-t-transparent"></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-charcoal cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            {editingItem.image_url ? 'Change Image' : 'Upload Image'}
                                        </label>
                                        <p className="mt-1 text-xs text-charcoal/40 font-medium">PNG, JPG up to 5MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={isSaving || uploading}
                                    className="btn-primary flex-1 py-4 text-lg rounded-xl shadow-lg shadow-terracotta-600/20 disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Dish'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-8 py-4 text-charcoal/60 font-bold hover:text-charcoal transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
