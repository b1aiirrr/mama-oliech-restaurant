const { execSync } = require('child_process');

const vars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'MPESA_CONSUMER_KEY',
    'MPESA_CONSUMER_SECRET',
    'MPESA_BUSINESS_SHORT_CODE',
    'MPESA_PASSKEY',
    'MPESA_ENVIRONMENT',
    'NEXT_PUBLIC_MPESA_CALLBACK_URL',
    'NEXT_PUBLIC_ADMIN_PIN',
    'ADMIN_PIN',
    'TESTSPRITE_API_KEY'
];

const values = {
    'NEXT_PUBLIC_SUPABASE_URL': 'https://lebdscpvzuebmpbmexed.supabase.co',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlYmRzY3B2enVlYm1wYm1leGVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODM4MTYsImV4cCI6MjA4NTQ1OTgxNn0.vCv99l5_JOEk3yQPI0TFbKAc2Y3vjSA7gbgUKqD3B-4',
    'SUPABASE_SERVICE_ROLE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlYmRzY3B2enVlYm1wYm1leGVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg4MzgxNiwiZXhwIjoyMDg1NDU5ODE2fQ.VISEKud29M_P7Uq2_dNBU_qCZGA8lIZIAgIIoZRnRno',
    'MPESA_CONSUMER_KEY': 'GSpwoW2wAXTl8mA2JunVrmPYiuVAVBJL0iPGz5DPmyBxWch2',
    'MPESA_CONSUMER_SECRET': 'EDLOlhFGdnWQXtciMtIdGoBY0hGydl62dZGgKbSDpkmxjiGiVaDveG8ueBG50GY1',
    'MPESA_BUSINESS_SHORT_CODE': '174379',
    'MPESA_PASSKEY': 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
    'MPESA_ENVIRONMENT': 'sandbox',
    'NEXT_PUBLIC_MPESA_CALLBACK_URL': 'https://mama-oliech-restaurant.vercel.app/api/mpesa/callback',
    'NEXT_PUBLIC_ADMIN_PIN': '2026',
    'ADMIN_PIN': '2026',
    'TESTSPRITE_API_KEY': 'sk-user-dH8fQEmfqBRXY5LsPDgY3S0rKoYo_6WdQA0JalZXLKg3EOPXFDK75YmtNYOP0lVU7wJ0kSmeZa7boU4W81Zo4_KuNocwJV5_QRIyb-wDvEQE8D5aNagOyHOHpUhGIdcewxk'
};

const { spawnSync } = require('child_process');

for (const key of vars) {
    console.log(`Setting ${key}...`);
    try {
        const cmd = process.platform === 'win32' ? 'vercel.cmd' : 'vercel';
        const result = spawnSync(cmd, ['env', 'add', key, 'production', '--force'], {
            input: values[key],
            encoding: 'utf-8'
        });
        if (result.error) throw result.error;
        console.log(result.stdout);
    } catch (e) {
        console.error(`Failed to set ${key}: ${e.message}`);
    }
}
