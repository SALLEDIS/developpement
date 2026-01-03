@echo off
echo ========================================
echo   DEMARRAGE SERVEUR D'IMPRESSION
echo ========================================
echo.

cd /d "%~dp0print-server"

if not exist "node_modules" (
    echo Installation des dependances...
    call npm install
    echo.
)

echo Demarrage du serveur...
echo.
start "RestoBar - Serveur d'impression" cmd /k npm start

echo.
echo Le serveur d'impression est en cours de demarrage...
echo Une nouvelle fenetre va s'ouvrir.
echo.
echo IMPORTANT: Ne fermez pas la fenetre du serveur!
echo.
pause
