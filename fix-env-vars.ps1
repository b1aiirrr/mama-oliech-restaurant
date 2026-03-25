# Fix Vercel Environment Variables Script  
# This script removes the corrupted \r\n characters from all environment variables

Write-Host "🔧 Fixing Corrupted Vercel Environment Variables" -ForegroundColor Cyan
Write-Host ""

# Read the .env.local file (the correct one)
$envContent = Get-Content ".env.local"

# Parse environment variables
$envVars = @{}

foreach ($line in $envContent) {
    # Skip comments and empty lines
    if ($line -match '^\s*#' -or $line -match '^\s*$') {
        continue
    }
    
    # Match KEY=VALUE pattern
    if ($line -match '^([A-Z_0-9]+)=(.+)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}


Write-Host "📋 Found $($envVars.Count) variables in .env.local" -ForegroundColor Green  
Write-Host ""

# Critical variables that MUST be in production
$criticalVars = @(
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_ADMIN_PIN'
)

Write-Host "🎯 Removing and re-adding critical variables to Vercel..." -ForegroundColor Yellow
Write-Host ""

foreach ($varName in $criticalVars) {
    if ($envVars.ContainsKey($varName)) {
        $value = $envVars[$varName]
        
        Write-Host "Processing: $varName" -ForegroundColor Cyan
        
        # Remove from all environments
        Write-Host "  ├─ Removing from Production..." -ForegroundColor Gray
        vercel env rm $varName production --yes 2>$null | Out-Null
        
        Write-Host "  ├─ Removing from Preview..." -ForegroundColor Gray
        vercel env rm $varName preview --yes 2>$null | Out-Null
        
        Write-Host "  ├─ Removing from Development..." -ForegroundColor Gray
        vercel env rm $varName development --yes 2>$null | Out-Null
        
        # Add clean value to all environments
        Write-Host "  ├─ Adding clean value to Production..." -ForegroundColor Green
        echo $value | vercel env add $varName production 2>&1 | Out-Null
        
        Write-Host "  ├─ Adding clean value to Preview..." -ForegroundColor Green
        echo $value | vercel env add $varName preview 2>&1 | Out-Null
        
        Write-Host "  └─ Adding clean value to Development..." -ForegroundColor Green  
        echo $value | vercel env add $varName development 2>&1 | Out-Null
        
        Write-Host "  ✅ $varName fixed!" -ForegroundColor Green
        Write-Host ""
    }
    else {
        Write-Host "⚠️  $varName not found in .env.local" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✨ All critical variables have been cleaned and re-uploaded!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to Vercel Dashboard" -ForegroundColor White
Write-Host "2. Trigger a NEW deployment (redeploy)" -ForegroundColor White
Write-Host "3. Test the menu import again" -ForegroundColor White
Write-Host ""
