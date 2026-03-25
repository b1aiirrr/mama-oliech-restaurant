# Simple Manual Fix Script
# Run these commands one by one

Write-Host "🔧 Manual Fix for Vercel Environment Variables" -ForegroundColor Cyan
Write-Host ""
Write-Host "The issue: All your Vercel env vars have \\r\\n characters appended" -ForegroundColor Yellow
Write-Host "This breaks the SUPABASE_SERVICE_ROLE_KEY authentication" -ForegroundColor Yellow
Write-Host ""
Write-Host "Follow these steps:" -ForegroundColor Cyan
Write-Host ""

$serviceroleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlYmRzY3B2enVlYm1wYm1leGVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg4MzgxNiwiZXhwIjoyMDg1NDU5ODE2fQ.VISEKud29M_P7Uq2_dNBU_qCZGA8lIZIAgIIoZRnRno"

Write-Host "1️⃣ Remove the corrupted SUPABASE_SERVICE_ROLE_KEY:" -ForegroundColor Yellow
Write-Host "   vercel env rm SUPABASE_SERVICE_ROLE_KEY production --yes" -ForegroundColor Green
Write-Host ""

Write-Host "2️⃣ Add it back with the clean value:" -ForegroundColor Yellow
Write-Host "   Run this command and paste the value when prompted:" -ForegroundColor White
Write-Host "   vercel env add SUPABASE_SERVICE_ROLE_KEY production" -ForegroundColor Green
Write-Host ""
Write-Host "   Paste this value:" -ForegroundColor White  
Write-Host "   $serviceroleKey" -ForegroundColor Cyan
Write-Host ""

Write-Host "3️⃣ Repeat for preview and development:" -ForegroundColor Yellow
Write-Host "   vercel env rm SUPABASE_SERVICE_ROLE_KEY preview --yes" -ForegroundColor Green
Write-Host "   vercel env add SUPABASE_SERVICE_ROLE_KEY preview" -ForegroundColor Green
Write-Host "   (paste the same value)" -ForegroundColor White
Write-Host ""
Write-Host "   vercel env rm SUPABASE_SERVICE_ROLE_KEY development --yes" -ForegroundColor Green
Write-Host "   vercel env add SUPABASE_SERVICE_ROLE_KEY development" -ForegroundColor Green
Write-Host "   (paste the same value)" -ForegroundColor White
Write-Host ""

Write-Host "4️⃣ Redeploy your site:" -ForegroundColor Yellow
Write-Host "   Go to Vercel Dashboard → Deployments → Redeploy (no cache)" -ForegroundColor Green
Write-Host ""

Write-Host "Press any key to start the automated fix..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Automated fix
Write-Host ""
Write-Host "🤖 Starting automated fix..." -ForegroundColor Cyan

Write-Host "Removing SUPABASE_SERVICE_ROLE_KEY from production..." -ForegroundColor Yellow
vercel env rm SUPABASE_SERVICE_ROLE_KEY production --yes

Write-Host "Adding clean value to production..." -ForegroundColor Yellow
$serviceroleKey | vercel env add SUPABASE_SERVICE_ROLE_KEY production

Write-Host "Removing from preview..." -ForegroundColor Yellow
vercel env rm SUPABASE_SERVICE_ROLE_KEY preview --yes

Write-Host "Adding clean value to preview..." -ForegroundColor Yellow
$serviceroleKey | vercel env add SUPABASE_SERVICE_ROLE_KEY preview

Write-Host "Removing from development..." -ForegroundColor Yellow
vercel env rm SUPABASE_SERVICE_ROLE_KEY development --yes

Write-Host "Adding clean value to development..." -ForegroundColor Yellow
$serviceroleKey | vercel env add SUPABASE_SERVICE_ROLE_KEY development

Write-Host ""
Write-Host "✅ Done! Now redeploy your site on Vercel" -ForegroundColor Green
