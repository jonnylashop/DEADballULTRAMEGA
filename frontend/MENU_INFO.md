# Menú Principal - DEADball ULTRAMEGA

## Acceso al Juego

1. **Abrir menu.html** - Página de inicio con el menú principal
2. **Hacer clic en "Nuevo Juego"** - Te lleva a index.html (el juego)
3. **Botón "← Menú Principal"** (esquina superior izquierda del juego) - Volver al menú

## Diseño de Pantalla Fija

El juego ahora está diseñado para **pantallas grandes con diseño fijo**:

- **Ancho total**: 100vw (pantalla completa)
- **Columnas laterales**: 320px cada una (ancho fijo)
- **Columna central**: Resto del espacio disponible
- **Sin scroll horizontal**: Diseño fijo sin adaptación responsive
- **Sin scroll vertical**: Todo visible en pantalla

### Cambios Realizados

1. ✅ Menú principal (menu.html) con diseño moderno
2. ✅ Botón de retorno al menú en el juego
3. ✅ CSS modificado de flex adaptativo a diseño fijo
4. ✅ Anchos fijos para columnas (320px laterales)
5. ✅ Sin scroll - diseño de pantalla completa

## Estructura de Archivos

```
frontend/
├── menu.html          # Menú principal (NUEVO)
├── index.html         # Juego principal (con botón de menú)
├── style.css          # Estilos (diseño fijo)
└── script_clean.js    # Lógica del juego (sin errores)
```

## Próximas Funcionalidades del Menú

- [ ] Cargar Partida
- [ ] Estadísticas
- [ ] Configuración
- [ ] Sistema de login integrado
