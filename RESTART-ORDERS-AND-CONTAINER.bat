@echo off
echo ============================================
echo Restarting Orders and Container
echo ============================================
echo.
echo Step 1: Killing processes on ports 30002 and 30007...
echo.

REM Kill Container (30002)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :30002') do taskkill /PID %%a /F 2>nul

REM Kill Orders (30007)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :30007') do taskkill /PID %%a /F 2>nul

timeout /t 2 /nobreak > nul

echo.
echo Step 2: Starting Orders App...
echo.
start "Orders App (Port 30007)" cmd /k "cd golden-sample-react-micro-web\frontend\orders-app && npx webpack serve"

timeout /t 5 /nobreak > nul

echo.
echo Step 3: Starting Container...
echo.
start "Container (Port 30002)" cmd /k "cd golden-sample-react-micro-web\frontend\container && npx webpack serve"

echo.
echo ============================================
echo Services are restarting!
echo ============================================
echo.
echo Wait 20-30 seconds for compilation...
echo Then open: http://localhost:30002
echo.
pause



