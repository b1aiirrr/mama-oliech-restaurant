import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET a single menu item
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { data, error } = await supabaseAdmin
            .from('menu_items')
            .select('*')
            .eq('id', params.id)
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching menu item:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT update a menu item
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();

        const { data, error } = await supabaseAdmin
            .from('menu_items')
            .update({
                name: body.name,
                description: body.description,
                price: body.price,
                category: body.category,
                image_url: body.image_url,
                is_available: body.is_available,
                updated_at: new Date().toISOString()
            })
            .eq('id', params.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error updating menu item:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE a menu item
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { error } = await supabaseAdmin
            .from('menu_items')
            .delete()
            .eq('id', params.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting menu item:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
