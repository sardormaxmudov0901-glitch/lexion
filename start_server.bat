@echo off
title LingvoCards Web Server
echo ==============================================
echo   LingvoCards Serveri Ishga Tushmoqda...
echo   Manzil: http://localhost:8080/
echo ==============================================
start http://localhost:8080/
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
