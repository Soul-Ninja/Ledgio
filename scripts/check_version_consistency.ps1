<#
.SYNOPSIS
  Validates canonical application version consistency across all entrypoints and manifests.
.DESCRIPTION
  Reads window.LEDGIO_VERSION from assets/js/supabase-config.js.
  Fails (exit 1) if:
  1. sw.js LEDGIO_VERSION or CACHE_NAME differs
  2. README.md version badge differs
  3. Any ?v= query parameter in root *.html files differs from the canonical version
#>

$ErrorActionPreference = "Stop"
$baseDir = Split-Path -Parent $PSScriptRoot
if (-not $baseDir) { $baseDir = "." }

$configFile = Join-Path $baseDir "assets\js\supabase-config.js"
if (-not (Test-Path $configFile)) {
    Write-Error "Config file not found: $configFile"
    exit 1
}

$configContent = [System.IO.File]::ReadAllText($configFile, [System.Text.Encoding]::UTF8)
$verMatch = [regex]::Match($configContent, 'window\.LEDGIO_VERSION\s*=\s*[''"]([^''"]+)[''"]')
if (-not $verMatch.Success) {
    Write-Error "Could not extract window.LEDGIO_VERSION from $configFile"
    exit 1
}
$canonicalVer = $verMatch.Groups[1].Value
Write-Host "Canonical Ledgio Version: v$canonicalVer (assets/js/supabase-config.js)" -ForegroundColor Cyan

$mismatches = @()

# 1. Check sw.js
$swFile = Join-Path $baseDir "sw.js"
if (Test-Path $swFile) {
    $swContent = [System.IO.File]::ReadAllText($swFile, [System.Text.Encoding]::UTF8)
    $swVerMatch = [regex]::Match($swContent, 'LEDGIO_VERSION\s*=\s*[''"]([^''"]+)[''"]')
    $swCacheMatch = [regex]::Match($swContent, 'CACHE_NAME\s*=\s*[''"]ledgio-v([^''"]+)[''"]')
    if (-not $swVerMatch.Success -or $swVerMatch.Groups[1].Value -ne $canonicalVer) {
        $found = if ($swVerMatch.Success) { $swVerMatch.Groups[1].Value } else { "<missing>" }
        $mismatches += "sw.js (LEDGIO_VERSION is '$found', expected '$canonicalVer')"
    }
    if (-not $swCacheMatch.Success -or $swCacheMatch.Groups[1].Value -ne $canonicalVer) {
        $found = if ($swCacheMatch.Success) { $swCacheMatch.Groups[1].Value } else { "<missing>" }
        $mismatches += "sw.js (CACHE_NAME is 'ledgio-v$found', expected 'ledgio-v$canonicalVer')"
    }
} else {
    $mismatches += "sw.js (file missing)"
}

# 2. Check README.md
$readmeFile = Join-Path $baseDir "README.md"
if (Test-Path $readmeFile) {
    $readmeContent = [System.IO.File]::ReadAllText($readmeFile, [System.Text.Encoding]::UTF8)
    $readmeMatch = [regex]::Match($readmeContent, 'badge/Version-([0-9.]+)-emerald')
    if (-not $readmeMatch.Success -or $readmeMatch.Groups[1].Value -ne $canonicalVer) {
        $found = if ($readmeMatch.Success) { $readmeMatch.Groups[1].Value } else { "<missing>" }
        $mismatches += "README.md (badge is 'v$found', expected 'v$canonicalVer')"
    }
} else {
    $mismatches += "README.md (file missing)"
}

# 3. Check all ?v= query stamps in root *.html
$rootHtmlFiles = Get-ChildItem -Path $baseDir -Filter "*.html" -File
$totalVChecked = 0
foreach ($htmlFile in $rootHtmlFiles) {
    $htmlContent = [System.IO.File]::ReadAllText($htmlFile.FullName, [System.Text.Encoding]::UTF8)
    $vMatches = [regex]::Matches($htmlContent, '[\?&]v=([^"''\s>&]+)')
    foreach ($vm in $vMatches) {
        $totalVChecked++
        $foundVer = $vm.Groups[1].Value
        if ($foundVer -ne $canonicalVer) {
            $mismatches += "$($htmlFile.Name) (references '?v=$foundVer', expected '?v=$canonicalVer')"
        }
    }
}

if ($mismatches.Count -gt 0) {
    Write-Host "`n[FAIL] Version consistency check failed with $($mismatches.Count) mismatch(es):" -ForegroundColor Red
    foreach ($m in $mismatches) {
        Write-Host "  - $m" -ForegroundColor Red
    }
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  >>> VERSION CONSISTENCY VERIFIED: v$canonicalVer ($totalVChecked ?v= stamps checked) <<<" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
exit 0
