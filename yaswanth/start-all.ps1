# Launch Yaswanth Services (Driver Service, Payment Service)
$ROOT_DIR = $PSScriptRoot

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " STARTING YASWANTH DRIVER & PAYMENT SERVICES" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "[1/2] Starting Driver Service (Port 8083)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$ROOT_DIR\driver-service'; mvn spring-boot:run`""

Write-Host "[2/2] Starting Payment Service (Port 8084)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$ROOT_DIR\payment-service'; mvn spring-boot:run`""

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host " YASWANTH SERVICES LAUNCHED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
