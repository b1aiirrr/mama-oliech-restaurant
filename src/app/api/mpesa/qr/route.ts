import { NextResponse } from 'next/server';
import { getMpesaAccessToken } from '@/lib/mpesa';

export async function POST(req: Request) {
    try {
        const { order_id, amount } = await req.json();

        if (!order_id || !amount) {
            return NextResponse.json({ error: 'Missing order_id or amount' }, { status: 400 });
        }

        const access_token = await getMpesaAccessToken();
        const shortCode = process.env.MPESA_BUSINESS_SHORT_CODE;
        
        // Use either live or sandbox
        const env = process.env.MPESA_ENVIRONMENT || 'sandbox';
        const baseUrl = env === 'live' 
            ? 'https://api.safaricom.co.ke' 
            : 'https://sandbox.safaricom.co.ke';

        const qrEndpoint = `${baseUrl}/mpesa/qrcode/v1/generate`;

        // Truncate order_id for the RefNo (max usually ~20 chars)
        const refNo = String(order_id).substring(0, 12);

        const payload = {
            MerchantName: 'Mama Oliech Restaurant',
            RefNo: refNo,
            Amount: Math.max(1, Math.round(amount)),
            TrxCode: 'PB', // Paybill
            CPI: shortCode,
            Size: '300'
        };

        const qrRes = await fetch(qrEndpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify(payload)
        });

        const raw = await qrRes.text();

        if (!qrRes.ok) {
            console.error(`QR Generation Error: ${raw}`);
            return NextResponse.json({ error: 'Failed to generate QR Code' }, { status: qrRes.status });
        }

        const data = JSON.parse(raw);
        
        if (data.ResponseCode !== '00' && data.ResponseCode !== '0') {
            // Daraja QR typically returns non-0 if failed
            if (!data.QRCode) {
                return NextResponse.json({ error: data.ResponseDescription || 'Failed to generate QR' }, { status: 400 });
            }
        }

        return NextResponse.json({ qrCode: data.QRCode });

    } catch (error: any) {
        console.error("QR Fetch Exception:", error);
        return NextResponse.json({ error: 'Internal server error while fetching QR' }, { status: 500 });
    }
}
