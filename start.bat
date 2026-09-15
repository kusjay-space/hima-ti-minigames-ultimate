@echo off
title HIMA TI Minigames Ultimate Launcher
echo ========================================================
echo   MENJALANKAN MINIGAMES HIMA TI ULTIMATE
echo ========================================================
echo.

echo [1/2] Menjalankan Server Backend (Port 3001)...
start "HIMA TI - Backend" cmd /k "npm run dev:backend"

echo [2/2] Menjalankan Server Frontend (Port 3000)...
start "HIMA TI - Frontend" cmd /k "npm run dev:frontend"

echo.
echo Server Backend & Frontend sedang berjalan di jendela terpisah.
echo Membuka browser dalam 3 detik...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo Selesai! Untuk mematikan server, cukup tutup jendela terminal Backend dan Frontend.
