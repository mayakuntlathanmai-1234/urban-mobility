# Urban Ride Mobility - Microservices & Frontend Startup Script (PowerShell)

$ROOT_DIR = $PSScriptRoot

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " STARTING URBAN RIDE MOBILITY MICROSERVICES STACK" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Eureka Server
Write-Host "[1/7] Starting Eureka Server (Port 8761)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$ROOT_DIR\eureka-server'; mvn spring-boot:run`""

Start-Sleep -Seconds 10

# 2. API Gateway
Write-Host "[2/7] Starting API Gateway (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$ROOT_DIR\api-gateway'; mvn spring-boot:run`""

Start-Sleep -Seconds 5

# 3. Auth Service
Write-Host "[3/7] Starting Auth Service (Port 8081)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$ROOT_DIR\auth-service'; mvn spring-boot:run`""

# 4. Ride Service
Write-Host "[4/7] Starting Ride Service (Port 8082)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$ROOT_DIR\ride-service'; mvn spring-boot:run`""

# 5. Driver Service
Write-Host "[5/7] Starting Driver Service (Port 8083)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$ROOT_DIR\driver-service'; mvn spring-boot:run`""

# 6. Payment Service
Write-Host "[6/7] Starting Payment Service (Port 8084)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$ROOT_DIR\payment-service'; mvn spring-boot:run`""

Start-Sleep -Seconds 10

# 7. Frontend
Write-Host "[7/7] Starting React Frontend Application (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$ROOT_DIR\frontend'; npm run dev -- --port 3000 --host 0.0.0.0`""

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host " ALL SERVICES LAUNCHED SUCCESSFULLY!" -ForegroundColor Green
Write-Host " Eureka Dashboard : http://localhost:8761" -ForegroundColor Green
Write-Host " API Gateway      : http://localhost:5000" -ForegroundColor Green
Write-Host " Frontend Web UI  : http://localhost:3000" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
