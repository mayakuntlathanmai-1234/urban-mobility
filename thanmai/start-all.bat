@echo off
title Launch Thanmai Services (Eureka, Gateway, Auth)
echo ==================================================
echo  STARTING THANMAI INFRASTRUCTURE & AUTH SERVICES
echo ==================================================

echo [1/3] Starting Eureka Server (Port 8761)...
start "Eureka Server" cmd /k "cd eureka-server && mvn spring-boot:run"
timeout /t 10

echo [2/3] Starting API Gateway (Port 5000)...
start "API Gateway" cmd /k "cd api-gateway && mvn spring-boot:run"
timeout /t 5

echo [3/3] Starting Auth Service (Port 8081)...
start "Auth Service" cmd /k "cd auth-service && mvn spring-boot:run"

echo ==================================================
echo  THANMAI SERVICES LAUNCHED SUCCESSFULLY!
echo  Eureka Dashboard : http://localhost:8761
echo  API Gateway      : http://localhost:5000
echo ==================================================
pause
