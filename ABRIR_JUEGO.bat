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
echo Iniciando servidor del juego...
echo.
start "DEADball Server" /MIN cmd /c "node server.js"

:: Esperar 3 segundos para que el servidor se inicie
timeout /t 3 /nobreak >nul

:: Abrir el navegador
echo.
echo Servidor iniciado correctamente!
echo.
echo Abriendo navegador...
echo.

:: Intentar abrir con el navegador predeterminado
start "" "http://localhost:3000/menu.html"

:: Si no funciona, intentar con navegadores comunes
timeout /t 1 /nobreak >nul

:: Firefox
if exist "C:\Program Files\Mozilla Firefox\firefox.exe" (
    start "" "C:\Program Files\Mozilla Firefox\firefox.exe" "http://localhost:3000/menu.html"
)
if exist "C:\Program Files (x86)\Mozilla Firefox\firefox.exe" (
    start "" "C:\Program Files (x86)\Mozilla Firefox\firefox.exe" "http://localhost:3000/menu.html"
)

:: Chrome
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:3000/menu.html"
)
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "http://localhost:3000/menu.html"
)

:: Edge
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" "http://localhost:3000/menu.html"
)
if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" "http://localhost:3000/menu.html"
)

echo.
echo ========================================
echo   SI NO SE ABRIO EL NAVEGADOR:
echo   Abre manualmente: http://localhost:3000/menu.html
echo ========================================
echo.
echo El servidor esta en una ventana separada minimizada.
echo Puedes cerrar ESTA ventana de forma segura.
echo.
echo Para detener el servidor, usa DETENER_SERVIDOR.bat
pause
