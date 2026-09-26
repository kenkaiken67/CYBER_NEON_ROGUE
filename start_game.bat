@echo off
title Cyber Neon Rogue Launcher
echo ========================================================
echo       [ CYBER NEON ROGUE // OVERDRIVE ARCADE ]
echo ========================================================
echo Memulai server lokal dengan Python...
echo Buka browser di http://localhost:8000
echo.
start "" http://localhost:8000
python -m http.server 8000
pause
