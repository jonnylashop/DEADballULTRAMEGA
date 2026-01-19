@echo off
title Preparando DEADball para Distribución
color 0B

echo.
echo ========================================
echo   PREPARAR DISTRIBUCION
echo ========================================
echo.
echo Este script prepara el juego para
echo distribuir a otras personas.
echo.
echo Esto incluye:
echo - Limpiar archivos innecesarios
echo - Crear archivo ZIP comprimido
echo - Optimizar tamaño
echo.
pause

echo.
echo [1/4] Limpiando archivos temporales...
if exist "backend\node_modules" rmdir /s /q "backend\node_modules"
if exist "backend\deadball.db" del /f "backend\deadball.db"
if exist "*.backup*" del /f "*.backup*"
echo       Archivos temporales eliminados

echo.
echo [2/4] Creando lista de archivos a incluir...
echo       - Scripts BAT
echo       - Frontend completo
echo       - Backend (sin node_modules)
echo       - Archivos de ayuda

echo.
echo [3/4] Comprimiendo archivos...
echo       Esto puede tardar unos segundos...

:: Crear ZIP usando PowerShell
powershell -Command "$fecha = Get-Date -Format 'yyyy-MM-dd'; $nombreZip = \"DEADball_UltraMega_$fecha.zip\"; Compress-Archive -Path 'LEEME.txt','INSTRUCCIONES_INSTALACION.txt','INICIAR_JUEGO.bat','ABRIR_JUEGO.bat','DETENER_SERVIDOR.bat','frontend','backend','README.md' -DestinationPath $nombreZip -Force; Write-Host \"ZIP creado: $nombreZip\" -ForegroundColor Green; Write-Host \"Tamano: $([math]::Round((Get-Item $nombreZip).Length / 1MB, 2)) MB\" -ForegroundColor Cyan"

echo.
echo [4/4] Verificando resultado...
for %%F in (DEADball_UltraMega_*.zip) do (
    echo.
    echo ========================================
    echo   LISTO PARA DISTRIBUIR
    echo ========================================
    echo.
    echo Archivo creado: %%F
    echo Tamano: %%~zF bytes
    echo.
    echo Este archivo contiene todo lo necesario.
    echo Los usuarios solo necesitan:
    echo   1. Node.js instalado
    echo   2. Descomprimir el ZIP
    echo   3. Ejecutar INICIAR_JUEGO.bat
    echo.
    echo Puedes compartir este archivo por:
    echo   - Google Drive
    echo   - WeTransfer
    echo   - Email
    echo   - Dropbox
    echo   - GitHub
    echo.
)

echo Presiona cualquier tecla para salir...
pause >nul
