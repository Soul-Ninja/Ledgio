# ==============================================================================
# Ledgio — Automated Asset Minifier & Build Script
# Usage: powershell -ExecutionPolicy Bypass -File scripts\build.ps1
# ==============================================================================

param([ValidatePattern('^\d+\.\d+\.\d+$')][string]$Version)

$ErrorActionPreference = "Stop"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Ledgio Production Asset Minification Engine   " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$esbuildScript = Join-Path $PSScriptRoot "esbuild_minify.js"

function Minify-Css-Esbuild($srcPath, $dstPath) {
    & node $esbuildScript css $srcPath $dstPath
    if ($LASTEXITCODE -ne 0) {
        throw "esbuild CSS minification failed on $srcPath"
    }
}

function Minify-Js-Esbuild($srcPath, $dstPath) {
    & node $esbuildScript js $srcPath $dstPath
    if ($LASTEXITCODE -ne 0) {
        throw "esbuild JS minification failed on $srcPath"
    }
}

$baseDir = Split-Path -Parent $PSScriptRoot
if (-not $baseDir) { $baseDir = "." }

# Validate Application Version Consistency across codebase
$supabaseConfigContent = [System.IO.File]::ReadAllText((Join-Path $baseDir "assets\js\supabase-config-p3a-v1.js"), [System.Text.Encoding]::UTF8)
$swContent = [System.IO.File]::ReadAllText((Join-Path $baseDir "sw.js"), [System.Text.Encoding]::UTF8)
$readmeContent = [System.IO.File]::ReadAllText((Join-Path $baseDir "README.md"), [System.Text.Encoding]::UTF8)

$cfgVerMatch = [regex]::Match($supabaseConfigContent, 'LEDGIO_VERSION\s*=\s*[''"]([^''"]+)[''"]')
$swVerMatch = [regex]::Match($swContent, 'LEDGIO_VERSION\s*=\s*[''"]([^''"]+)[''"]')
if (-not $swVerMatch.Success) {
    $swVerMatch = [regex]::Match($swContent, 'CACHE_NAME\s*=\s*[''"]ledgio-v([^''"]+)[''"]')
}
$readmeVerMatch = [regex]::Match($readmeContent, 'badge/Version-([0-9.]+)-emerald')

if (-not $cfgVerMatch.Success -or -not $swVerMatch.Success -or -not $readmeVerMatch.Success) {
    throw "Failed to extract version strings for consistency validation! (Config: $($cfgVerMatch.Success), SW: $($swVerMatch.Success), README: $($readmeVerMatch.Success))"
}

$cfgVer = $cfgVerMatch.Groups[1].Value
$swVer = $swVerMatch.Groups[1].Value
$readmeVer = $readmeVerMatch.Groups[1].Value

if ($cfgVer -ne $swVer -or $cfgVer -ne $readmeVer) {
    throw "Version mismatch detected! supabase-config-p3a-v1.js: '$cfgVer', sw.js: '$swVer', README.md: '$readmeVer'"
}
# An explicit release updates the validated version inputs and HTML stamps together.
if ($Version -and $Version -ne $cfgVer) {
    $versionPaths = @(
        (Join-Path $baseDir "assets\js\supabase-config-p3a-v1.js"),
        (Join-Path $baseDir "assets\js\supabase-config.js"),
        (Join-Path $baseDir "sw.js"),
        (Join-Path $baseDir "README.md"),
        (Join-Path $baseDir "tests\headless_regression.html")
    )
    $versionPaths += @(Get-ChildItem -Path $baseDir -Filter "*.html" -Recurse | Where-Object { $_.FullName -notmatch '[\\/](node_modules|\.git|scratch|graphify-out)[\\/]' } | ForEach-Object { $_.FullName })
    foreach ($versionPath in $versionPaths) {
        $versionText = [System.IO.File]::ReadAllText($versionPath, [System.Text.Encoding]::UTF8)
        $updatedVersionText = $versionText.Replace($cfgVer, $Version)
        if ($updatedVersionText -ne $versionText) {
            [System.IO.File]::WriteAllText($versionPath, $updatedVersionText, $utf8NoBom)
        }
    }
    $cfgVer = $Version
    $swVer = $Version
    $readmeVer = $Version
}
Write-Host "Version consistency verified: v$cfgVer (supabase-config-p3a-v1.js, sw.js, README.md)" -ForegroundColor Green

# Validate that all HTML files referencing asset query versions match LEDGIO_VERSION
$htmlFiles = Get-ChildItem -Path $baseDir -Filter "*.html" -Recurse | Where-Object { $_.FullName -notmatch '[\\/](node_modules|\.git|scratch|graphify-out)[\\/]' }
$htmlVersionMismatches = @()
$totalCheckedVQueries = 0

foreach ($htmlFile in $htmlFiles) {
    $htmlContent = [System.IO.File]::ReadAllText($htmlFile.FullName, [System.Text.Encoding]::UTF8)
    $vMatches = [regex]::Matches($htmlContent, '[\?&]v=([^"''\s>&]+)')
    foreach ($vm in $vMatches) {
        $totalCheckedVQueries++
        $foundVer = $vm.Groups[1].Value
        if ($foundVer -ne $cfgVer) {
            $relPath = $htmlFile.FullName.Substring($baseDir.Length).TrimStart('\', '/')
            $htmlVersionMismatches += "$relPath references '?v=$foundVer' (expected '$cfgVer')"
        }
    }
}

if ($htmlVersionMismatches.Count -gt 0) {
    throw "HTML Asset Query Version Mismatch detected!`n$($htmlVersionMismatches -join "`n")"
}
Write-Host "HTML asset query version consistency verified: $totalCheckedVQueries queries across $($htmlFiles.Count) HTML files match v$cfgVer" -ForegroundColor Green

# Validate and ensure Hero Version Pill in index.html matches LEDGIO_VERSION
$indexPath = Join-Path $baseDir "index.html"
$indexHtml = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)
if ($indexHtml -match '<span id="hero-release-text">[^<]*</span>') {
    $updatedIndex = [regex]::Replace($indexHtml, '<span id="hero-release-text">[^<]*</span>', "<span id=`"hero-release-text`">Free forever, open source &bull; v$cfgVer</span>")
    if ($updatedIndex -ne $indexHtml) {
        [System.IO.File]::WriteAllText($indexPath, $updatedIndex, $utf8NoBom)
        Write-Host "Injected v$cfgVer into index.html hero release pill" -ForegroundColor Green
    }
}

# Minify CSS and JS Assets via esbuild
Write-Host "Minifying production CSS and JS assets with esbuild..." -ForegroundColor Green
& node $esbuildScript --all $baseDir
if ($LASTEXITCODE -ne 0) {
    throw "esbuild asset minification failed! Build aborted."
}

# Validate that all same-origin assets referenced in root HTML files exist on disk
$rootHtmlFiles = Get-ChildItem -Path $baseDir -Filter "*.html" | Where-Object { $_.DirectoryName -eq (Resolve-Path $baseDir).Path }
$missingAssetRefs = @()
$totalCheckedAssetRefs = 0

$assetPatterns = @(
    "<script\s+[^>]*src=[`"']([^`"']+)[`"']",
    "<link\s+[^>]*href=[`"']([^`"']+)[`"']",
    "<img\s+[^>]*src=[`"']([^`"']+)[`"']"
)

foreach ($htmlFile in $rootHtmlFiles) {
    $htmlContent = [System.IO.File]::ReadAllText($htmlFile.FullName, [System.Text.Encoding]::UTF8)
    foreach ($pat in $assetPatterns) {
        $matches = [regex]::Matches($htmlContent, $pat, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        foreach ($m in $matches) {
            $rawUrl = $m.Groups[1].Value.Trim()
            if ($rawUrl -match '^(https?:|//|data:|#|mailto:|javascript:)') { continue }
            $cleanUrl = ($rawUrl -split '[\?#]')[0]
            if ([string]::IsNullOrWhiteSpace($cleanUrl)) { continue }
            $cleanRel = $cleanUrl.TrimStart('/', '\')
            $resolvedPath = Join-Path $baseDir $cleanRel
            $totalCheckedAssetRefs++
            if (-not (Test-Path $resolvedPath)) {
                $missingAssetRefs += "$($htmlFile.Name): '$rawUrl' -> resolved '$cleanRel' (file does not exist)"
            }
        }
    }
}

if ($missingAssetRefs.Count -gt 0) {
    throw "Build failed: Missing referenced asset(s) detected in root HTML files!`n$($missingAssetRefs -join "`n")"
}
Write-Host "Referenced assets verified: $totalCheckedAssetRefs same-origin script/link/img references across $($rootHtmlFiles.Count) root HTML files exist" -ForegroundColor Green

# Verify All Minified JS Bundles Syntax with node --check
Write-Host "Verifying minified JS bundles with node --check..." -ForegroundColor Cyan
$minJsFiles = Get-ChildItem -Path (Join-Path $baseDir "assets\js") -Filter "*.min.js"
foreach ($mjs in $minJsFiles) {
    & node --check $mjs.FullName
    if ($LASTEXITCODE -ne 0) {
        throw "Minified JS syntax check failed on $($mjs.Name)! Build aborted."
    }
}
Write-Host "All JS bundles passed node --check verification!" -ForegroundColor Green

# Verify Canonical Database Migrations
$migDir = Join-Path $baseDir "supabase\migrations"
if (Test-Path $migDir) {
    $migFiles = Get-ChildItem -Path $migDir -Filter "*.sql"
    Write-Host "Canonical migrations verified: $($migFiles.Count) files in supabase\migrations" -ForegroundColor Green
}

Write-Host "`nBuild complete! All bundles successfully compiled in UTF-8." -ForegroundColor Cyan