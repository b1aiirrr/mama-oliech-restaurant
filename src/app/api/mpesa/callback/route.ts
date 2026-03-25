import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// IMPORTANT: Always return 200 OK to Safaricom.
// Non-200 responses cause Daraja to retry/flag the callback.
const OK_RESPONSE = NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2));

        const stkCallback = body?.Body?.stkCallback;

        if (!stkCallback) {
            console.error('Callback body missing stkCallback:', JSON.stringify(body));
            return OK_RESPONSE; // Still return 200
        }

        const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

        // Find order by checkout request ID
        const { data: orders, error: findError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('mpesa_checkout_id', CheckoutRequestID)
            .limit(1);

        if (findError || !orders || orders.length === 0) {
            console.error('Order not found for CheckoutRequestID:', CheckoutRequestID, findError?.message);
            return OK_RESPONSE; // Still return 200 — don't make Safaricom retry
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

            console.log(`Payment successful for order ${order.order_number}, receipt: ${mpesaReceipt}`);
        } else {
            // Payment failed or cancelled by user
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

        return OK_RESPONSE;
    } catch (error: any) {
        console.error('M-Pesa callback error:', error);
        // STILL return 200 — never let Safaricom see an error
        return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
}
