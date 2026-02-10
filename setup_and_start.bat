@echo off
title School AI Avatar - Setup & Launcher
echo ===================================================
echo   SCHOOL AI AVATAR - PREPARAZIONE PRESENTAZIONE
echo ===================================================
echo.
echo 1. Installazione dipendenze SERVER...
cd server
if not exist node_modules (
    call npm install
) else (
    echo node_modules gia presente, salto installazione server...
)

echo.
echo 2. Avvio SERVER...
start "School AI Server" cmd /k "npm run dev"

echo.
echo 3. Installazione dipendenze FRONTEND...
cd ..
if not exist node_modules (
    call npm install
) else (
    echo node_modules gia presente, salto installazione frontend...
)

echo.
echo 4. Avvio FRONTEND...
start "School AI Client" cmd /k "npm run dev"

echo.
echo ===================================================
echo   TUTTO AVVIATO!
echo   Il browser dovrebbe aprirsi a breve.
echo   NON CHIUDERE LE FINESTRE NERE.
echo ===================================================
timeout /t 5
start http://localhost:5173
pause
