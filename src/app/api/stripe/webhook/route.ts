import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('stripe-signature') as string;

    let event;
    const stripe = getStripe();

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const orderId = session.metadata.order_id;
        const paymentIntentId = session.payment_intent;

        console.log(`Payment successful for order: ${orderId}`);

        // Update order status in Supabase
        const { error } = await supabaseAdmin
            .from('orders')
            .update({
                payment_status: 'paid',
                mpesa_receipt: paymentIntentId, // reusing this field for stripe receipt
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) {
            console.error(`Error updating order ${orderId}:`, error.message);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
