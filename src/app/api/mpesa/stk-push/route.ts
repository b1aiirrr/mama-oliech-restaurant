import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Validate environment variables first
        const requiredEnv = [
            'MPESA_CONSUMER_KEY',
            'MPESA_CONSUMER_SECRET',
            'MPESA_BUSINESS_SHORT_CODE',
            'MPESA_PASSKEY',
            'NEXT_PUBLIC_MPESA_CALLBACK_URL'
        ];

        for (const env of requiredEnv) {
            if (!process.env[env]) {
                throw new Error(`Missing environment variable: ${env}`);
            }
        }

        const { phone_number, amount, order_id } = await request.json();

        // Validate inputs
        if (!phone_number || !amount || !order_id) {
            return NextResponse.json(
                { error: 'Missing required order fields' },
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
                cache: 'no-store'
            }
        );

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new Error(`Daraja Auth Error (${tokenResponse.status}): ${errorText}`);
        }

        const tokenData = await tokenResponse.json();
        const access_token = tokenData.access_token;

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
                    CallBackURL: process.env.NEXT_PUBLIC_MPESA_CALLBACK_URL,
                    AccountReference: order_id,
                    TransactionDesc: `Payment for order ${order_id}`,
                }),
                cache: 'no-store'
            }
        );

        let stkData;
        try {
            stkData = await stkPushResponse.json();
        } catch (e) {
            const errorText = await stkPushResponse.text();
            throw new Error(`Safaricom API Error (${stkPushResponse.status}): ${errorText || 'Invalid JSON response'}`);
        }

        if (stkData.ResponseCode !== '0') {
            return NextResponse.json(
                { error: stkData.ResponseDescription || 'STK Push failed' },
                { status: 400 }
            );
        }

        // Update order with checkout request ID
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
