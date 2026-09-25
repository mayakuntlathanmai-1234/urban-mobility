# Launch Yasaswini Services (Ride Service, Frontend)
$ROOT_DIR = $PSScriptRoot

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " STARTING YASASWINI RIDE ENGINE & FRONTEND UI" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "[1/2] Starting Ride Service (Port 8082)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$ROOT_DIR\ride-service'; mvn spring-boot:run`""

Start-Sleep -Seconds 5

Write-Host "[2/2] Starting React Frontend Application (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$ROOT_DIR\frontend'; npm run dev -- --port 3000 --host 0.0.0.0`""

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host " YASASWINI SERVICES LAUNCHED SUCCESSFULLY!" -ForegroundColor Green
Write-Host " Frontend Web UI : http://localhost:3000" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
