import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET all menu items (Admin view includes hidden items)
export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('menu_items')
            .select('*')
            .order('category', { ascending: true })
            .order('name', { ascending: true });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching menu items:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST create a new menu item
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { data, error } = await supabaseAdmin
            .from('menu_items')
            .insert([
                {
                    name: body.name,
                    description: body.description,
                    price: body.price,
                    category: body.category,
                    image_url: body.image_url,
                    is_available: body.is_available ?? true
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error creating menu item:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
