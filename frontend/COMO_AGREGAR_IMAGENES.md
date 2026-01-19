# 🖼️ Cómo Agregar Imágenes al Menú

Se han agregado 4 espacios para imágenes en los laterales del menú principal.

## 📍 Ubicación de las imágenes:

```
LATERAL IZQUIERDO:              LATERAL DERECHO:
┌─────────┐                     ┌─────────┐
│ Imagen 1│                     │ Imagen 3│ 🔗 (enlace web)
│    ⚾   │                     │    🌐   │
└─────────┘                     └─────────┘
    ↓                               ↓
┌─────────┐                     ┌─────────┐
│ Imagen 2│                     │ Imagen 4│
│   🏟️   │                     │    🏆   │
└─────────┘                     └─────────┘
```

## 🎨 Cómo reemplazar los emojis por tus imágenes:

### 1. Prepara tus imágenes
- Formato: PNG, JPG o GIF
- Tamaño recomendado: 300x300 px (mínimo)
- Guárdalas en: `frontend/imagenes/`

Ejemplo:
```
frontend/imagenes/
├── logo-equipo.png
├── estadio.jpg
├── web-icono.png
└── trofeo.png
```

### 2. Edita menu.html

Busca esta línea (aproximadamente línea 300):
```html
<!-- Imagen 1: Placeholder (puedes cambiar por tu imagen) -->
<div class="side-image placeholder" title="Logo del equipo">
    ⚾
</div>
```

Cámbiala por:
```html
<!-- Imagen 1: Tu logo -->
<div class="side-image" title="Logo del equipo">
    <img src="imagenes/logo-equipo.png" alt="Logo">
</div>
```

### 3. Hacer lo mismo con las otras 3 imágenes

**Imagen 2 (Estadio):**
```html
<div class="side-image" title="Estadio">
    <img src="imagenes/estadio.jpg" alt="Estadio">
</div>
```

**Imagen 3 (Enlace web) - ⚠️ IMPORTANTE:**
```html
<a href="https://TU-WEB-AQUI.com" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
    <div class="side-image external-link" title="Visita nuestra web">
        <img src="imagenes/web-icono.png" alt="Web">
    </div>
</a>
```
⚠️ Cambia `https://TU-WEB-AQUI.com` por tu URL real.

**Imagen 4 (Trofeo):**
```html
<div class="side-image" title="Trofeo">
    <img src="imagenes/trofeo.png" alt="Trofeo">
</div>
```

## 🌐 Configurar el enlace web (Imagen 3)

En menu.html, busca (línea ~315):
```html
<a href="https://www.example.com" target="_blank"...
```

Cámbialo por tu web:
```html
<a href="https://tu-web-real.com" target="_blank"...
```

O si quieres enlazar a redes sociales:
- Twitter: `https://twitter.com/tu_usuario`
- YouTube: `https://youtube.com/@tu_canal`
- Discord: `https://discord.gg/tu_invite`
- GitHub: `https://github.com/tu_usuario`

## 🎯 Ejemplo completo con imágenes reales:

```html
<!-- LATERAL IZQUIERDO -->
<div class="side-images left">
    <div class="side-image" title="DEADball Logo">
        <img src="imagenes/deadball-logo.png" alt="Logo">
    </div>
    <div class="side-image" title="Campo de juego">
        <img src="imagenes/campo-baseball.jpg" alt="Campo">
    </div>
</div>

<!-- LATERAL DERECHO -->
<div class="side-images right">
    <!-- ENLACE A TU WEB -->
    <a href="https://deadball-game.com" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
        <div class="side-image external-link" title="Visita deadball-game.com">
            <img src="imagenes/website-icon.png" alt="Web">
        </div>
    </a>
    <div class="side-image" title="Campeón 2026">
        <img src="imagenes/campeon.png" alt="Trofeo">
    </div>
</div>
```

## 💡 Tips adicionales:

1. **Mantener emojis temporalmente:**
   Si aún no tienes las imágenes, los emojis se ven bien como placeholder.

2. **Agregar efectos de hover:**
   Ya están incluidos - las imágenes se agrandan al pasar el mouse.

3. **Indicador de enlace:**
   La imagen 3 muestra un ícono 🔗 para indicar que es clickeable.

4. **Responsive:**
   Las imágenes se ocultan automáticamente en pantallas pequeñas.

5. **Cambiar cantidad de imágenes:**
   Puedes agregar más copiando el bloque `<div class="side-image">`.

## 📐 Tamaños personalizados:

Si quieres imágenes más grandes o pequeñas, busca en menu.html (línea ~295):
```css
.side-image {
    width: 120px;   /* ← Cambia esto */
    height: 120px;  /* ← Y esto */
    ...
}
```

## 🔄 Ver los cambios:

1. Guarda el archivo menu.html
2. Recarga la página en el navegador (F5)
3. Las imágenes deberían aparecer a los lados

---

¿Necesitas ayuda para optimizar las imágenes o cambiar más estilos?
