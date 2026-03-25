import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const data = await req.json();
        console.log("C2B Validation Request:", JSON.stringify(data));
        
        // Return 0 to tell Safaricom to complete the transaction
        return NextResponse.json({
            ResultCode: 0,
            ResultDesc: "Accepted"
        });
    } catch (error) {
        return NextResponse.json({
            ResultCode: 0,
            ResultDesc: "Accepted"
        });
    }
}
