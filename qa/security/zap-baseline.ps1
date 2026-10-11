param(
  [string]$Target = $(if ($env:QA_TARGET_URL) { $env:QA_TARGET_URL } else { "http://127.0.0.1:5174" })
)

$ErrorActionPreference = "Stop"
if ($env:ALLOW_SECURITY_SCAN -ne "true") {
  throw "Escaneo ZAP bloqueado: define ALLOW_SECURITY_SCAN=true después de confirmar el objetivo."
}
$uri = [Uri]$Target
if ($uri.Host.EndsWith("onrender.com") -and $env:ALLOW_PRODUCTION_SECURITY_SCAN -ne "true") {
  throw "Escaneo contra Render bloqueado: define ALLOW_PRODUCTION_SECURITY_SCAN=true con autorización explícita."
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker no está disponible."
}

$reportDir = Join-Path $PSScriptRoot "..\reports\zap"
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
$reportDir = (Resolve-Path $reportDir).Path

docker run --rm -t `
  -v "${reportDir}:/zap/wrk/:rw" `
  ghcr.io/zaproxy/zaproxy:stable zap-baseline.py `
  -t $Target -r zap-report.html -J zap-report.json
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
