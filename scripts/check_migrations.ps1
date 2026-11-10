<#
.SYNOPSIS
  Database Migrations Parity & Source of Truth Verification Script
.DESCRIPTION
  1. Asserts that supabase/migrations exists and contains valid .sql migration files.
  2. If legacy backend/migrations exists, asserts that every migration file has an
     exact counterpart with identical filename and SHA-256 hash. Fails (exit 1) on drift.
  3. When backend/migrations has been retired, asserts that supabase/migrations remains
     the intact, single source of truth.
#>

$ErrorActionPreference = "Stop"
$baseDir = Split-Path -Parent $PSScriptRoot
if (-not $baseDir) { $baseDir = "." }

$supabaseMigDir = Join-Path $baseDir "supabase\migrations"
$backendMigDir  = Join-Path $baseDir "backend\migrations"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Checking Database Migration Integrity                   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Assert supabase/migrations exists and is non-empty
if (-not (Test-Path $supabaseMigDir)) {
    Write-Error "CRITICAL: Canonical migration directory missing: $supabaseMigDir"
    exit 1
}

$supabaseFiles = Get-ChildItem -Path $supabaseMigDir -Filter "*.sql" | Sort-Object Name
if ($supabaseFiles.Count -eq 0) {
    Write-Error "CRITICAL: No .sql migration files found in $supabaseMigDir"
    exit 1
}
Write-Host "Found $($supabaseFiles.Count) canonical migration files in supabase/migrations." -ForegroundColor Green

# 2. Check parity if backend/migrations exists
if (Test-Path $backendMigDir) {
    Write-Host "Verifying parity between backend/migrations and supabase/migrations..." -ForegroundColor Yellow
    $backendFiles = Get-ChildItem -Path $backendMigDir -Filter "*.sql" | Sort-Object Name
    
    $mismatches = @()
    if ($backendFiles.Count -ne $supabaseFiles.Count) {
        $mismatches += "File count mismatch: backend/migrations has $($backendFiles.Count), but supabase/migrations has $($supabaseFiles.Count)"
    }
    
    foreach ($bFile in $backendFiles) {
        $sFile = $supabaseFiles | Where-Object { $_.Name -eq $bFile.Name }
        if (-not $sFile) {
            $mismatches += "File missing in supabase/migrations: $($bFile.Name)"
            continue
        }
        $bHash = (Get-FileHash -Path $bFile.FullName -Algorithm SHA256).Hash
        $sHash = (Get-FileHash -Path $sFile.FullName -Algorithm SHA256).Hash
        if ($bHash -ne $sHash) {
            $mismatches += "Hash mismatch for $($bFile.Name): backend=$bHash, supabase=$sHash"
        }
    }

    foreach ($sFile in $supabaseFiles) {
        $bFile = $backendFiles | Where-Object { $_.Name -eq $sFile.Name }
        if (-not $bFile) {
            $mismatches += "File missing in backend/migrations: $($sFile.Name)"
        }
    }

    if ($mismatches.Count -gt 0) {
        Write-Host "`n[FAIL] Migration parity check failed:" -ForegroundColor Red
        $mismatches | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        exit 1
    }
    Write-Host "Parity check passed: backend/migrations matches supabase/migrations identically (100% hash parity)." -ForegroundColor Green
} else {
    Write-Host "supabase/migrations is verified as the sole source of truth (backend/migrations retired)." -ForegroundColor Green
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  >>> MIGRATION INTEGRITY VERIFIED ($($supabaseFiles.Count) migrations) <<<" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
exit 0
