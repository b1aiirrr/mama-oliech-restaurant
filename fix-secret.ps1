# Fix newline in Vercel Secret
$secret = "EDLOIhFGdnWQXtciMt1dGoBY0hGydI62dZ6gKbSDpkmxijGiVaDveG8ueBG50GY1"
[System.IO.File]::WriteAllText("secret.txt", $secret)

Write-Host "Re-adding secret without newlines..."
cmd /c "npx vercel env add MPESA_CONSUMER_SECRET production --yes --force < secret.txt"

Write-Host "Done setting secret. Now redeploying..."
cmd /c "npx vercel --prod --yes"
