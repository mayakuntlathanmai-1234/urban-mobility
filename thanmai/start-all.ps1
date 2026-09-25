# Launch Thanmai Services (Eureka, Gateway, Auth)
$ROOT_DIR = $PSScriptRoot

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " STARTING THANMAI INFRASTRUCTURE & AUTH SERVICES" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "[1/3] Starting Eureka Server (Port 8761)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$ROOT_DIR\eureka-server'; mvn spring-boot:run`""

Start-Sleep -Seconds 10

Write-Host "[2/3] Starting API Gateway (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$ROOT_DIR\api-gateway'; mvn spring-boot:run`""

Start-Sleep -Seconds 5

Write-Host "[3/3] Starting Auth Service (Port 8081)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$ROOT_DIR\auth-service'; mvn spring-boot:run`""

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host " THANMAI SERVICES LAUNCHED SUCCESSFULLY!" -ForegroundColor Green
Write-Host " Eureka Dashboard : http://localhost:8761" -ForegroundColor Green
Write-Host " API Gateway      : http://localhost:5000" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
