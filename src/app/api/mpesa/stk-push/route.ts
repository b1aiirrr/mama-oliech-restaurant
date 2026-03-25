import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getMpesaAccessToken } from '@/lib/mpesa';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        console.log('--- M-Pesa STK Push Start ---');

        // Validate critical env vars early
        const shortCode = process.env.MPESA_BUSINESS_SHORT_CODE;
        const passkey = process.env.MPESA_PASSKEY;
        if (!shortCode || !passkey) {
            console.error('MPESA_BUSINESS_SHORT_CODE or MPESA_PASSKEY is not set.');
            return NextResponse.json(
                { error: 'M-Pesa is not configured on this server. Please contact support.' },
                { status: 500 }
            );
        }

        const { phone_number, amount, order_id } = await request.json();

        // Validation
        if (!phone_number || !amount || !order_id) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Format phone number to 254XXXXXXXXX
        let formattedPhone = phone_number.replace(/\s/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.slice(1);
        } else if (formattedPhone.startsWith('+')) {
            formattedPhone = formattedPhone.slice(1);
        } else if (!formattedPhone.startsWith('254')) {
            formattedPhone = '254' + formattedPhone;
        }

        console.log(`Payload -> Order: ${order_id}, Phone: ${formattedPhone}, Amount: ${amount}`);

        // Get Access Token with Retry Logic
        const access_token = await getMpesaAccessToken();

        // Generate timestamp
        const timestamp = new Date()
            .toISOString()
            .replace(/[^0-9]/g, '')
            .slice(0, 14);

        // Generate password
        const password = Buffer.from(
            `${shortCode}${passkey}${timestamp}`
        ).toString('base64');

        console.log(`Attempting STK Push to Safaricom for ${formattedPhone}...`);

        // Initiate STK Push
        const stkPushResponse = await fetch(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                body: JSON.stringify({
                    BusinessShortCode: shortCode,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: 'CustomerPayBillOnline',
                    Amount: process.env.MPESA_ENVIRONMENT === 'sandbox' ? 1 : Math.max(1, Math.round(amount)),
                    PartyA: formattedPhone,
                    PartyB: shortCode,
                    PhoneNumber: formattedPhone,
                    CallBackURL: process.env.NEXT_PUBLIC_MPESA_CALLBACK_URL,
                    AccountReference: String(order_id).slice(0, 12),
                    TransactionDesc: `Payment for order`,
                }),
                cache: 'no-store'
            }
        );

        let stkData;
        const rawRes = await stkPushResponse.text();

        try {
            stkData = JSON.parse(rawRes);
        } catch (e) {
            console.error(`Safaricom Non-JSON Response (Status ${stkPushResponse.status}): ${rawRes}`);
            throw new Error(`Safaricom Error ${stkPushResponse.status}: ${rawRes.substring(0, 100)}`);
        }

        console.log('STK Response:', JSON.stringify(stkData));

        if (stkData.ResponseCode !== '0') {
            console.error(`STK Rejected: ${stkData.ResponseDescription}`);
            return NextResponse.json(
                { error: stkData.ResponseDescription || 'STK Push rejected by provider' },
                { status: 400 }
            );
        }

        // Update order with checkout request ID
        console.log(`Syncing CheckoutID ${stkData.CheckoutRequestID} to Supabase...`);
        const { error: dbError } = await supabaseAdmin
            .from('orders')
            .update({ mpesa_checkout_id: stkData.CheckoutRequestID })
            .eq('id', order_id);

        if (dbError) {
            console.warn(`Supabase Update Failed for Order ${order_id}:`, dbError.message);
            // We don't fail the request here because STK was already sent
        }

        console.log('--- M-Pesa STK Push Success ---');
        return NextResponse.json({
            success: true,
            checkoutRequestId: stkData.CheckoutRequestID,
            customerMessage: 'Please enter your M-Pesa PIN on your phone'
        });

    } catch (error: any) {
        console.error('CRITICAL M-PESA ERROR:', error.message);
        return NextResponse.json(
            { error: error.message || 'M-Pesa processing failed internally' },
            { status: 500 }
        );
    }
}
