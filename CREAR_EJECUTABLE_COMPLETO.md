# 🎮 Crear Ejecutable Completo con Electron

Esta guía te permite crear un **ejecutable profesional** (.exe para Windows, .app para Mac, .AppImage para Linux) con todo incluido.

## 📦 ¿Qué incluye?

- ✅ Todo el frontend y backend empaquetado
- ✅ Icono personalizado
- ✅ Instalador profesional (NSIS para Windows)
- ✅ Acceso directo en escritorio
- ✅ No requiere instalar Node.js
- ✅ Se ejecuta como una aplicación nativa

## 🚀 Pasos para crear el ejecutable

### 1. Instalar dependencias de Electron

```powershell
# En la raíz del proyecto
npm install --save-dev electron electron-builder
```

### 2. Copiar package.json de Electron

```powershell
# Copiar la configuración de Electron
Copy-Item package-electron.json package.json
```

### 3. Crear carpeta de recursos

```powershell
# Crear carpeta para iconos
New-Item -ItemType Directory -Force -Path build
```

### 4. Agregar icono

Coloca tu icono en la carpeta `build/`:
- **Windows**: `build/icon.ico` (256x256 px mínimo)
- **Mac**: `build/icon.icns`
- **Linux**: `build/icon.png` (512x512 px)

### 5. Construir el ejecutable

```powershell
# Para Windows
npm run build-win

# Para Mac (desde Mac)
npm run build-mac

# Para Linux
npm run build-linux

# Para todas las plataformas
npm run dist
```

### 6. Encontrar el ejecutable

El ejecutable estará en la carpeta `dist/`:
- Windows: `dist/DEADball Ultra Mega Setup.exe` (instalador)
- Windows Portable: `dist/DEADball Ultra Mega.exe` (sin instalación)
- Mac: `dist/DEADball Ultra Mega.dmg`
- Linux: `dist/DEADball Ultra Mega.AppImage`

## 🎨 Crear iconos profesionales

### Opción 1: Herramienta online
1. Usa https://www.icoconverter.com/
2. Sube tu imagen (PNG 512x512 px)
3. Descarga como .ico

### Opción 2: Desde imagen con ImageMagick
```powershell
# Instalar ImageMagick
winget install ImageMagick.ImageMagick

# Convertir PNG a ICO
magick convert icon.png -define icon:auto-resize=256,128,64,48,32,16 build/icon.ico
```

## 📝 Personalizar el instalador

Edita `package-electron.json` para cambiar:
- Nombre de la aplicación
- Versión
- Icono
- Opciones del instalador

## ⚡ Ejecutar en modo desarrollo

```powershell
# Probar antes de compilar
npm run electron
```

## 📂 Estructura final

```
DEADball_Setup.exe (15-80 MB)
├── Incluye todo el juego
├── Crea acceso directo
└── Se instala en Archivos de programa
```

## 🎯 Ventajas de Electron

✅ **Una sola descarga**: El usuario solo descarga 1 archivo
✅ **Sin instalaciones previas**: No necesita Node.js
✅ **Profesional**: Se ve como una app nativa
✅ **Multi-plataforma**: Funciona en Windows, Mac, Linux
✅ **Actualizaciones fáciles**: Puedes agregar auto-update
✅ **Icono personalizado**: En escritorio y barra de tareas

## ⚠️ Desventajas

❌ **Tamaño grande**: El .exe pesa 80-150 MB (incluye Chromium)
❌ **Compilación lenta**: Puede tardar 5-15 minutos
❌ **Requiere más RAM**: ~200 MB más que un navegador normal

## 🔧 Solución de problemas

### Error: "electron-builder not found"
```powershell
npm install electron-builder --save-dev
```

### Error al compilar en Windows
```powershell
# Instalar herramientas de compilación
npm install --global windows-build-tools
```

### El ejecutable no arranca
- Verifica que backend/server.js funcione correctamente
- Revisa los logs en: `%AppData%\DEADball Ultra Mega\logs`

## 📦 Distribuir el juego

### Opción 1: Instalador (Recomendado)
Distribuye `DEADball Ultra Mega Setup.exe` (instalador)
- El usuario hace doble clic
- Se instala automáticamente
- Crea accesos directos

### Opción 2: Portable
Distribuye `DEADball Ultra Mega.exe` (portable)
- No requiere instalación
- Se ejecuta directamente
- Más pequeño

### Opción 3: ZIP completo
Comprime toda la carpeta `dist/win-unpacked/`
- El usuario descomprime
- Ejecuta DEADball Ultra Mega.exe
- Más flexible

## 🌐 Alternativa: Versión Web

Si el ejecutable es muy pesado, considera:
- Subir a un servidor web (Heroku, Vercel, etc.)
- Los usuarios acceden por navegador
- No requieren descargas

¿Quieres que configure algo específico?
