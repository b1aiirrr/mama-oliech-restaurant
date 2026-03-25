# Vercel Environment Variables Check Script
# This script checks if your Vercel environment variables are set correctly

Write-Host "🔍 Checking Vercel Environment Variables..." -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "Checking if Vercel CLI is installed..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To install, run:" -ForegroundColor Yellow
    Write-Host "npm install -g vercel" -ForegroundColor Green
    Write-Host ""
    Write-Host "After installation, run:" -ForegroundColor Yellow
    Write-Host "vercel login" -ForegroundColor Green
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Vercel CLI is installed" -ForegroundColor Green
Write-Host ""

# List environment variables
Write-Host "📋 Fetching environment variables from Vercel..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Command to check production environment variables:" -ForegroundColor Yellow
Write-Host "vercel env ls production" -ForegroundColor Green
Write-Host ""

Write-Host "Please run the above command and check if these variables exist:" -ForegroundColor Yellow
Write-Host "  1. NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host "  2. NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "  3. SUPABASE_SERVICE_ROLE_KEY (⚠️ MOST IMPORTANT)" -ForegroundColor Red
Write-Host "  4. NEXT_PUBLIC_ADMIN_PIN" -ForegroundColor White
Write-Host ""

Write-Host "If SUPABASE_SERVICE_ROLE_KEY is missing, add it with:" -ForegroundColor Yellow
Write-Host 'vercel env add SUPABASE_SERVICE_ROLE_KEY production' -ForegroundColor Green
Write-Host ""
Write-Host "When prompted, paste the value from your .env.local file" -ForegroundColor Yellow
