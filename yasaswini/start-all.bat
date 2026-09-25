@echo off
title Launch Yasaswini Services (Ride Service, Frontend)
echo ==================================================
echo  STARTING YASASWINI RIDE ENGINE & FRONTEND UI
echo ==================================================

echo [1/2] Starting Ride Service (Port 8082)...
start "Ride Service" cmd /k "cd ride-service && mvn spring-boot:run"

timeout /t 5

echo [2/2] Starting React Frontend Application (Port 3000)...
start "Frontend UI" cmd /k "cd frontend && npm run dev -- --port 3000 --host 0.0.0.0"

echo ==================================================
echo  YASASWINI SERVICES LAUNCHED SUCCESSFULLY!
echo  Frontend Web UI : http://localhost:3000
echo ==================================================
pause
