@echo off
title Launch Urban Ride Mobility Microservices
echo ==================================================
echo  STARTING URBAN RIDE MOBILITY MICROSERVICES STACK
echo ==================================================

echo [1/7] Starting Eureka Server (Port 8761)...
start "Eureka Server" cmd /k "cd thanmai\eureka-server && mvn spring-boot:run"
timeout /t 10

echo [2/7] Starting API Gateway (Port 5000)...
start "API Gateway" cmd /k "cd thanmai\api-gateway && mvn spring-boot:run"
timeout /t 5

echo [3/7] Starting Auth Service (Port 8081)...
start "Auth Service" cmd /k "cd thanmai\auth-service && mvn spring-boot:run"

echo [4/7] Starting Ride Service (Port 8082)...
start "Ride Service" cmd /k "cd yasaswini\ride-service && mvn spring-boot:run"

echo [5/7] Starting Driver Service (Port 8083)...
start "Driver Service" cmd /k "cd yaswanth\driver-service && mvn spring-boot:run"

echo [6/7] Starting Payment Service (Port 8084)...
start "Payment Service" cmd /k "cd yaswanth\payment-service && mvn spring-boot:run"

timeout /t 10

echo [7/7] Starting React Frontend Application (Port 3000)...
start "Frontend UI" cmd /k "cd yasaswini\frontend && npm run dev -- --port 3000 --host 0.0.0.0"

echo ==================================================
echo  ALL SERVICES LAUNCHED SUCCESSFULLY!
echo  Eureka Dashboard : http://localhost:8761
echo  API Gateway      : http://localhost:5000
echo  Frontend Web UI  : http://localhost:3000
echo ==================================================
pause
