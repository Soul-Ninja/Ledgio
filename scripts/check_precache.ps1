<#
.SYNOPSIS
  Service Worker Precache & HTML Asset Integrity Verification Script
.DESCRIPTION
  1. Asserts that every entry in sw.js APP_SHELL (stripped of ?v= query) exists on disk.
  2. Asserts that every assets/... reference (href, src) in root *.html files exists on disk.
  Exits with code 1 if any missing file is detected; exits 0 on PASS.
#>

$ErrorActionPreference = "Stop"
$baseDir = Split-Path -Parent $PSScriptRoot
if (-not $baseDir) { $baseDir = "." }

$swFile = Join-Path $baseDir "sw.js"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Checking Service Worker Precache & HTML Asset Integrity " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not (Test-Path $swFile)) {
    Write-Error "CRITICAL: Service worker file missing: $swFile"
    exit 1
}

$mismatches = @()

# 1. Parse sw.js APP_SHELL
$swContent = [System.IO.File]::ReadAllText($swFile, [System.Text.Encoding]::UTF8)
$shellMatch = [regex]::Match($swContent, 'const\s+APP_SHELL\s*=\s*\[([\s\S]*?)\];')

if (-not $shellMatch.Success) {
    Write-Error "CRITICAL: Could not extract APP_SHELL array from $swFile"
    exit 1
}

$shellEntries = @()
$entryMatches = [regex]::Matches($shellMatch.Groups[1].Value, '["'']([^"'']+)["'']')
foreach ($em in $entryMatches) {
    $entry = $em.Groups[1].Value.Trim()
    if ($entry -ne "./") {
        $shellEntries += $entry
    }
}

Write-Host "Verifying $($shellEntries.Count) APP_SHELL entries against filesystem..." -ForegroundColor Cyan

foreach ($entry in $shellEntries) {
    $cleanPath = $entry -replace '\?.*$', ''
    $cleanPath = $cleanPath -replace '^\./', ''
    $diskPath = Join-Path $baseDir ($cleanPath -replace '/', '\')
    if (-not (Test-Path $diskPath)) {
        $mismatches += "sw.js APP_SHELL references missing file: '$entry' (resolved: '$cleanPath')"
    }
}

# 2. Parse root *.html files for assets/ references
$rootHtmlFiles = Get-ChildItem -Path $baseDir -Filter "*.html" | Where-Object { $_.DirectoryName -eq (Resolve-Path $baseDir).Path }
$htmlAssetCount = 0

foreach ($htmlFile in $rootHtmlFiles) {
    $htmlContent = [System.IO.File]::ReadAllText($htmlFile.FullName, [System.Text.Encoding]::UTF8)
    $attrMatches = [regex]::Matches($htmlContent, '(?:href|src)\s*=\s*["'']([^"'']+)["'']')
    foreach ($am in $attrMatches) {
        $val = $am.Groups[1].Value.Trim()
        if ($val -like "assets/*") {
            $htmlAssetCount++
            $cleanVal = $val -replace '\?.*$', ''
            $diskPath = Join-Path $baseDir ($cleanVal -replace '/', '\')
            if (-not (Test-Path $diskPath)) {
                $mismatches += "$($htmlFile.Name) references missing asset: '$val' (resolved: '$cleanVal')"
            }
        }
    }
}

Write-Host "Verified $htmlAssetCount asset references across $($rootHtmlFiles.Count) root HTML files." -ForegroundColor Cyan

if ($mismatches.Count -gt 0) {
    Write-Host "`n[FAIL] Precache / Asset Integrity Check Failed! ($($mismatches.Count) issues):" -ForegroundColor Red
    $mismatches | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  >>> PRECACHE & ASSET INTEGRITY VERIFIED (0 missing) <<< " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
exit 0
