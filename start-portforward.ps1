# Resilient port-forward for the Sales Order frontend.
# Keeps forwarding localhost:8093 -> frontend service, auto-restarting if the
# pods or Docker Desktop restart (kubectl port-forward exits when its pod dies).
#
# Usage:  .\start-portforward.ps1

$ErrorActionPreference = "Continue"
$Namespace = "salesorder"
$LocalPort = 8093
$Service   = "frontend"

$kubectl = "C:\Users\manuk\AppData\Local\Programs\DockerDesktop\resources\bin\kubectl.exe"
if (-not (Test-Path $kubectl)) { $kubectl = "kubectl" }

Write-Host "Resilient port-forward: localhost:$LocalPort -> $Service/$Namespace. Ctrl+C to stop." -ForegroundColor Cyan
while ($true) {
    & $kubectl port-forward -n $Namespace "service/$Service" "${LocalPort}:80"
    Write-Host "port-forward exited; retrying in 3s..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}