import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { phone_number, amount, order_id } = await request.json();

        // Validate inputs
        if (!phone_number || !amount || !order_id) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Format phone number to 254XXXXXXXXX
        let formattedPhone = phone_number.replace(/\s/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.slice(1);
        } else if (!formattedPhone.startsWith('254')) {
            formattedPhone = '254' + formattedPhone;
        }

        // Get M-Pesa access token
        const auth = Buffer.from(
            `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
        ).toString('base64');

        const tokenResponse = await fetch(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        const { access_token } = await tokenResponse.json();

        // Generate timestamp
        const timestamp = new Date()
            .toISOString()
            .replace(/[^0-9]/g, '')
            .slice(0, 14);

        // Generate password
        const password = Buffer.from(
            `${process.env.MPESA_BUSINESS_SHORT_CODE}${process.env.MPESA_PASSKEY}${timestamp}`
        ).toString('base64');

        // Initiate STK Push
        const stkPushResponse = await fetch(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    BusinessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: 'CustomerPayBillOnline',
                    Amount: Math.round(amount),
                    PartyA: formattedPhone,
                    PartyB: process.env.MPESA_BUSINESS_SHORT_CODE,
                    PhoneNumber: formattedPhone,
                    CallBackURL: `${process.env.NEXT_PUBLIC_MPESA_CALLBACK_URL}`,
                    AccountReference: order_id,
                    TransactionDesc: `Payment for order ${order_id}`,
                }),
            }
        );

        const stkData = await stkPushResponse.json();

        if (stkData.ResponseCode !== '0') {
            return NextResponse.json(
                { error: stkData.ResponseDescription || 'STK Push failed' },
                { status: 400 }
            );
        }

        // Update order with checkout request ID
        const { supabaseAdmin } = await import('@/lib/supabase');
        await supabaseAdmin
            .from('orders')
            .update({ mpesa_checkout_id: stkData.CheckoutRequestID })
            .eq('id', order_id);

        return NextResponse.json({
            success: true,
            checkoutRequestId: stkData.CheckoutRequestID,
            merchantRequestId: stkData.MerchantRequestID,
        });
    } catch (error: any) {
        console.error('M-Pesa STK Push error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
