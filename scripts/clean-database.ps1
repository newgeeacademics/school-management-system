# Empty the Classroom database(s).
# - Local dev: stops the backend on port 8080 (clears in-memory H2).
# - Neon/production: TRUNCATE all public tables via psql + DATABASE_URL from backend/.env
#
# Usage:
#   .\scripts\clean-database.ps1              # local + Neon (prompts for confirmation)
#   .\scripts\clean-database.ps1 -Force       # skip confirmation
#   .\scripts\clean-database.ps1 -LocalOnly   # only stop local backend (H2)
#   .\scripts\clean-database.ps1 -NeonOnly    # only truncate Neon
#   .\scripts\clean-database.ps1 -RestartBackend   # after clean, start backend (no demo seed)
#
# Requires: psql on PATH for Neon cleanup (https://www.postgresql.org/download/windows/)
param(
    [switch]$Force,
    [switch]$LocalOnly,
    [switch]$NeonOnly,
    [switch]$RestartBackend
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path $PSScriptRoot -Parent
$BackendDir = Join-Path $RepoRoot "backend"
$SqlFile = Join-Path $PSScriptRoot "clean-database.sql"
$EnvFile = Join-Path $BackendDir ".env"

function Stop-LocalBackend {
    $lines = netstat -ano 2>$null | Select-String ":8080\s"
    if (-not $lines) {
        Write-Host "Local: no process listening on port 8080 (H2 memory already cleared)."
        return
    }

    $pids = $lines | ForEach-Object {
        if ($_ -match '\s+(\d+)\s*$') { [int]$Matches[1] }
    } | Sort-Object -Unique

    foreach ($procId in $pids) {
        try {
            Stop-Process -Id $procId -Force -ErrorAction Stop
            Write-Host "Local: stopped process $procId on port 8080 (in-memory H2 cleared)."
        } catch {
            Write-Warning "Local: could not stop PID $procId — $_"
        }
    }
}

function Read-DatabaseUrl {
    if (-not (Test-Path $EnvFile)) {
        return $null
    }
    foreach ($line in Get-Content $EnvFile) {
        if ($line -match '^\s*DATABASE_URL\s*=\s*(.+)\s*$') {
            return $Matches[1].Trim().Trim('"').Trim("'")
        }
    }
    return $null
}

function Invoke-NeonTruncate {
    $databaseUrl = Read-DatabaseUrl
    if (-not $databaseUrl) {
        Write-Warning @"
Neon: backend/.env not found or DATABASE_URL missing.
Copy backend/.env.example to backend/.env and set your Neon connection string.
Or run scripts/clean-database.sql in the Neon SQL editor.
"@
        return $false
    }

    if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
        Write-Warning @"
Neon: 'psql' not found on PATH.
Install PostgreSQL client tools, or paste scripts/clean-database.sql into Neon Console → SQL Editor.
Connection string is in backend/.env (DATABASE_URL).
"@
        return $false
    }

    if (-not (Test-Path $SqlFile)) {
        throw "Missing SQL file: $SqlFile"
    }

    Write-Host "Neon: truncating all public tables..."
    & psql $databaseUrl -v ON_ERROR_STOP=1 -f $SqlFile
    if ($LASTEXITCODE -ne 0) {
        throw "Neon: psql failed with exit code $LASTEXITCODE"
    }

    $count = & psql $databaseUrl -t -A -c "SELECT COALESCE(SUM(n_live_tup), 0)::bigint FROM pg_stat_user_tables WHERE schemaname = 'public';"
    Write-Host "Neon: done. Approximate total rows in public schema: $($count.Trim())"
    return $true
}

function Start-LocalBackend {
    $mvnw = Join-Path $BackendDir "mvnw.cmd"
    if (-not (Test-Path $mvnw)) {
        Write-Warning "Cannot restart: $mvnw not found."
        return
    }
    Write-Host "Starting backend (APP_SEED_ENABLED=false, empty H2)..."
    $env:APP_SEED_ENABLED = "false"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "mvnw.cmd spring-boot:run" -WorkingDirectory $BackendDir
    Write-Host "Backend starting in a new window on http://localhost:8080"
}

$doLocal = -not $NeonOnly
$doNeon = -not $LocalOnly

if (-not $Force) {
    $target = if ($LocalOnly) { "local H2 (stop backend on :8080)" }
              elseif ($NeonOnly) { "Neon PostgreSQL (TRUNCATE all tables)" }
              else { "local H2 AND Neon PostgreSQL" }
    $answer = Read-Host "This will EMPTY $target. Type YES to continue"
    if ($answer -ne "YES") {
        Write-Host "Cancelled."
        exit 0
    }
}

if ($doLocal) { Stop-LocalBackend }
if ($doNeon) { Invoke-NeonTruncate | Out-Null }

if ($RestartBackend -and $doLocal) {
    Start-LocalBackend
}

Write-Host ""
Write-Host "Clean complete. Demo seeding is OFF unless APP_SEED_ENABLED=true."
Write-Host "Register a new school from the app to start fresh."
