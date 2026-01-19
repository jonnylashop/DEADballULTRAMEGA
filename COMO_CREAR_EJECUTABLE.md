# Crear Icono Ejecutable para DEADball

Para convertir el archivo .bat en un .exe con icono personalizado:

## Método 1: Bat To Exe Converter (Gratis y Fácil)

1. **Descarga**: https://www.f2ko.de/en/b2e.php
2. **Abre** el programa Bat To Exe Converter
3. **Carga** el archivo `INICIAR_JUEGO.bat`
4. **Configuración**:
   - Executable format: Windows Application (sin consola) o Console (con consola)
   - Incluir archivos adicionales si es necesario
   - Icono: Selecciona un archivo .ico personalizado
   - Versión info: Completa los detalles del juego
5. **Compila** a .exe

## Método 2: PS2EXE (PowerShell a EXE)

```powershell
# Instalar módulo
Install-Module ps2exe -Scope CurrentUser

# Convertir a EXE
Invoke-ps2exe -InputFile "INICIAR_JUEGO.ps1" -OutputFile "DEADball.exe" -iconFile "icono.ico"
```

## Método 3: Crear con Node.js pkg (Empaquetado completo)

Ver archivo: CREAR_EJECUTABLE_COMPLETO.md

## Crear icono .ico

Si necesitas crear un icono:
1. Diseña tu logo en 256x256 px (PNG)
2. Usa https://icoconvert.com/ para convertir a .ico
3. O usa GIMP / Photoshop exportando como .ico

## Estructura recomendada para distribución:

```
DEADball_Game_v1.0/
├── DEADball.exe          ← Ejecutable principal (INICIAR_JUEGO.bat convertido)
├── INSTRUCCIONES.txt     ← Cómo jugar
├── frontend/             ← Archivos del juego
├── backend/              ← Servidor y lógica
└── icon.ico              ← Icono del juego
```
