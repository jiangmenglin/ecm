@echo off
echo ================================
echo  ECM - Start All Services
echo ================================
echo.
echo Starting backend and frontend in separate windows
echo.

cd /d "%~dp0"

start "ECM Backend (Spring Boot :9090)" cmd /k "start-backend.bat"
timeout /t 3 /nobreak >nul
start "ECM Frontend (Vite :80)" cmd /k "start-frontend.bat"

echo.
echo Backend:  http://localhost:9090
echo Frontend: http://localhost:80
echo.
echo Services started in new windows. You can close this window.
