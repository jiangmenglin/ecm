@echo off
echo ================================
echo  ECM - Start Backend (Spring Boot)
echo ================================
echo.

cd /d "%~dp0backend"

echo [1/2] Checking Maven...
where mvn >nul 2>&1 || (
    echo [ERROR] mvn not found, please install Maven and add to PATH
    pause
    exit /b 1
)

echo [2/2] Starting Spring Boot...
mvn spring-boot:run

pause
