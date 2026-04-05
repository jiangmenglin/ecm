@echo off
echo ================================
echo  ECM - Initialize Database
echo ================================
echo.

set DB_USER=root
set DB_PASS=root
set DB_NAME=ecm_db
set SQL_FILE=%~dp0sql\init.sql

if not exist "%SQL_FILE%" (
    echo [ERROR] File not found: %SQL_FILE%
    pause
    exit /b 1
)

echo Command: mysql -u %DB_USER% -p%DB_PASS% ^< sql\init.sql
echo WARNING: Database %DB_NAME% will be recreated. All data will be lost!
echo.
set /p CONFIRM=Continue? (y/N):
if /i not "%CONFIRM%"=="y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
mysql -u %DB_USER% -p%DB_PASS% < "%SQL_FILE%"

if %ERRORLEVEL%==0 (
    echo.
    echo [OK] Database initialized successfully.
) else (
    echo.
    echo [ERROR] Database initialization failed. Check if MySQL is running and credentials are correct.
)

pause
