@echo off
title Deteniendo DEADball Server
color 0C

echo.
echo Deteniendo servidor de DEADball...
echo.

:: Buscar y matar todos los procesos de node que ejecutan server.js
taskkill /F /FI "WINDOWTITLE eq DEADball*" >nul 2>nul
taskkill /F /IM node.exe /FI "IMAGENAME eq node.exe" >nul 2>nul

echo Servidor detenido.
timeout /t 2 >nul
