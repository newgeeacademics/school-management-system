# Configure Brevo in backend/.env and send a test email.
# Usage:
#   .\scripts\setup-brevo.ps1
#   .\scripts\setup-brevo.ps1 -ApiKey "xkeysib-..." -To "you@gmail.com"

param(
    [string]$ApiKey = $env:BREVO_API_KEY,
    [string]$From = "",
    [string]$To = "",
    [string]$BaseUrl = "http://localhost:8080",
    [switch]$SkipSend
)

$ErrorActionPreference = "Stop"
$envFile = Join-Path $PSScriptRoot "..\backend\.env" | Resolve-Path -ErrorAction SilentlyContinue
if (-not $envFile) {
    $envFile = Join-Path $PSScriptRoot "..\backend\.env"
}

Write-Host "`n=== Brevo setup ===" -ForegroundColor Cyan
Write-Host "Get an API key: https://app.brevo.com → SMTP & API → API keys → Generate"
Write-Host "Verify sender:  https://app.brevo.com → Senders, domains & dedicated IPs → Senders`n"

if (-not $ApiKey) {
    $ApiKey = Read-Host "Paste BREVO_API_KEY (xkeysib-...)"
}
if (-not $ApiKey.Trim()) {
    Write-Host "No API key provided." -ForegroundColor Red
    exit 1
}

if (-not $From) {
    $From = Read-Host "Sender (APP_EMAIL_FROM) [NewGee <contact@newgeeacademy.com>]"
    if (-not $From.Trim()) { $From = "NewGee <contact@newgeeacademy.com>" }
}

if (-not (Test-Path $envFile)) {
    Copy-Item (Join-Path $PSScriptRoot "..\backend\.env.example") $envFile
}

$content = Get-Content $envFile -Raw
function Set-EnvLine {
    param([string]$Key, [string]$Value)
    $script:content = $script:content -replace "(?m)^$Key=.*$", "$Key=$Value"
    if ($script:content -notmatch "(?m)^$Key=") {
        $script:content = $script:content.TrimEnd() + "`n$Key=$Value`n"
    }
}

Set-EnvLine "APP_EMAIL_ENABLED" "true"
Set-EnvLine "APP_EMAIL_PROVIDER" "brevo"
Set-EnvLine "BREVO_API_KEY" $ApiKey.Trim()
Set-EnvLine "APP_EMAIL_FROM" $From.Trim()
Set-Content $envFile $content.TrimEnd() -Encoding UTF8
Write-Host "Updated $envFile" -ForegroundColor Green

# Health check
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -TimeoutSec 5
    if ($health.emailConfigured -eq $true) {
        Write-Host "Backend reports emailConfigured=true" -ForegroundColor Green
    } else {
        Write-Host "Backend running but emailConfigured=false — restart the backend after saving .env" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Backend not reachable at $BaseUrl — start it, then re-run with -SkipSend or test manually:" -ForegroundColor Yellow
    Write-Host "  cd backend; .\mvnw.cmd spring-boot:run" -ForegroundColor Gray
    if ($SkipSend) { exit 0 }
}

if ($SkipSend) { exit 0 }

if (-not $To) {
    $To = Read-Host "Send test email to"
}
if (-not $To.Trim()) {
    Write-Host "No recipient — skipping send test." -ForegroundColor Yellow
    exit 0
}

# Login as seeded admin (default profile + seed)
$loginBody = @{ email = "admin@classroom.com"; password = "admin123" } | ConvertTo-Json -Compress
try {
    $login = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -TimeoutSec 10
} catch {
    Write-Host "Admin login failed — use production credentials or start backend with APP_SEED_ENABLED=true" -ForegroundColor Yellow
    exit 1
}

$sendBody = @{
    to = $To.Trim()
    subject = "CLASS Brevo test"
    text = "If you receive this, Brevo is configured correctly."
} | ConvertTo-Json -Compress

try {
    Invoke-RestMethod -Uri "$BaseUrl/api/admin/email/send" -Method POST `
        -Headers @{ Authorization = "Bearer $($login.token)" } `
        -ContentType "application/json" -Body $sendBody -TimeoutSec 15 | Out-Null
    Write-Host "Test email sent to $To" -ForegroundColor Green
} catch {
    Write-Host "Send failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message -ForegroundColor Red }
    Write-Host "Common fixes: verify APP_EMAIL_FROM in Brevo Senders; check API key permissions." -ForegroundColor Yellow
    exit 1
}
