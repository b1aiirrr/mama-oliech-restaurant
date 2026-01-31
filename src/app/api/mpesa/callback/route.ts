import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2));

        const { Body } = body;
        const { stkCallback } = Body;

        if (!stkCallback) {
            return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 });
        }

        const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

        // Find order by checkout request ID
        const { data: orders, error: findError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('mpesa_checkout_id', CheckoutRequestID)
            .limit(1);

        if (findError || !orders || orders.length === 0) {
            console.error('Order not found for CheckoutRequestID:', CheckoutRequestID);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orders[0];

        // Check result code
        if (ResultCode === 0) {
            // Payment successful
            let mpesaReceipt = '';

            if (CallbackMetadata && CallbackMetadata.Item) {
                const receiptItem = CallbackMetadata.Item.find(
                    (item: any) => item.Name === 'MpesaReceiptNumber'
                );
                if (receiptItem) {
                    mpesaReceipt = receiptItem.Value;
                }
            }

            // Update order status
            const { error: updateError } = await supabaseAdmin
                .from('orders')
                .update({
                    payment_status: 'paid',
                    order_status: 'preparing',
                    mpesa_receipt: mpesaReceipt,
                })
                .eq('id', order.id);

            if (updateError) {
                console.error('Failed to update order:', updateError);
            }

            console.log(`Payment successful for order ${order.order_number}`);
        } else {
            // Payment failed
            const { error: updateError } = await supabaseAdmin
                .from('orders')
                .update({
                    payment_status: 'failed',
                })
                .eq('id', order.id);

            if (updateError) {
                console.error('Failed to update order:', updateError);
            }

            console.log(`Payment failed for order ${order.order_number}: ${ResultDesc}`);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('M-Pesa callback error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
