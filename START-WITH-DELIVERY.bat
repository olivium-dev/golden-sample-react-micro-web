@echo off
echo ============================================
echo Starting Micro-Frontend Platform with Delivery
echo Module Federation Mode (Production-Like)
echo ============================================
echo.
echo This will start all services with Module Federation enabled.
echo The container will load remote micro-frontends dynamically.
echo.
echo Services will run on:
echo   - Backend API: http://localhost:30001
echo   - Container (Main App): http://localhost:30002
echo   - User Management: http://localhost:30003
echo   - Data Grid: http://localhost:30004
echo   - Analytics: http://localhost:30005
echo   - Settings: http://localhost:30006
echo   - Orders: http://localhost:30007
echo   - Delivery: http://localhost:30008
echo.
echo Press Ctrl+C in any terminal to stop that service.
echo.
pause

REM Open terminals for each service
start "Backend API (Port 30001)" cmd /k "cd golden-sample-react-micro-web\backend\mock-data-service && echo Starting Backend API... && python main.py"

timeout /t 3 /nobreak > nul

start "Container - Main App (Port 30002)" cmd /k "cd golden-sample-react-micro-web\frontend\container && echo Starting Container App... && npx webpack serve"

timeout /t 2 /nobreak > nul

start "User Management (Port 30003)" cmd /k "cd golden-sample-react-micro-web\frontend\user-management-app && echo Starting User Management... && npx webpack serve"

start "Data Grid (Port 30004)" cmd /k "cd golden-sample-react-micro-web\frontend\data-grid-app && echo Starting Data Grid... && npx webpack serve"

start "Analytics (Port 30005)" cmd /k "cd golden-sample-react-micro-web\frontend\analytics-app && echo Starting Analytics... && npx webpack serve"

start "Settings (Port 30006)" cmd /k "cd golden-sample-react-micro-web\frontend\settings-app && echo Starting Settings... && npx webpack serve"

start "Orders (Port 30007)" cmd /k "cd golden-sample-react-micro-web\frontend\orders-app && echo Starting Orders... && npx webpack serve"

start "Delivery (Port 30008)" cmd /k "cd golden-sample-react-micro-web\frontend\delivery-app && echo Starting Delivery... && npx webpack serve"

echo.
echo ============================================
echo All services are starting!
echo ============================================
echo.
echo Wait 10-15 seconds for all services to be ready.
echo Then open: http://localhost:30002
echo.
echo Login Credentials:
echo   Email: admin@example.com
echo   Password: admin123
echo.
echo Press any key to open the browser...
pause > nul

start http://localhost:30002

echo.
echo All terminals are now running.
echo Close this window or the individual terminal windows to stop services.
echo.


