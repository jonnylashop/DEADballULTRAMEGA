# 🎵 Guía de Integración de Sonidos

## Sonidos ya Implementados

El sistema de audio está completamente funcional con sonidos sintéticos. Para agregar archivos de audio reales, simplemente coloca los archivos MP3 en la carpeta `audio/`.

## Cómo Reproducir Sonidos en el Código

El sistema de audio se llama `AudioSystem` y tiene un método simple `play(nombreSonido)`.

### Ejemplos de Uso

```javascript
// Reproducir un strike
AudioSystem.play('strike');

// Reproducir una bola
AudioSystem.play('ball');

// Reproducir un hit
AudioSystem.play('hit');

// Reproducir un home run
AudioSystem.play('homerun');

// Reproducir un out
AudioSystem.play('out');

// Reproducir foul
AudioSystem.play('foul');

// Reproducir walk (base por bolas)
AudioSystem.play('walk');

// Reproducir strikeout
AudioSystem.play('strikeout');

// Reproducir catch (atrapada)
AudioSystem.play('catch');

// Reproducir ovación del público
AudioSystem.play('crowd_cheer');

// Reproducir decepción del público
AudioSystem.play('crowd_aww');

// Sonidos de UI
AudioSystem.play('click');
AudioSystem.play('dice_roll');
```

## Lugares Sugeridos para Agregar Sonidos

### 1. Cuando se lanza un dado
```javascript
// En la función de tirar dados, agregar:
AudioSystem.play('dice_roll');
```

### 2. Cuando hay un strike
```javascript
// Buscar donde se incrementan strikes:
gameState.strikes++;
AudioSystem.play('strike');

// Si es strikeout (3 strikes):
if (gameState.strikes >= 3) {
    AudioSystem.play('strikeout');
}
```

### 3. Cuando hay una bola
```javascript
// Buscar donde se incrementan balls:
gameState.balls++;
AudioSystem.play('ball');

// Si es walk (4 bolas):
if (gameState.balls >= 4) {
    AudioSystem.play('walk');
    AudioSystem.play('crowd_cheer');
}
```

### 4. Cuando hay un out
```javascript
// En confirmAndNextBatter() y lugares similares:
gameState.outs++;
AudioSystem.play('out');

// Si es el tercer out:
if (gameState.outs >= 3) {
    AudioSystem.play('crowd_aww');
}
```

### 5. Cuando hay un hit
```javascript
// En funciones de resolución de bateo:
AudioSystem.play('hit');
```

### 6. Cuando hay un home run
```javascript
// Cuando se detecta HR:
AudioSystem.play('homerun');
setTimeout(() => {
    AudioSystem.play('crowd_cheer');
}, 500);
```

### 7. Cuando hay un foul
```javascript
// En resolución de foul:
AudioSystem.play('foul');
```

### 8. Cuando se atrapa una bola
```javascript
// En funciones de fly out o catches:
AudioSystem.play('catch');
```

### 9. Cuando una carrera anota
```javascript
// En funciones de anotación:
AudioSystem.play('crowd_cheer');
```

### 10. Clicks en botones
```javascript
// En event listeners de botones:
button.addEventListener('click', () => {
    AudioSystem.play('click');
    // ... resto del código
});
```

## Integración Automática en script_new.js

Para una integración rápida, busca estos patrones en `script_new.js`:

1. **Outs**: Busca `gameState.outs++` (20+ lugares)
2. **Strikes**: Busca `gameState.strikes++`
3. **Balls**: Busca `gameState.balls++`
4. **Home Runs**: Busca referencias a "HR", "home run", o "homerun"
5. **Hits**: Busca donde se incremente gameState.hits

## Ejemplo Completo de Integración

```javascript
// ANTES:
function confirmAndNextBatter() {
    console.log('[GAME] Confirmando jugada y avanzando');
    gameState.outs++;
    
    if (gameState.outs >= 3) {
        changeInning();
    } else {
        nextBatter();
    }
}

// DESPUÉS:
function confirmAndNextBatter() {
    console.log('[GAME] Confirmando jugada y avanzando');
    gameState.outs++;
    AudioSystem.play('out');  // ← AGREGAR ESTA LÍNEA
    
    if (gameState.outs >= 3) {
        AudioSystem.play('crowd_aww');  // ← AGREGAR ESTA LÍNEA
        changeInning();
    } else {
        nextBatter();
    }
}
```

## Control de Música

```javascript
// Iniciar música cuando empieza el juego
AudioSystem.playMusic();

// Pausar música
AudioSystem.pauseMusic();
```

## Notas Importantes

1. Los sonidos se reproducen **automáticamente en sintético** si no hay archivos MP3
2. Los controles de volumen están en la esquina superior derecha
3. Los usuarios pueden desactivar el audio completamente
4. La configuración se guarda en localStorage
5. No es necesario verificar si AudioSystem existe, siempre está disponible
