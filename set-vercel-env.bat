@echo off
echo Setting Supabase environment variables on Vercel...

echo NEXT_PUBLIC_SUPABASE_URL=https://lebdscpvzuebmpbmexed.supabase.co > temp_url.txt
vercel env add NEXT_PUBLIC_SUPABASE_URL production < temp_url.txt --force

echo NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlYmRzY3B2enVlYm1wYm1leGVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODM4MTYsImV4cCI6MjA4NTQ1OTgxNn0.vCv99l5_JOEk3yQPI0TFbKAc2Y3vjSA7gbgUKqD3B-4 > temp_anon.txt
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production < temp_anon.txt --force

echo SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlYmRzY3B2enVlYm1wYm1leGVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg4MzgxNiwiZXhwIjoyMDg1NDU5ODE2fQ.VISEKud29M_P7Uq2_dNBU_qCZGA8lIZIAgIIoZRnRno > temp_service.txt
vercel env add SUPABASE_SERVICE_ROLE_KEY production < temp_service.txt --force

del temp_url.txt
del temp_anon.txt
del temp_service.txt

echo Done! Now redeploying...
vercel --prod --yes
