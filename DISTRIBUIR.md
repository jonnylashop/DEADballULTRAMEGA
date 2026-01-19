# 📦 Cómo Distribuir DEADball Ultra Mega

## Pasos para preparar la distribución:

### 1. Limpiar archivos innecesarios

```powershell
# Eliminar node_modules para reducir tamaño
Remove-Item -Recurse -Force backend/node_modules -ErrorAction SilentlyContinue

# Eliminar base de datos de prueba (se creará nueva en cada instalación)
Remove-Item backend/deadball.db -ErrorAction SilentlyContinue

# Eliminar archivos de backup
Remove-Item *.backup* -ErrorAction SilentlyContinue
```

### 2. Crear el ZIP para distribuir

```powershell
# Comprimir todo el proyecto
Compress-Archive -Path * -DestinationPath "DEADball_UltraMega_v1.0.zip" -Force
```

### 3. Archivos que DEBE incluir el ZIP:

```
DEADball_UltraMega_v1.0.zip
├── 📄 LEEME.txt                          ← IMPORTANTE: Primera lectura
├── 📄 INSTRUCCIONES_INSTALACION.txt      ← Ayuda detallada
├── ▶️ INICIAR_JUEGO.bat                  ← Script principal
├── 🌐 ABRIR_JUEGO.bat                    ← Abrir navegador
├── ⏹️ DETENER_SERVIDOR.bat               ← Cerrar servidor
├── 📁 frontend/                          ← Todos los archivos
│   ├── index.html
│   ├── style.css
│   ├── script_new.js
│   └── ...
└── 📁 backend/                           ← Todos los archivos
    ├── server.js
    ├── package.json
    ├── src/
    └── ...
```

### 4. Archivos que NO debes incluir:

- ❌ `node_modules/` (se instala automáticamente)
- ❌ `deadball.db` (base de datos personal)
- ❌ `.git/` (historial de git)
- ❌ `*.backup*` (archivos de respaldo)
- ❌ `dist/` (compilaciones anteriores)

### 5. Crear .gitignore para no subir cosas innecesarias

Si usas Git, el archivo ya existe. Si subes a otra plataforma, excluye manualmente.

## 🚀 Opciones de Distribución:

### Opción A: Google Drive / Dropbox
1. Sube el ZIP
2. Genera link público
3. Comparte el link

### Opción B: WeTransfer
1. Ve a https://wetransfer.com/
2. Sube el ZIP (gratis hasta 2GB)
3. Envía el link por email

### Opción C: GitHub Releases
1. Crea un repositorio en GitHub
2. Crea un Release
3. Adjunta el ZIP

### Opción D: itch.io (para juegos)
1. Crea cuenta en https://itch.io/
2. Sube como juego HTML5
3. Puedes venderlo o distribuirlo gratis

## 📝 Mensaje para enviar a los usuarios:

```
🎮 DEADball Ultra Mega - Juego de Béisbol

📥 DESCARGAR:
[Link al ZIP aquí]

⚙️ REQUISITOS:
- Node.js 16+ (descarga en https://nodejs.org/)
- Windows 10/11, Mac o Linux

🚀 INSTALACIÓN:
1. Descomprime el ZIP
2. Doble clic en INICIAR_JUEGO.bat
3. Espera a que se instale (solo la primera vez)
4. ¡A jugar!

📖 Lee el archivo LEEME.txt para más detalles

¿Problemas? Revisa INSTRUCCIONES_INSTALACION.txt
```

## 🎯 Checklist antes de distribuir:

- [ ] LEEME.txt está actualizado
- [ ] INICIAR_JUEGO.bat funciona correctamente
- [ ] No incluyes node_modules en el ZIP
- [ ] No incluyes tu base de datos personal
- [ ] Probaste en otra computadora (si es posible)
- [ ] Tamaño del ZIP es razonable (~5-10 MB sin node_modules)

## 📊 Tamaño estimado:

- **Sin node_modules**: ~5-10 MB ✅
- **Con node_modules**: ~100-200 MB ❌ (no recomendado)

## 🔧 Script automatizado para preparar distribución:

```powershell
# Ejecuta esto para preparar todo automáticamente
cd d:\repositorioak\DEADballULTRAMEGA

# Limpiar
Remove-Item -Recurse -Force backend/node_modules -ErrorAction SilentlyContinue
Remove-Item backend/deadball.db -ErrorAction SilentlyContinue
Remove-Item *.backup* -ErrorAction SilentlyContinue

# Crear ZIP
$fecha = Get-Date -Format "yyyy-MM-dd"
$nombreZip = "DEADball_UltraMega_$fecha.zip"
Compress-Archive -Path LEEME.txt,INSTRUCCIONES_INSTALACION.txt,INICIAR_JUEGO.bat,ABRIR_JUEGO.bat,DETENER_SERVIDOR.bat,frontend,backend -DestinationPath $nombreZip -Force

Write-Host "✅ Listo! Archivo creado: $nombreZip" -ForegroundColor Green
Write-Host "📦 Tamaño: $((Get-Item $nombreZip).Length / 1MB) MB" -ForegroundColor Cyan
```

¡Listo para distribuir! 🎉
