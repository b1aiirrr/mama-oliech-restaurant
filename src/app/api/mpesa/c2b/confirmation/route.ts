import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Safaricom requires a Validation and Confirmation endpoint for C2B (QR) payments
export async function POST(req: Request) {
    try {
        const data = await req.json();
        console.log("C2B Confirmation Received:", JSON.stringify(data));

        // data format for C2B Confirmation:
        // { TransactionType, TransID, TransTime, TransAmount, BusinessShortCode, BillRefNumber, InvoiceNumber, OrgAccountBalance, ThirdPartyTransID, MSISDN, FirstName }

        const accountRef = data.BillRefNumber; // This will be the order ID (or truncated order ID)
        const amount = data.TransAmount;
        const receipt = data.TransID;

        if (!accountRef || !receipt) {
            return NextResponse.json({ ResultCode: 1, ResultDesc: "Reject" }, { status: 400 });
        }

        // We match the order by mpesa_checkout_id or ID? 
        // For QR codes, we will pass the order.id as RefNo. Since order.id is UUID, we might have passed a substring.
        // Let's search for an order where ID starts with the BillRefNumber
        
        const { data: orderData, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('id, payment_status')
            .ilike('id', `${accountRef}%`)
            .single();

        if (orderError || !orderData) {
            console.error(`C2B Order not found for Ref: ${accountRef}`);
            // Always return 0 to Safaricom so they stop retrying
            return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
        }

        // Update the order
        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({
                payment_status: 'paid',
                mpesa_receipt: receipt,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderData.id);

        if (updateError) {
            console.error(`C2B Update Failed: ${updateError.message}`);
        }

        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

    } catch (error: any) {
        console.error("C2B Confirmation Error:", error);
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }
}
