# Sync monorepo apps (it branch) to per-app Git branches for Vercel deploy.
$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$WtRoot = Join-Path $env:TEMP "newgee-branch-sync"

function Copy-AppFiles {
    param([string]$Source, [string]$Dest, [string[]]$Files)
    foreach ($f in $Files) {
        $src = Join-Path $Source $f
        if (-not (Test-Path $src)) { continue }
        $dst = Join-Path $Dest $f
        if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }
        Copy-Item $src $dst -Recurse -Force
    }
}

function Remove-Clutter {
    param([string]$Dir)
    @("admin-app", "user-portal-app", "finance-app", "backend", "classroom-app", "render.yaml", "DEPLOYMENT.md", "scripts", "dist", "node_modules") | ForEach-Object {
        $p = Join-Path $Dir $_
        if (Test-Path $p) { Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue }
    }
}

$AppFiles = @(
    "src", "public", "index.html", "package.json", "package-lock.json",
    "vite.config.ts", "tsconfig.json", "postcss.config.cjs", "tailwind.config.cjs",
    "components.json", ".env.example", "vercel.json"
)

if (Test-Path $WtRoot) { Remove-Item $WtRoot -Recurse -Force }
New-Item -ItemType Directory -Path $WtRoot | Out-Null

Push-Location $RepoRoot

# --- main ---
git worktree add (Join-Path $WtRoot "main") main
Copy-AppFiles -Source $RepoRoot -Dest (Join-Path $WtRoot "main") -Files $AppFiles
Copy-Item (Join-Path $RepoRoot ".gitignore") (Join-Path $WtRoot "main\.gitignore") -Force
Copy-Item (Join-Path $RepoRoot "VERCEL.md") (Join-Path $WtRoot "main\VERCEL.md") -Force -ErrorAction SilentlyContinue
Remove-Clutter (Join-Path $WtRoot "main")
Push-Location (Join-Path $WtRoot "main")
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -m "Sync main marketing app from monorepo (it branch)"
    git push origin main
} else { Write-Host "main: no changes" }
Pop-Location

# --- admin ---
git worktree add (Join-Path $WtRoot "admin") admin
Copy-AppFiles -Source (Join-Path $RepoRoot "admin-app") -Dest (Join-Path $WtRoot "admin") -Files $AppFiles
Copy-Item (Join-Path $RepoRoot ".gitignore") (Join-Path $WtRoot "admin\.gitignore") -Force
Remove-Clutter (Join-Path $WtRoot "admin")
Push-Location (Join-Path $WtRoot "admin")
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -m "Sync admin app from monorepo (it branch)"
    git push origin admin
} else { Write-Host "admin: no changes" }
Pop-Location

# --- user-portal ---
git worktree add (Join-Path $WtRoot "user-portal") user-portal
$PortalFiles = @(
    "src", "public", "index.html", "package.json", "package-lock.json",
    "vite.config.ts", "tsconfig.json", ".env.example", "vercel.json"
)
Copy-AppFiles -Source (Join-Path $RepoRoot "user-portal-app") -Dest (Join-Path $WtRoot "user-portal") -Files $PortalFiles
Copy-Item (Join-Path $RepoRoot ".gitignore") (Join-Path $WtRoot "user-portal\.gitignore") -Force
Remove-Clutter (Join-Path $WtRoot "user-portal")
Push-Location (Join-Path $WtRoot "user-portal")
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -m "Sync user portal app from monorepo (it branch)"
    git push origin user-portal
} else { Write-Host "user-portal: no changes" }
Pop-Location

# --- finance ---
git worktree add (Join-Path $WtRoot "finance") finance
Copy-AppFiles -Source (Join-Path $RepoRoot "finance-app") -Dest (Join-Path $WtRoot "finance") -Files $AppFiles
Copy-Item (Join-Path $RepoRoot ".gitignore") (Join-Path $WtRoot "finance\.gitignore") -Force
Remove-Clutter (Join-Path $WtRoot "finance")
Push-Location (Join-Path $WtRoot "finance")
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -m "Sync finance app from monorepo (it branch)"
    git push origin finance
} else { Write-Host "finance: no changes" }
Pop-Location

# cleanup worktrees
git worktree remove (Join-Path $WtRoot "main") --force
git worktree remove (Join-Path $WtRoot "admin") --force
git worktree remove (Join-Path $WtRoot "user-portal") --force
git worktree remove (Join-Path $WtRoot "finance") --force
Remove-Item $WtRoot -Recurse -Force -ErrorAction SilentlyContinue

Pop-Location
Write-Host "Branch sync complete."
