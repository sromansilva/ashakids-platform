param(
  [string]$BaseUrl = $(if ($env:QA_API_URL) { $env:QA_API_URL } else { "http://127.0.0.1:8000" })
)

$ErrorActionPreference = "Stop"
if (-not (Get-Command postman -ErrorAction SilentlyContinue)) {
  throw "Postman CLI no está disponible en PATH. Instálalo o ejecuta qa/api/smoke.ps1."
}

$collection = Join-Path $PSScriptRoot "ASHAKids-QA-Smoke.postman_collection.json"
postman collection run $collection --env-var "base_url=$($BaseUrl.TrimEnd('/'))"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
