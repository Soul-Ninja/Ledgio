# Captures the README screenshots (390x844 @2x) from a seeded demo account and writes WebP files.
# Usage: powershell -ExecutionPolicy Bypass -File scripts\capture_readme.ps1
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'assets\img\landing'
$tmp = Join-Path $env:TEMP ('ledgio_readme_' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp | Out-Null
$port = 8131
$srv = Start-Process python -ArgumentList '-m','http.server',$port,'--directory',$root -PassThru -WindowStyle Hidden
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if (-not (Test-Path $edge)) { $edge = 'C:\Program Files\Microsoft\Edge\Application\msedge.exe' }
$shots = @(
  @{ n='screen_dashboard_dark';       q='tab=dashboard&theme=dark' },
  @{ n='screen_dashboard_light';      q='tab=dashboard&theme=light' },
  @{ n='screen_stat_cards_percent';   q='tab=dashboard&theme=dark&stat=percent&height=480' },
  @{ n='screen_budgets';              q='tab=budget&theme=dark&scroll=330' },
  @{ n='screen_goals';                q='tab=goals&theme=dark' },
  @{ n='screen_loans_list';           q='tab=loans&theme=dark' },
  @{ n='screen_reports';              q='tab=reports&theme=dark' },
  @{ n='screen_loan_modal';           q='tab=loans&theme=dark&modal=loan' },
  @{ n='screen_categories';           q='tab=budget&theme=dark&modal=category' }
)
try {
  Start-Sleep -Seconds 1
  foreach ($s in $shots) {
    $h = 844; if ($s.q -match 'height=(\d+)') { $h = [int]$Matches[1] }
    $png = Join-Path $tmp ($s.n + '.png')
    $url = "http://127.0.0.1:$port/tests/capture_readme_harness.html?width=390&$($s.q)"
    $a = @('--headless=new','--disable-gpu','--hide-scrollbars',"--window-size=390,$h",'--force-device-scale-factor=2','--virtual-time-budget=8000',"--user-data-dir=$tmp\profile",'--no-first-run',"--screenshot=$png","`"$url`"")
    $p = Start-Process $edge -ArgumentList $a -PassThru -NoNewWindow
    $p.WaitForExit(30000) | Out-Null
    if (Test-Path $png) { Write-Host "captured $($s.n)" } else { Write-Warning "failed $($s.n)" }
  }
  python -c "import sys,glob,os; from PIL import Image; [Image.open(f).convert('RGB').save(os.path.join(sys.argv[2], os.path.basename(f)[:-4]+'.webp'),'WEBP',quality=82,method=6) for f in glob.glob(os.path.join(sys.argv[1],'*.png'))]" $tmp $out
  Write-Host "WebP written to $out"
} finally {
  Stop-Process -Id $srv.Id -Force -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}
