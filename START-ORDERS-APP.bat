@echo off
echo ============================================
echo Starting Orders App (Standalone)
echo ============================================
echo.
echo This will start the Orders app in standalone mode.
echo It connects to the real API at dev-creamat.fds-1.com
echo.
echo Services will run on:
echo   - Orders App: http://localhost:3005
echo.
echo IMPORTANT: You need to use Chrome with --disable-web-security
echo The batch file will launch a CORS-disabled Chrome for development.
echo.
pause

REM Start Orders app
start "Orders App (Port 3005)" cmd /k "cd golden-sample-react-micro-web\frontend\orders-app && echo Starting Orders App... && npx webpack serve --config webpack.minimal.js"

echo.
echo ============================================
echo Orders App is starting!
echo ============================================
echo.
echo Wait 5-10 seconds for the service to be ready.
echo Then it will open in a CORS-disabled Chrome browser.
echo.
echo Press any key to launch Chrome...
pause > nul

REM Launch Chrome with CORS disabled
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --disable-features=VizDisplayCompositor --user-data-dir="%TEMP%\chrome-dev-session" http://localhost:3005

echo.
echo Chrome launched with CORS disabled.
echo You can now use the Orders app with the real API.
echo.
echo To stop: Close the "Orders App" terminal window.
echo.



