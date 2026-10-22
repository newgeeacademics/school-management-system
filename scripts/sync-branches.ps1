# Sync monorepo apps to per-app Git branches for Vercel deploy.
# Root src/ (replaces deleted classroom-app/ folder): deploy branch `classroom-app`.
# Develop in the monorepo, then run this script to publish root src/ to `classroom-app`.
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
    @("admin-app", "user-portal-app", "finance-app", "tracking-app", "backend", "render.yaml", "DEPLOYMENT.md", "scripts", "dist", "node_modules") | ForEach-Object {
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

# --- classroom-app (root src/: landing, registration, /login, /dashboard) ---
if (git show-ref --verify --quiet refs/heads/classroom-app) {
    git worktree add (Join-Path $WtRoot "classroom-app") classroom-app
} else {
    git branch classroom-app main
    git worktree add (Join-Path $WtRoot "classroom-app") classroom-app
}
Copy-AppFiles -Source $RepoRoot -Dest (Join-Path $WtRoot "classroom-app") -Files $AppFiles
Copy-Item (Join-Path $RepoRoot ".gitignore") (Join-Path $WtRoot "classroom-app\.gitignore") -Force
Copy-Item (Join-Path $RepoRoot "VERCEL.md") (Join-Path $WtRoot "classroom-app\VERCEL.md") -Force -ErrorAction SilentlyContinue
Remove-Clutter (Join-Path $WtRoot "classroom-app")
Push-Location (Join-Path $WtRoot "classroom-app")
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -m "Sync classroom-app (root src) from monorepo"
    git push -u origin classroom-app
} else { Write-Host "classroom-app: no changes" }
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

# --- tracking ---
if (git show-ref --verify --quiet refs/heads/tracking) {
    git worktree add (Join-Path $WtRoot "tracking") tracking
} else {
    git branch tracking feature/transport-tracking
    git worktree add (Join-Path $WtRoot "tracking") tracking
}
$TrackingFiles = @(
    "src", "public", "index.html", "package.json", "package-lock.json",
    "vite.config.ts", "tsconfig.json", ".env.example", "vercel.json"
)
Copy-AppFiles -Source (Join-Path $RepoRoot "tracking-app") -Dest (Join-Path $WtRoot "tracking") -Files $TrackingFiles
Copy-Item (Join-Path $RepoRoot ".gitignore") (Join-Path $WtRoot "tracking\.gitignore") -Force
Remove-Clutter (Join-Path $WtRoot "tracking")
Push-Location (Join-Path $WtRoot "tracking")
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -m "Sync tracking app from monorepo (feature/transport-tracking)"
    git push -u origin tracking
} else { Write-Host "tracking: no changes" }
Pop-Location

# --- user-portal-mobile (Flutter app at repo root on branch user-portal-mobile) ---
if (git show-ref --verify --quiet refs/heads/user-portal-mobile) {
    git worktree add (Join-Path $WtRoot "user-portal-mobile") user-portal-mobile
} else {
    git branch user-portal-mobile feature/transport-tracking
    git worktree add (Join-Path $WtRoot "user-portal-mobile") user-portal-mobile
}
$MobileFiles = @(
    "lib", "android", "ios", "windows", "linux", "macos", "web", "test",
    "pubspec.yaml", "pubspec.lock", "analysis_options.yaml", "README.md",
    ".metadata", ".gitignore", "package.json"
)
Copy-AppFiles -Source (Join-Path $RepoRoot "user-portal-mobile") -Dest (Join-Path $WtRoot "user-portal-mobile") -Files $MobileFiles
@("admin-app", "user-portal-app", "finance-app", "tracking-app", "user-portal-mobile", "backend", "src", "render.yaml", "DEPLOYMENT.md", "scripts", "dist", "node_modules", "package-lock.json", "vite.config.ts") | ForEach-Object {
    $p = Join-Path (Join-Path $WtRoot "user-portal-mobile") $_
    if (Test-Path $p) { Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue }
}
Push-Location (Join-Path $WtRoot "user-portal-mobile")
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -m "Sync user portal mobile app from monorepo"
    git push -u origin user-portal-mobile
} else { Write-Host "user-portal-mobile: no changes" }
Pop-Location

# cleanup worktrees
git worktree remove (Join-Path $WtRoot "classroom-app") --force
git worktree remove (Join-Path $WtRoot "admin") --force
git worktree remove (Join-Path $WtRoot "user-portal") --force
git worktree remove (Join-Path $WtRoot "finance") --force
git worktree remove (Join-Path $WtRoot "tracking") --force
git worktree remove (Join-Path $WtRoot "user-portal-mobile") --force
Remove-Item $WtRoot -Recurse -Force -ErrorAction SilentlyContinue

Pop-Location
Write-Host "Branch sync complete."
