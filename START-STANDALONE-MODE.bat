@echo off
echo ============================================
echo Starting Micro-Frontend Platform
echo Standalone Mode (Development)
echo ============================================
echo.
echo This will start all services in standalone mode.
echo Each app runs independently without Module Federation.
echo.
echo Services will run on:
echo   - Backend API: http://localhost:30001
echo   - Container: http://localhost:3000
echo   - User Management: http://localhost:3001
echo   - Data Grid: http://localhost:3002
echo   - Analytics: http://localhost:3003
echo   - Settings: http://localhost:3004
echo.
echo Press Ctrl+C in any terminal to stop that service.
echo.
pause

REM Open terminals for each service
start "Backend API (Port 30001)" cmd /k "cd golden-sample-react-micro-web\backend\mock-data-service && echo Starting Backend API... && python main.py"

timeout /t 3 /nobreak > nul

start "Container (Port 3000)" cmd /k "cd golden-sample-react-micro-web\frontend\container && echo Starting Container... && npx webpack serve --config webpack.minimal.js"

start "User Management (Port 3001)" cmd /k "cd golden-sample-react-micro-web\frontend\user-management-app && echo Starting User Management... && npx webpack serve --config webpack.minimal.js"

start "Data Grid (Port 3002)" cmd /k "cd golden-sample-react-micro-web\frontend\data-grid-app && echo Starting Data Grid... && npx webpack serve --config webpack.minimal.js"

start "Analytics (Port 3003)" cmd /k "cd golden-sample-react-micro-web\frontend\analytics-app && echo Starting Analytics... && npx webpack serve --config webpack.minimal.js"

start "Settings (Port 3004)" cmd /k "cd golden-sample-react-micro-web\frontend\settings-app && echo Starting Settings... && npx webpack serve --config webpack.minimal.js"

echo.
echo ============================================
echo All services are starting!
echo ============================================
echo.
echo Wait 10-15 seconds for all services to be ready.
echo Then open:
echo   - Container: http://localhost:3000
echo   - User Management: http://localhost:3001
echo   - Data Grid: http://localhost:3002
echo   - Analytics: http://localhost:3003
echo   - Settings: http://localhost:3004
echo.
echo Login Credentials:
echo   Email: admin@example.com
echo   Password: admin123
echo.
echo Press any key to open the container in browser...
pause > nul

start http://localhost:3000

echo.
echo All terminals are now running.
echo Close this window or the individual terminal windows to stop services.
echo.



