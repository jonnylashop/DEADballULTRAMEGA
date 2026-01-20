@echo off
title DEADball ULTRA MEGA - Iniciando...
color 0A

echo.
echo ========================================
echo   DEADBALL ULTRA MEGA
echo ========================================
echo.
echo Verificando servidor...
echo.

:: Verificar si Node.js esta instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js no esta instalado.
    echo Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b
)

:: Ir al directorio del backend
cd /d "%~dp0backend"

:: Verificar si las dependencias estan instaladas
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

:: Iniciar el servidor en segundo plano
echo.
echo Iniciando servidor...
start "DEADball Server" /MIN cmd /c "node server.js"

:: Esperar 3 segundos para que el servidor se inicie
timeout /t 3 /nobreak >nul

:: Abrir el navegador
echo.
echo Abriendo navegador...
start http://localhost:3000/frontend/menu.html

echo.
echo ========================================
echo   JUEGO INICIADO!
echo ========================================
echo.
echo El servidor se esta ejecutando en segundo plano.
echo Puedes cerrar esta ventana de forma segura.
echo.
echo Para detener el servidor, usa DETENER_SERVIDOR.bat
echo.
pause
