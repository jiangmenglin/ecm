@echo off
echo ================================
echo  ECM - Start Frontend (Vite Dev)
echo ================================
echo.

cd /d "%~dp0frontend"

if not exist node_modules (
    echo [1/2] Installing dependencies...
    npm install
    echo.
) else (
    echo [1/2] Dependencies installed, skipping
)

echo [2/2] Starting Vite dev server...
npm run dev

pause
