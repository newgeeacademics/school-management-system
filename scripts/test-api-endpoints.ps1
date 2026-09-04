# Tests CLASS backend REST endpoints and reports failures.
# Usage:
#   .\scripts\test-api-endpoints.ps1 -StartServer
#   .\scripts\test-api-endpoints.ps1 -BaseUrl http://localhost:8080

param(
    [string]$BaseUrl = "http://localhost:8080",
    [switch]$StartServer,
    [int]$ServerPort = 8081,
    [string]$AdminEmail = $env:API_TEST_ADMIN_EMAIL,
    [string]$AdminPassword = $env:API_TEST_ADMIN_PASSWORD,
    [string]$TeacherEmail = $env:API_TEST_TEACHER_EMAIL,
    [string]$TeacherPassword = $env:API_TEST_TEACHER_PASSWORD,
    [string]$ParentEmail = $env:API_TEST_PARENT_EMAIL,
    [string]$ParentPassword = $env:API_TEST_PARENT_PASSWORD,
    [string]$StudentEmail = $env:API_TEST_STUDENT_EMAIL,
    [string]$StudentPassword = $env:API_TEST_STUDENT_PASSWORD
)

# Default demo credentials (only exist when APP_SEED_ENABLED=true on empty H2 DB)
if (-not $AdminEmail) { $AdminEmail = "admin@classroom.com" }
if (-not $AdminPassword) { $AdminPassword = "admin123" }
if (-not $TeacherEmail) { $TeacherEmail = "teacher@classroom.com" }
if (-not $TeacherPassword) { $TeacherPassword = "teacher123" }
if (-not $ParentEmail) { $ParentEmail = "parent@classroom.com" }
if (-not $ParentPassword) { $ParentPassword = "parent123" }
if (-not $StudentEmail) { $StudentEmail = "student@classroom.com" }
if (-not $StudentPassword) { $StudentPassword = "student123" }

$ErrorActionPreference = "Continue"
$script:Results = New-Object System.Collections.Generic.List[object]
$script:Ids = @{}

function Add-Result {
    param([string]$Method, [string]$Path, [int]$Status, [string]$Expected, [string]$Role = "admin", [string]$Note = "")
    $allowed = @($Expected -split ',' | ForEach-Object { [int]$_.Trim() })
    $ok = $allowed -contains $Status
    $script:Results.Add([pscustomobject]@{ OK = $ok; Method = $Method; Path = $Path; Status = $Status; Expected = $Expected; Role = $Role; Note = $Note })
}

function Invoke-Api {
    param([string]$Method, [string]$Path, [string]$Token, [string]$Body, [int]$TimeoutSec = 10)
    $uri = "$BaseUrl$Path"
    $headers = @{}
    if ($Token) { $headers.Authorization = "Bearer $Token" }
    try {
        $p = @{ Uri = $uri; Method = $Method; Headers = $headers; UseBasicParsing = $true; TimeoutSec = $TimeoutSec }
        if ($Body) { $p.ContentType = "application/json"; $p.Body = $Body }
        $r = Invoke-WebRequest @p
        return @{ Status = [int]$r.StatusCode; Body = $r.Content }
    } catch {
        $resp = $_.Exception.Response
        if ($resp) {
            $code = [int]$resp.StatusCode
            $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
            return @{ Status = $code; Body = $sr.ReadToEnd() }
        }
        return @{ Status = 0; Body = $_.Exception.Message }
    }
}

function Test-Endpoint {
    param([string]$Method, [string]$Path, [string]$Token, [string]$Expected = "200", [string]$Body, [string]$Role = "admin", [string]$Note = "")
    $r = Invoke-Api -Method $Method -Path $Path -Token $Token -Body $Body
    Add-Result -Method $Method -Path $Path -Status $r.Status -Expected $Expected -Role $Role -Note $Note
    return $r
}

function Login {
    param([string]$Email, [string]$Password)
    $body = (@{ email = $Email; password = $Password } | ConvertTo-Json -Compress)
    $r = Invoke-Api -Method POST -Path "/api/auth/login" -Body $body -TimeoutSec 8
    if ($r.Status -ne 200) { return @{ Token = $null; Status = $r.Status; Body = $r.Body } }
    return @{ Token = ($r.Body | ConvertFrom-Json).token; Status = 200; Body = $r.Body }
}

function Wait-ForSeedUsers {
    param([string]$Email, [string]$Password, [int]$MaxAttempts = 40)
    Write-Host "Waiting for seeded users ($Email)..." -ForegroundColor Gray
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        $r = Login $Email $Password
        if ($r.Token) {
            Write-Host "  Seed ready (attempt $i)." -ForegroundColor Green
            return $r.Token
        }
        $detail = if ($r.Status -gt 0) { "HTTP $($r.Status)" } else { $r.Body }
        Write-Host "  attempt $i/$MaxAttempts - $detail"
        Start-Sleep -Seconds 3
    }
    return $null
}

function First-Id {
    param($Json)
    if ($null -eq $Json) { return $null }
    if ($Json -is [System.Array] -and $Json.Count -gt 0) { return $Json[0].id }
    if ($Json.id) { return $Json.id }
    return $null
}

function Expand-Path {
    param([string]$Path)
    # ponytail: when seed has no row, use placeholder so GET-by-id still hits the API (empty list / not-found)
    $fallbackId = "00000000-0000-0000-0000-000000000001"
    $map = @{
        '{teacherId}' = $script:Ids.teacher; '{classId}' = $script:Ids.class; '{studentId}' = $script:Ids.student
        '{parentId}' = $script:Ids.parent; '{matiereId}' = $script:Ids.matiere; '{courseId}' = $script:Ids.course
        '{roomId}' = $script:Ids.room; '{eventId}' = $script:Ids.event; '{scheduleId}' = $script:Ids.schedule
        '{attendanceId}' = $script:Ids.attendance; '{evaluationId}' = $script:Ids.evaluation; '{gradeId}' = $script:Ids.grade
        '{reminderId}' = $script:Ids.reminder; '{receiptId}' = $script:Ids.receipt; '{canteenId}' = $script:Ids.canteen
        '{transportId}' = $script:Ids.transport; '{schoolId}' = $script:Ids.school; '{userId}' = $script:Ids.user
        '{driverId}' = $script:Ids.driver
    }
    $out = $Path
    foreach ($k in $map.Keys) {
        if ($out -like "*$k*") { $out = $out.Replace($k, $(if ($map[$k]) { $map[$k] } else { $fallbackId })) }
    }
    return $out
}

function Hit {
    param([string]$Method, [string]$Path, [string]$Role = "admin", [string]$Expected = "200", [string]$Body, [string]$Note = "")
    $expanded = Expand-Path $Path
    if (-not $expanded) { Add-Result $Method $Path 0 $Expected $Role "Skipped - no seed id"; return }
    $token = switch ($Role) {
        "teacher" { $script:TeacherToken }
        "parent" { $script:ParentToken }
        "student" { $script:StudentToken }
        "none" { $null }
        default { $script:AdminToken }
    }
    if ($Role -ne "none" -and -not $token) { Add-Result $Method $expanded 0 $Expected $Role "No token"; return }
    Test-Endpoint -Method $Method -Path $expanded -Token $token -Expected $Expected -Body $Body -Role $Role -Note $Note | Out-Null
}

$serverJob = $null
if ($StartServer) {
    $BaseUrl = "http://localhost:$ServerPort"
    Write-Host "Starting backend on $BaseUrl..." -ForegroundColor Cyan
    $backend = (Resolve-Path (Join-Path $PSScriptRoot "..\backend")).Path
    $serverJob = Start-Job -ScriptBlock {
        param($dir, $port)
        Set-Location $dir
        $env:SPRING_PROFILES_ACTIVE = "default"
        $env:APP_SEED_ENABLED = "true"
        Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
        & .\mvnw.cmd -q spring-boot:run "-Dspring-boot.run.arguments=--server.port=$port --spring.profiles.active=default --app.seed.enabled=true" 2>&1 | Out-Null
    } -ArgumentList $backend, $ServerPort
    $ready = $false
    for ($i = 0; $i -lt 120; $i++) {
        Start-Sleep -Seconds 2
        try {
            if ((Invoke-WebRequest -Uri "$BaseUrl/health" -UseBasicParsing -TimeoutSec 3).StatusCode -eq 200) { $ready = $true; break }
        } catch {}
        if ($i % 5 -eq 0) { Write-Host "  still starting... ($([int](($i + 1) * 2))s)" -ForegroundColor DarkGray }
    }
    if (-not $ready) { Write-Host "Backend failed to start." -ForegroundColor Red; exit 1 }
    Write-Host "Backend ready (health OK)." -ForegroundColor Green
}

function Wait-Login {
    param([string]$Email, [string]$Password)
    $r = Login $Email $Password
    return $r.Token
}

Write-Host "`n=== Health & Auth ===" -ForegroundColor Cyan
Hit GET "/health" -Role none
if ($StartServer) {
    $script:AdminToken = Wait-ForSeedUsers -Email $AdminEmail -Password $AdminPassword
} else {
    $script:AdminToken = Wait-Login $AdminEmail $AdminPassword
}
if (-not $script:AdminToken) {
    Write-Host "ERROR: Cannot login as $AdminEmail" -ForegroundColor Red
    Write-Host "  Production Neon DB does not have demo users (admin@classroom.com)." -ForegroundColor Yellow
    Write-Host "  Options:" -ForegroundColor Yellow
    Write-Host "    1. Use -StartServer (starts isolated H2 + seed on port 8081)" -ForegroundColor Yellow
    Write-Host "    2. Pass real credentials: -AdminEmail you@school.com -AdminPassword 'yourpass'" -ForegroundColor Yellow
    if ($serverJob) { Stop-Job $serverJob -ErrorAction SilentlyContinue; Remove-Job $serverJob -Force -ErrorAction SilentlyContinue }
    exit 1
}
Write-Host "Logging in other roles..." -ForegroundColor Gray
$script:TeacherToken = Wait-Login $TeacherEmail $TeacherPassword
$script:ParentToken = Wait-Login $ParentEmail $ParentPassword
$script:StudentToken = Wait-Login $StudentEmail $StudentPassword
Write-Host "Auth OK (admin + $($script:TeacherToken -ne $null) teacher + $($script:ParentToken -ne $null) parent + $($script:StudentToken -ne $null) student)" -ForegroundColor Green
Hit GET "/api/auth/verify-registration-number?number=TEST-001" -Role none -Expected "200,400,404"

if ($script:AdminToken) {
    $lists = @{
        teacher = "/api/teachers"; class = "/api/classes"; student = "/api/students"; parent = "/api/parents"
        matiere = "/api/matieres"; course = "/api/courses"; room = "/api/rooms"; event = "/api/calendar"
        schedule = "/api/schedule"; attendance = "/api/attendance"; evaluation = "/api/grades/evaluations"
        grade = "/api/grades"; reminder = "/api/payments/reminders"; receipt = "/api/payments/receipts"
        canteen = "/api/canteen"; transport = "/api/transport"; school = "/api/schools"; user = "/api/users"
        driver = "/api/drivers"
    }
    foreach ($key in $lists.Keys) {
        $r = Test-Endpoint GET $lists[$key] $script:AdminToken
        $script:Ids[$key] = First-Id ($r.Body | ConvertFrom-Json -ErrorAction SilentlyContinue)
    }
}

Write-Host "`n=== Core admin GET endpoints ===" -ForegroundColor Cyan
@(
    "GET|/api/overview|admin|200"
    "GET|/api/teachers|admin|200"
    "GET|/api/teachers/{teacherId}|admin|200"
    "GET|/api/teachers/{teacherId}/id-card|admin|200,404"
    "GET|/api/classes|admin|200"
    "GET|/api/classes/{classId}|admin|200"
    "GET|/api/students|admin|200"
    "GET|/api/students/{studentId}|admin|200"
    "GET|/api/students/class/{classId}|admin|200"
    "GET|/api/students/{studentId}/id-card|admin|200,404"
    "GET|/api/parents|admin|200"
    "GET|/api/parents/student/{studentId}|admin|200"
    "GET|/api/matieres|admin|200"
    "GET|/api/courses|admin|200"
    "GET|/api/courses/matiere/{matiereId}|admin|200"
    "GET|/api/rooms|admin|200"
    "GET|/api/calendar|admin|200"
    "GET|/api/calendar/date/2026-06-01|admin|200"
    "GET|/api/schedule|admin|200"
    "GET|/api/schedule/class/{classId}|admin|200"
    "GET|/api/schedule/day/Lundi|admin|200"
    "GET|/api/attendance|admin|200"
    "GET|/api/attendance/student/{studentId}|admin|200"
    "GET|/api/attendance/class/{classId}|admin|200"
    "GET|/api/attendance/stats/{studentId}|admin|200"
    "GET|/api/grades/evaluations|admin|200"
    "GET|/api/grades/evaluations/class/{classId}|admin|200"
    "GET|/api/grades|admin|200"
    "GET|/api/grades/student/{studentId}|admin|200"
    "GET|/api/grades/averages/class/{classId}|admin|200"
    "GET|/api/payments/reminders|admin|200"
    "GET|/api/payments/receipts|admin|200"
    "GET|/api/canteen|admin|200"
    "GET|/api/canteen/day/Lundi|admin|200"
    "GET|/api/transport|admin|200"
    "GET|/api/transport/student/{studentId}|admin|200"
    "GET|/api/schools|admin|200"
    "GET|/api/schools/login-id-preview?firstName=Jean&lastName=Dupont|admin|200"
    "GET|/api/users|admin|200"
    "GET|/api/users/role/ADMIN|admin|200"
    "GET|/api/drivers|admin|200"
    "GET|/api/fees|admin|200"
    "GET|/api/announcements|admin|200"
    "GET|/api/grades/modification-requests|admin|200"
    "GET|/api/communications/status|admin|200"
    "GET|/api/role-access/my|admin|200"
    "GET|/api/finance/overview|admin|200"
    "GET|/api/finance/payroll|admin|200"
    "GET|/api/finance/payroll?employeeType=TEACHER|admin|200"
) | ForEach-Object {
    $p = $_ -split '\|'
    Hit -Method $p[0] -Path $p[1] -Role $p[2] -Expected $p[3]
}

Write-Host "`n=== Tracking & portal ===" -ForegroundColor Cyan
Hit GET "/api/tracking/live" -Role parent -Expected "200"
Hit GET "/api/tracking/live" -Role teacher -Expected "200"
Hit GET "/api/tracking/routes/{transportId}" -Role admin -Expected "200,400,404"
foreach ($role in @("teacher", "parent", "student")) {
    Hit GET "/api/portal/feed" -Role $role -Expected "200"
    Hit GET "/api/portal/grades" -Role $role -Expected "200,403"
    Hit GET "/api/portal/attendance" -Role $role -Expected "200,403"
    Hit GET "/api/portal/notifications" -Role $role -Expected "200,403"
    $parentStudentOnly = ($role -in @("parent", "student"))
    Hit GET "/api/portal/directory" -Role $role -Expected $(if ($parentStudentOnly) { "200" } else { "400" })
    Hit GET "/api/portal/announcements" -Role $role -Expected "200"
    Hit GET "/api/portal/chat/messages" -Role $role -Expected "200,403"
    Hit GET "/api/portal/messages" -Role $role -Expected "200,403"
    Hit GET "/api/portal/fees" -Role $role -Expected $(if ($parentStudentOnly) { "200" } else { "400" })
}
Hit GET "/api/portal/classes/{classId}" -Role teacher -Expected "200,403"
Hit GET "/api/portal/classes/{classId}/roll-call" -Role teacher -Expected "200,403"
Hit GET "/api/portal/classes/{classId}/homework" -Role teacher -Expected "200,403"

Write-Host "`n=== Public & security ===" -ForegroundColor Cyan
Hit GET "/api/public/id-card/students/{studentId}" -Role none -Expected "200,404"
Hit GET "/api/public/id-card/teachers/{teacherId}" -Role none -Expected "200,404"
Hit GET "/api/teachers" -Role none -Expected "403"

$passed = @($script:Results | Where-Object OK).Count
$failed = @($script:Results | Where-Object { -not $_.OK }).Count
$total = $script:Results.Count

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "API TEST SUMMARY - $BaseUrl" -ForegroundColor Cyan
Write-Host "Total: $total | Passed: $passed | Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })

if ($failed -gt 0) {
    Write-Host "`nFAILED ENDPOINTS:" -ForegroundColor Red
    $script:Results | Where-Object { -not $_.OK } | Sort-Object Method, Path | Format-Table Method, Path, Status, Expected, Role, Note -AutoSize
}

$report = Join-Path $PSScriptRoot "api-test-report.json"
$script:Results | ConvertTo-Json -Depth 4 | Set-Content $report -Encoding UTF8
Write-Host "Report: $report" -ForegroundColor Gray

if ($serverJob) {
    Stop-Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job $serverJob -Force -ErrorAction SilentlyContinue
}

exit $(if ($failed -gt 0) { 1 } else { 0 })
