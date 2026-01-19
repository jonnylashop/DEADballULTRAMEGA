# 📸 Instrucciones: Agregar Imagen del Partido

## ⚠️ IMPORTANTE: Debes guardar la imagen adjunta

### Pasos:

1. **Guarda la imagen del partido** que enviaste en:
   ```
   frontend/imagenes/partido-campo.jpg
   ```

2. **Nombre exacto del archivo:** `partido-campo.jpg`

3. **Ubicación:** Debe estar junto a `zelaia.jpg`

---

## ✅ Cómo funciona:

### 🖱️ Al hacer clic en la imagen del estadio (izquierda):
- Se abre un modal (ventana emergente)
- Muestra la imagen del partido a gran tamaño
- Ocupa 5/8 (62.5%) de la pantalla
- Fondo oscuro semitransparente

### 🔴 Botón "✖ Cerrar":
- Ubicado arriba a la derecha
- Cierra el modal al hacer clic

### 🎯 Otras formas de cerrar:
- Hacer clic fuera de la imagen (en el fondo oscuro)
- Presionar la tecla **ESC**

### 👁️ Indicadores visuales:
- Icono de lupa 🔍 aparece al pasar el mouse
- Cursor cambia a "zoom-in"
- Título: "Campo Zelaia - Click para ampliar"

---

## 🎨 Características del modal:

- ✨ Animación de entrada (zoom in + fade)
- 🎨 Borde dorado (#fbbf24)
- 🌑 Fondo oscuro con blur
- 📐 Tamaño: 62.5% de ancho (5/8)
- 📱 Responsive (se adapta a la pantalla)

---

## 🔧 Personalización (opcional):

### Cambiar tamaño del modal:
En menu.html, busca (línea ~420):
```css
.modal-content {
    max-width: 62.5%; /* 5/8 de la pantalla */
    ...
}
```

Cambia `62.5%` por:
- `50%` = 1/2 de la pantalla
- `75%` = 3/4 de la pantalla
- `87.5%` = 7/8 de la pantalla

### Cambiar la imagen mostrada:
En menu.html, busca (línea ~440):
```html
<img src="imagenes/partido-campo.jpg" alt="Partido en el campo">
```

Cambia `partido-campo.jpg` por el nombre de tu imagen.

---

## 📂 Estructura esperada:

```
frontend/
├── menu.html
└── imagenes/
    ├── zelaia.jpg          ✅ (miniatura - ya existe)
    └── partido-campo.jpg   ⚠️ (modal - DEBES GUARDARLA)
```

---

## 🧪 Probar:

1. Guarda `partido-campo.jpg` en `frontend/imagenes/`
2. Abre `menu.html` en el navegador
3. Haz clic en la imagen del estadio (lado izquierdo)
4. Debería abrirse el modal con la imagen grande

---

## ❌ Si no funciona:

**Problema:** La imagen no se muestra en el modal
- **Solución:** Verifica que el archivo se llame exactamente `partido-campo.jpg`
- **Solución:** Verifica que esté en `frontend/imagenes/`

**Problema:** No se abre el modal
- **Solución:** Abre la consola del navegador (F12) y busca errores

**Problema:** La imagen se ve pixelada
- **Solución:** Usa una imagen de mayor resolución (mínimo 1920x1080 px)

---

¿Todo listo? ¡Guarda la imagen y prueba! 🎮
