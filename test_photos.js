// Script de diagnóstico para fotos
console.log('=== DIAGNÓSTICO DE FOTOS ===');

// Verificar si refreshPlayerPhotos existe
if (typeof refreshPlayerPhotos === 'function') {
    console.log('✅ refreshPlayerPhotos está definida');
    refreshPlayerPhotos();
} else {
    console.log('❌ refreshPlayerPhotos NO está definida');
}

// Verificar celdas de foto
const photoCells = document.querySelectorAll('.player-photo');
console.log(📊 Celdas de foto encontradas: );
photoCells.forEach((cell, i) => {
    console.log(Celda :, cell.innerHTML);
});
