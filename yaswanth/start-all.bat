@echo off
title Launch Yaswanth Services (Driver Service, Payment Service)
echo ==================================================
echo  STARTING YASWANTH DRIVER & PAYMENT SERVICES
echo ==================================================

echo [1/2] Starting Driver Service (Port 8083)...
start "Driver Service" cmd /k "cd driver-service && mvn spring-boot:run"

echo [2/2] Starting Payment Service (Port 8084)...
start "Payment Service" cmd /k "cd payment-service && mvn spring-boot:run"

echo ==================================================
echo  YASWANTH SERVICES LAUNCHED SUCCESSFULLY!
echo ==================================================
pause
