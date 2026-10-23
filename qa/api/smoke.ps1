param(
  [string]$BaseUrl = $(if ($env:QA_API_URL) { $env:QA_API_URL } else { "http://127.0.0.1:8000" }),
  [switch]$SkipReady
)

$ErrorActionPreference = "Stop"
$base = $BaseUrl.TrimEnd('/')
$checks = @("/health", "/openapi.json")
if (-not $SkipReady) { $checks += "/health/ready" }

$failed = $false
foreach ($path in $checks) {
  $url = "$base$path"
  try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 20
    if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 300) {
      Write-Host "FAIL $path -> HTTP $($response.StatusCode)" -ForegroundColor Red
      $failed = $true
      continue
    }
    Write-Host "PASS $path -> HTTP $($response.StatusCode)" -ForegroundColor Green
  } catch {
    Write-Host "FAIL $path -> $($_.Exception.Message)" -ForegroundColor Red
    $failed = $true
  }
}

if ($failed) {
  Write-Error "Smoke API falló. Revisa que el backend esté levantado y que QA_API_URL apunte al entorno correcto."
  exit 1
}
Write-Host "Smoke API completado correctamente contra $base" -ForegroundColor Green
