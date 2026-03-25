import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const { order_id, amount, email } = await req.json();

        if (!order_id || !amount) {
            return NextResponse.json({ error: 'Missing order_id or amount' }, { status: 400 });
        }

        const stripe = getStripe();
        if (process.env.STRIPE_SECRET_KEY === 'placeholder' || !process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Stripe is currently in demo mode. Please set your STRIPE_SECRET_KEY in Vercel to enable real card payments.' }, { status: 400 });
        }
        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'kes',
                        product_data: {
                            name: `Order #${order_id.substring(0, 8)}`,
                            description: 'Mama Oliech Restaurant Order',
                        },
                        unit_amount: Math.round(amount * 100), // Stripe uses cents/smallest unit
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-confirmation/${order_id}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/${order_id}`,
            metadata: {
                order_id: order_id,
            },
            customer_email: email || undefined,
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error("Stripe Session Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
