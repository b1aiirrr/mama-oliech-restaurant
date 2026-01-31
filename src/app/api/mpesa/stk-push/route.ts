import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function getMpesaAccessToken() {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const tokenUrl = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    if (!consumerKey || !consumerSecret) {
        console.error('M-Pesa Consumer Key or Secret not found.');
        throw new Error('M-Pesa configuration error: Key or Secret missing.');
    }

    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    let attempts = 0;
    const maxAttempts = 3;
    const initialBackoff = 1000;

    while (attempts < maxAttempts) {
        try {
            console.log(`[ATTEMPT ${attempts + 1}] Requesting M-Pesa token...`);
            const response = await fetch(tokenUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Accept': 'application/json'
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                const errorText = await response.text();
                // CRITICAL: Log exact status and body for debugging
                console.error(`MPESA TOKEN FAILED (Status: ${response.status}): ${errorText}`);

                // Return exact raw error to help the user diagnose portal status
                throw new Error(`M-Pesa API Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('M-Pesa access token obtained successfully.');
            return data.access_token;

        } catch (error: any) {
            attempts++;
            console.warn(`[RETRY ${attempts}/${maxAttempts}] Token request failed: ${error.message}`);
            if (attempts >= maxAttempts) throw error;
            await new Promise(r => setTimeout(r, initialBackoff * Math.pow(2, attempts - 1)));
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('--- M-Pesa STK Push Start ---');

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
            `${process.env.MPESA_BUSINESS_SHORT_CODE}${process.env.MPESA_PASSKEY}${timestamp}`
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
                    'Accept': 'application/json'
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
                    CallBackURL: process.env.NEXT_PUBLIC_MPESA_CALLBACK_URL,
                    AccountReference: order_id,
                    TransactionDesc: `Mama Oliech Order ${order_id}`,
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
