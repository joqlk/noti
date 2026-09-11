# Deploy Noti to Vercel with Turso database
# Prerequisites: vercel login, turso auth login

$ErrorActionPreference = "Stop"

Write-Host "Checking Vercel auth..."
npx vercel whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host "Run: npx vercel login"
    exit 1
}

if (-not $env:TURSO_DATABASE_URL -or -not $env:TURSO_AUTH_TOKEN) {
    Write-Host @"

Turso credentials required for production (Vercel cannot use local SQLite).

1. Install Turso CLI: irm get.turso.tech/install.ps1 | iex
2. turso auth login
3. turso db create noti-app
4. turso db show noti-app --url
5. turso db tokens create noti-app
6. Apply schema:
   Get-Content prisma/migrations/20260911080150_init/migration.sql | turso db shell noti-app

Then set env vars on Vercel:
  npx vercel env add TURSO_DATABASE_URL
  npx vercel env add TURSO_AUTH_TOKEN

"@
    exit 1
}

Write-Host "Deploying to Vercel..."
npx vercel deploy --prod --yes

Write-Host "Done. Your app URL will appear above."
