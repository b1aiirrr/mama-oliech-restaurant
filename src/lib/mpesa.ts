export async function getMpesaAccessToken() {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    
    const env = process.env.MPESA_ENVIRONMENT || 'sandbox';
    const baseUrl = env === 'live' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
    const tokenUrl = `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`;

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
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`MPESA TOKEN FAILED (Status: ${response.status}): ${errorText}`);
                throw new Error(`M-Pesa API Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            return data.access_token;

        } catch (error: any) {
            attempts++;
            console.warn(`[RETRY ${attempts}/${maxAttempts}] Token request failed: ${error.message}`);
            if (attempts >= maxAttempts) throw error;
            await new Promise(r => setTimeout(r, initialBackoff * Math.pow(2, attempts - 1)));
        }
    }
}
