# 🎨 Imágenes Sugeridas para el Menú

## ✅ Configuración Actual:

### Lado IZQUIERDO:
1. **Logo DEADball** - Diseño con gradiente rojo 🔴⚾
2. **Campo Zelaia** - `zelaia.jpg` ✅ Ya configurada

### Lado DERECHO:
3. **Enlace CB Storos** - Diseño con gradiente azul 🌐
4. **Trofeo Champion** - Diseño con gradiente dorado 🏆

---

## 🖼️ Sugerencias de Imágenes Reales (Opcionales)

Si quieres reemplazar los diseños por imágenes reales:

### 1. Logo DEADball (Imagen 1)
**Buscar:**
- Logo oficial del juego DEADball
- Logo de tu equipo
- Diseño personalizado

**Dónde conseguir:**
- Canva.com (crea un logo gratis)
- Logo Makr
- Fiverr (contratar diseñador)

**Especificaciones:**
- Tamaño: 500x500 px mínimo
- Formato: PNG con fondo transparente
- Guardar como: `frontend/imagenes/deadball-logo.png`

### 2. Campo Zelaia (Imagen 2) ✅
Ya está usando: `zelaia.jpg`

### 3. Logo CB Storos (Imagen 3)
**Buscar:**
- Logo oficial de CB Storos
- Banner del sitio web
- Captura de pantalla de la web

**Dónde conseguir:**
- https://www.cbstoros.com (logo del sitio)
- Redes sociales del club
- Captura de pantalla

**Especificaciones:**
- Tamaño: 500x500 px
- Formato: PNG o JPG
- Guardar como: `frontend/imagenes/cbstoros-logo.png`

### 4. Trofeo/Campeonato (Imagen 4)
**Buscar:**
- Foto de trofeo de campeonato
- Copa/medalla ganada
- Logo de la liga/competición

**Dónde descargar gratis:**
- Unsplash.com (busca "trophy baseball")
- Pexels.com (busca "baseball trophy")
- Pixabay.com (busca "baseball award")

**Especificaciones:**
- Tamaño: 500x500 px
- Formato: JPG o PNG
- Guardar como: `frontend/imagenes/trophy.jpg`

---

## 🔄 Cómo Reemplazar por Imágenes Reales

Una vez descargadas las imágenes, edita `menu.html`:

### Imagen 1: Logo DEADball
```html
<!-- Cambiar de esto: -->
<div class="side-image placeholder deadball-logo">
    <div class="icon">⚾</div>
    <div class="label">DEADball</div>
</div>

<!-- A esto: -->
<div class="side-image" title="DEADball Ultra Mega">
    <img src="imagenes/deadball-logo.png" alt="DEADball Logo">
</div>
```

### Imagen 2: Zelaia ✅ (Ya está bien)

### Imagen 3: CB Storos
```html
<!-- Cambiar de esto: -->
<div class="side-image external-link placeholder cbstoros-web">
    <div class="icon">🌐</div>
    <div class="label">CB Storos</div>
</div>

<!-- A esto: -->
<div class="side-image external-link" title="Visita CB Storos">
    <img src="imagenes/cbstoros-logo.png" alt="CB Storos">
</div>
```

### Imagen 4: Trofeo
```html
<!-- Cambiar de esto: -->
<div class="side-image placeholder trophy">
    <div class="icon">🏆</div>
    <div class="label">Champion</div>
</div>

<!-- A esto: -->
<div class="side-image" title="Campeón">
    <img src="imagenes/trophy.jpg" alt="Trofeo">
</div>
```

---

## 🎨 Colores Actuales (por si quieres ajustar)

- **Logo DEADball**: Gradiente rojo (#dc2626 → #991b1b)
- **CB Storos**: Gradiente azul cian (#0891b2 → #0e7490)
- **Trofeo**: Gradiente dorado (#fbbf24 → #f59e0b)

---

## 💡 Tip: Optimizar Imágenes

Antes de usar las imágenes, optimízalas:

**Herramientas online:**
- TinyPNG.com - Comprime sin perder calidad
- Squoosh.app - Optimizador de Google
- iLoveIMG.com - Redimensionar y comprimir

**Tamaño ideal:** 100-200 KB por imagen

---

## ✨ Estado Actual

Las imágenes se ven perfectamente con los diseños actuales:
- ✅ Colores corporativos
- ✅ Hover animado
- ✅ Link a CB Storos funcionando
- ✅ Responsive (se oculta en móviles)

**No es necesario cambiar nada si te gusta cómo se ve ahora.**

¿Quieres que descargue imágenes específicas o que ajuste algo más?
