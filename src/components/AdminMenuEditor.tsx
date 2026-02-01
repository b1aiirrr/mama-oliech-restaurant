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
            const { menuItems } = await import('@/data/menu');

            let successCount = 0;
            for (const item of menuItems) {
                try {
                    const res = await fetch('/api/admin/menu', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            category: item.category,
                            image_url: item.image,
                            is_available: true
                        }),
                    });

                    if (res.ok) {
                        successCount++;
                    } else {
                        const errorData = await res.json();
                        console.error(`Failed to import "${item.name}":`, errorData.error);
                    }
                } catch (err) {
                    console.error(`Network or parse error on "${item.name}":`, err);
                }
            }

            if (successCount === 0) {
                alert('Import failed: 0 items were saved. \n\nThis usually means the "menu_items" table is missing in your Supabase database. Please check the "supabase-schema.sql" file and run the SQL in your Supabase Dashboard.');
            } else {
                alert(`Successfully imported ${successCount} items!`);
            }
            // Add a small delay for Supabase indexing/replication
            setTimeout(() => fetchMenu(), 500);
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
            const response = await fetch(`/api/admin/menu?t=${Date.now()}`); // Cache busting
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
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-display font-bold text-charcoal">Menu Management</h2>
                <div className="flex gap-4">
                    <button
                        onClick={importInitialMenu}
                        className="bg-cream hover:bg-terracotta-50 text-terracotta-600 border border-terracotta-200 px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-sm"
                    >
                        <span>📥</span> {items.length === 0 ? 'Import Initial Menu' : 'Re-Import (New Items)'}
                    </button>
                    <button
                        onClick={() => setEditingItem({ category: 'fish', is_available: true })}
                        className="btn-primary px-8 shadow-xl shadow-terracotta-600/20"
                    >
                        + Add New Dish
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-terracotta-100/30 flex flex-col group hover:shadow-2xl transition-all duration-300">
                        <div className="relative h-56 w-full bg-cream overflow-hidden">
                            {item.image_url ? (
                                <Image src={item.image_url} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-charcoal/10 font-bold italic">
                                    No Image Provided
                                </div>
                            )}
                            <div className="absolute top-4 right-4">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold shadow-lg shadow-black/5 backdrop-blur-md border ${item.is_available ? 'bg-green-500/90 text-white border-green-400' : 'bg-red-500/90 text-white border-red-400'}`}>
                                    {item.is_available ? 'Available' : 'Out of Stock'}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-display font-bold text-xl text-charcoal group-hover:text-terracotta-600 transition-colors">{item.name}</h3>
                                <span className="text-terracotta-600 font-bold text-lg whitespace-nowrap ml-4">{formatPrice(item.price)}</span>
                            </div>
                            <p className="text-sm text-charcoal/50 leading-relaxed line-clamp-2 mb-6 flex-1 italic">{item.description}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditingItem(item)}
                                    className="flex-1 py-3 bg-cream hover:bg-terracotta-600 hover:text-white text-terracotta-700 text-sm font-bold rounded-xl transition-all border border-terracotta-100 flex items-center justify-center gap-2"
                                >
                                    <span>✏️</span> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="px-5 py-3 bg-red-50 hover:bg-red-600 hover:text-white text-red-500 rounded-xl transition-all border border-red-100 flex items-center justify-center"
                                >
                                    🗑️
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
                        <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto bg-white">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-terracotta-600 uppercase tracking-[0.2em] ml-1">Dish Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={editingItem.name || ''}
                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl border-2 border-cream bg-cream/30 focus:bg-white focus:ring-4 focus:ring-terracotta-500/10 focus:border-terracotta-600 transition-all font-medium text-charcoal outline-none shadow-inner"
                                        placeholder="e.g. Whole Tilapia Fry"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-terracotta-600 uppercase tracking-[0.2em] ml-1">Category</label>
                                    <select
                                        value={editingItem.category || 'fish'}
                                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl border-2 border-cream bg-cream/30 focus:bg-white focus:ring-4 focus:ring-terracotta-500/10 focus:border-terracotta-600 transition-all font-medium text-charcoal outline-none shadow-inner appearance-none"
                                    >
                                        <option value="fish">Fish 🐟</option>
                                        <option value="accompaniments">Accompaniments 🍚</option>
                                        <option value="drinks">Drinks 🥤</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-terracotta-600 uppercase tracking-[0.2em] ml-1">Price (KSh)</label>
                                    <input
                                        required
                                        type="number"
                                        value={editingItem.price || ''}
                                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                                        className="w-full px-5 py-4 rounded-2xl border-2 border-cream bg-cream/30 focus:bg-white focus:ring-4 focus:ring-terracotta-500/10 focus:border-terracotta-600 transition-all font-bold text-charcoal outline-none shadow-inner"
                                        placeholder="1200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-terracotta-600 uppercase tracking-[0.2em] ml-1">Availability</label>
                                    <div className="flex items-center gap-4 py-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={editingItem.is_available}
                                                onChange={(e) => setEditingItem({ ...editingItem, is_available: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-12 h-7 bg-cream border-2 border-terracotta-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-terracotta-200 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta-600 after:shadow-sm"></div>
                                            <span className="ml-4 text-xs font-bold text-charcoal/60 uppercase tracking-widest">
                                                {editingItem.is_available ? 'Visible' : 'Hidden'}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-terracotta-600 uppercase tracking-[0.2em] ml-1">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={editingItem.description || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl border-2 border-cream bg-cream/30 focus:bg-white focus:ring-4 focus:ring-terracotta-500/10 focus:border-terracotta-600 transition-all font-medium text-charcoal outline-none shadow-inner resize-none"
                                    placeholder="Tell customers about this dish..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-terracotta-600 uppercase tracking-[0.2em] ml-1">Dish Image</label>
                                <div className="flex items-center gap-8 p-6 bg-cream/20 rounded-[2rem] border-2 border-dashed border-terracotta-100 group-hover:border-terracotta-300 transition-all">
                                    <div className="relative w-32 h-32 bg-white rounded-2xl overflow-hidden shadow-xl border border-terracotta-50 flex-shrink-0">
                                        {editingItem.image_url ? (
                                            <Image src={editingItem.image_url} alt="Preview" fill className="object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-terracotta-200 gap-2">
                                                <span className="text-3xl">🖼️</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                                            </div>
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-2">
                                                <div className="animate-spin h-8 w-8 border-3 border-terracotta-600 rounded-full border-t-transparent"></div>
                                                <span className="text-[10px] font-bold text-terracotta-600">Uploading...</span>
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
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-terracotta-100 rounded-xl text-sm font-bold text-terracotta-600 cursor-pointer hover:bg-terracotta-600 hover:text-white transition-all shadow-sm active:scale-95"
                                        >
                                            <span>📷</span> {editingItem.image_url ? 'Change Photo' : 'Upload Photo'}
                                        </label>
                                        <p className="mt-3 text-[10px] text-charcoal/30 font-bold uppercase tracking-widest">High quality JPG or PNG</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="submit"
                                    disabled={isSaving || uploading}
                                    className="btn-primary flex-1 py-5 text-lg rounded-2xl shadow-xl shadow-terracotta-600/30 disabled:opacity-50 active:scale-95 transition-all font-bold"
                                >
                                    {isSaving ? 'Finalizing...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-8 py-5 text-charcoal/40 font-bold hover:text-charcoal transition-all uppercase tracking-widest text-xs"
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
