@echo off
title DEADball ULTRA MEGA - Iniciando...
color 0A

echo.
echo ========================================
echo   DEADBALL ULTRA MEGA
echo ========================================
echo.
echo Iniciando servidor del juego...
echo.

:: Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js no está instalado.
    echo Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b
)

:: Ir al directorio del backend
cd /d "%~dp0backend"

:: Verificar si las dependencias están instaladas
if not exist "node_modules\" (
    echo.
    echo Instalando dependencias por primera vez...
    echo Esto puede tardar unos minutos...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Fallo al instalar dependencias.
        pause
        exit /b
    )
)

:: Iniciar el servidor
echo.
echo Servidor iniciado correctamente!
echo.
echo ========================================
echo   ABRE TU NAVEGADOR EN:
echo   http://localhost:3000
echo ========================================
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

node server.js
