<#
.SYNOPSIS
  Verifies that all committed minified bundles (.min.js, .min.css) match the current source code.
.DESCRIPTION
  Runs scripts/build.ps1 in the working tree, then invokes:
    git diff --exit-code -- '*.min.js' '*.min.css'
  Exits with code 1 if stale bundles are detected, exit 0 if current.
#>

$ErrorActionPreference = "Stop"
$baseDir = Split-Path -Parent $PSScriptRoot
if (-not $baseDir) { $baseDir = "." }

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Checking Build Asset Freshness                          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Run build.ps1
$buildScript = Join-Path $PSScriptRoot "build.ps1"
if (-not (Test-Path $buildScript)) {
    Write-Error "build.ps1 not found at $buildScript"
    exit 1
}

powershell -ExecutionPolicy Bypass -File $buildScript
if ($LASTEXITCODE -ne 0) {
    Write-Error "build.ps1 failed during asset compilation!"
    exit $LASTEXITCODE
}

# 2. Check git diff for stale minified assets
Push-Location $baseDir
try {
    Write-Host "`nChecking for diffs in minified assets..." -ForegroundColor Cyan
    $diffOutput = git diff --name-only -- "assets/js/*.min.js" "assets/css/*.min.css"
    if ($diffOutput) {
        Write-Host "`n[FAIL] Stale minified bundles detected! The following files differ from source:" -ForegroundColor Red
        $diffOutput | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        Write-Host "`nPlease run 'powershell -ExecutionPolicy Bypass -File scripts/build.ps1' locally and commit the resulting .min files." -ForegroundColor Yellow
        exit 1
    }
} finally {
    Pop-Location
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  >>> ALL MINIFIED BUNDLES ARE CURRENT (0 drift) <<<     " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
exit 0
