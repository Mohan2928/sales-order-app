# One-command Kubernetes deploy for the Sales Order app.
# Usage (from the project root):  .\start-k8s.ps1
# Then open:  http://localhost:8093

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "==> Building images..." -ForegroundColor Cyan
docker build -t salesorder-backend:v7 ./backend
docker build -t salesorder-frontend:v10 ./frontend

Write-Host "==> Applying Kubernetes manifests..." -ForegroundColor Cyan
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/

Write-Host "==> Waiting for pods to be ready..." -ForegroundColor Cyan
kubectl wait --for=condition=Ready pod -l app=postgres  -n salesorder --timeout=120s
kubectl wait --for=condition=Ready pod -l app=backend   -n salesorder --timeout=180s
kubectl wait --for=condition=Ready pod -l app=frontend  -n salesorder --timeout=120s

Write-Host "==> Waiting for the seed job to complete..." -ForegroundColor Cyan
kubectl wait --for=condition=complete job/salesorder-seed -n salesorder --timeout=180s

Write-Host ""
Write-Host "==> DONE. Your app is running on Kubernetes." -ForegroundColor Green
Write-Host "    Open:        http://localhost:8093"
Write-Host "    Access cmd:  kubectl port-forward -n salesorder service/frontend 8093:80"
Write-Host "    Pods:        kubectl get pods -n salesorder"
Write-Host "    Stop all:    kubectl delete -f k8s/"
