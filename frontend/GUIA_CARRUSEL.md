# 🎠 Carrusel de Fotos - Guía Completa

## ✅ ¡El carrusel ya está instalado y funcionando!

Ahora cuando hagas clic en la imagen del estadio, se abre un **carrusel completo** con:
- ◀ ▶ Botones de navegación
- 🔴 Puntos indicadores (dots)
- 1/1 Contador de imágenes
- ⌨️ Navegación con teclado (flechas izq/der)

---

## 📸 Cómo Agregar Más Fotos al Carrusel

### Paso 1: Guarda tus imágenes

Coloca todas las fotos en `frontend/imagenes/`:
```
frontend/imagenes/
├── partido-campo.jpg    ← Ya tienes esta
├── foto2.jpg           ← Agrega más fotos
├── foto3.jpg
├── foto4.jpg
└── ...
```

### Paso 2: Edita el array de imágenes

En `menu.html`, busca la línea **~829** donde dice:
```javascript
const carouselImages = [
    {
        src: 'imagenes/partido-campo.jpg',
        alt: 'Partido en el campo'
    },
    // Agrega más imágenes aquí cuando las tengas:
```

### Paso 3: Agrega tus fotos

Descomenta y edita las líneas:
```javascript
const carouselImages = [
    {
        src: 'imagenes/partido-campo.jpg',
        alt: 'Partido en el campo'
    },
    {
        src: 'imagenes/foto2.jpg',
        alt: 'Calentamiento del equipo'
    },
    {
        src: 'imagenes/foto3.jpg',
        alt: 'Celebración del gol'
    },
    {
        src: 'imagenes/foto4.jpg',
        alt: 'Vista panorámica del estadio'
    },
    // Puedes agregar cuantas quieras
];
```

---

## 🎮 Controles del Carrusel

### 🖱️ Con el mouse:
- **◀ Botón Anterior**: Ir a la foto previa
- **▶ Botón Siguiente**: Ir a la foto siguiente
- **🔴 Dots**: Click directo a cualquier foto
- **✖ Cerrar**: Cerrar el carrusel
- **Click fuera**: También cierra

### ⌨️ Con el teclado:
- **← Flecha Izquierda**: Foto anterior
- **→ Flecha Derecha**: Foto siguiente
- **ESC**: Cerrar carrusel

---

## 🎨 Características

✅ **Contador**: Muestra "2 / 5" (foto actual / total)
✅ **Indicadores**: Puntos dorados para saber dónde estás
✅ **Animación**: Transición suave al cambiar foto
✅ **Botones inteligentes**: Se deshabilitan en primera/última foto
✅ **Responsive**: Se adapta al tamaño de pantalla
✅ **Tamaño**: 5/8 (62.5%) del ancho de pantalla

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Galería de un partido
```javascript
const carouselImages = [
    { src: 'imagenes/inicio-partido.jpg', alt: 'Inicio del partido' },
    { src: 'imagenes/primer-homerun.jpg', alt: 'Primer home run' },
    { src: 'imagenes/celebracion.jpg', alt: 'Celebración del equipo' },
    { src: 'imagenes/final-partido.jpg', alt: 'Final victorioso' },
];
```

### Ejemplo 2: Historia del equipo
```javascript
const carouselImages = [
    { src: 'imagenes/fundacion-1990.jpg', alt: 'Fundación 1990' },
    { src: 'imagenes/primer-campeonato-1995.jpg', alt: 'Primer campeonato' },
    { src: 'imagenes/estadio-actual.jpg', alt: 'Estadio actual' },
    { src: 'imagenes/equipo-2026.jpg', alt: 'Equipo 2026' },
];
```

### Ejemplo 3: Diferentes ángulos del estadio
```javascript
const carouselImages = [
    { src: 'imagenes/vista-frontal.jpg', alt: 'Vista frontal' },
    { src: 'imagenes/desde-grada.jpg', alt: 'Desde la grada' },
    { src: 'imagenes/campo-jugadores.jpg', alt: 'Campo desde jugadores' },
    { src: 'imagenes/panoramica.jpg', alt: 'Vista panorámica' },
];
```

---

## 🔧 Personalizaciones Avanzadas

### Cambiar tamaño de botones
En `menu.html`, busca `.carousel-btn` (~línea 477):
```css
.carousel-btn {
    width: 50px;    /* Más grande: 70px */
    height: 50px;   /* Más grande: 70px */
    font-size: 1.5rem; /* Más grande: 2rem */
}
```

### Cambiar colores de los botones
```css
.carousel-btn {
    background: rgba(251, 191, 36, 0.9); /* Dorado actual */
    /* Azul: rgba(14, 165, 233, 0.9) */
    /* Rojo: rgba(220, 38, 38, 0.9) */
    /* Verde: rgba(34, 197, 94, 0.9) */
}
```

### Cambiar posición del contador
```css
.carousel-counter {
    top: -50px;  /* Arriba */
    left: 0;     /* Izquierda */
    /* Cambiar a: */
    /* top: auto; bottom: -50px; */ /* Abajo */
    /* left: auto; right: 0; */     /* Derecha */
}
```

### Velocidad de transición
En `menu.html`, busca `updateCarouselImage()` (~línea 869):
```javascript
setTimeout(() => {
    img.src = carouselImages[currentImageIndex].src;
    img.alt = carouselImages[currentImageIndex].alt;
    img.classList.remove('changing');
}, 150); // Más lento: 300, Más rápido: 100
```

---

## 🐛 Solución de Problemas

### Las flechas no aparecen
- Verifica que las imágenes estén en `imagenes/`
- Los botones se ocultan si solo hay 1 foto

### Los dots no se ven
- Los dots solo aparecen si hay 2+ fotos en el array
- Verifica la sintaxis del array `carouselImages`

### Las fotos no cambian
- Abre la consola (F12) y busca errores
- Verifica que los nombres de archivo sean correctos
- Verifica que no haya comas faltantes en el array

### La imagen se ve borrosa
- Usa fotos de al menos 1920x1080 px
- Formatos recomendados: JPG (80-90% calidad)

---

## 📊 Comparativa: Antes vs Ahora

| Característica | Antes | Ahora |
|----------------|-------|-------|
| Imágenes | 1 sola | Múltiples ✅ |
| Navegación | ❌ | ◀ ▶ ✅ |
| Indicadores | ❌ | 🔴 Dots ✅ |
| Contador | ❌ | 1/5 ✅ |
| Teclado | Solo ESC | ← → ESC ✅ |
| Animación | ✅ | ✅ Mejorada |

---

## 🎯 Checklist de Implementación

- [x] Carrusel instalado
- [x] Botones anterior/siguiente
- [x] Indicadores (dots)
- [x] Contador de imágenes
- [x] Navegación con teclado
- [ ] Agregar tus fotos personalizadas
- [ ] Actualizar el array `carouselImages`
- [ ] Probar en el navegador

---

¿Necesitas ayuda para optimizar las fotos o personalizar más el carrusel?
