console.log('🚀 PHOTO_SAVE.JS CARGADO');

// Variables globales para las fotos
window.photoPlayerId = null;
window.photoTeam = null;
window.photoBlob = null;

// Abrir modal
window.openPhotoModal = function(playerId, team) {
    console.log('Abriendo modal para jugador:', playerId, 'equipo:', team);
    window.photoPlayerId = playerId;
    window.photoTeam = team;
    window.photoBlob = null;
    document.getElementById('photoPreview').innerHTML = '📷';
    document.getElementById('photoPreview').style.backgroundImage = '';
    document.getElementById('playerPhotoModal').style.display = 'flex';
};

// Cerrar modal
window.closePhotoModal = function() {
    document.getElementById('playerPhotoModal').style.display = 'none';
    document.getElementById('playerPhotoInput').value = '';
    window.photoPlayerId = null;
    window.photoTeam = null;
    window.photoBlob = null;
};

// Procesar imagen
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, configurando listeners de foto...');

    // Botón Examinar
    const examinarBtn = document.getElementById('btn-examinar-foto');
    if (examinarBtn) {
        examinarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById('playerPhotoInput').click();
        });
        console.log('✅ Listener de examinar configurado');
    }

    // Botón Cancelar
    const cancelarBtn = document.getElementById('btn-cancelar-foto');
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.closePhotoModal();
        });
        console.log('✅ Listener de cancelar configurado');
    }

    const photoInput = document.getElementById('playerPhotoInput');
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                alert('Selecciona una imagen válida');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('Imagen muy grande. Máximo 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.getElementById('photoCanvas');
                    const ctx = canvas.getContext('2d');
                    const size = 300;
                    canvas.width = size;
                    canvas.height = size;

                    const minDim = Math.min(img.width, img.height);
                    const sx = (img.width - minDim) / 2;
                    const sy = (img.height - minDim) / 2;

                    ctx.clearRect(0, 0, size, size);
                    ctx.beginPath();
                    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

                    canvas.toBlob(function(blob) {
                        window.photoBlob = blob;
                        const url = URL.createObjectURL(blob);
                        const preview = document.getElementById('photoPreview');
                        preview.style.backgroundImage = `url(${url})`;
                        preview.style.backgroundSize = 'cover';
                        preview.style.backgroundPosition = 'center';
                        preview.innerHTML = '';
                        console.log('Imagen procesada y guardada');
                    }, 'image/jpeg', 0.9);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
        console.log('✅ Listener de cambio de archivo configurado');
    }

    // Guardar foto - listener directo
    const saveBtn = document.getElementById('btn-guardar-foto');
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            console.log('🔥 CLICK EN GUARDAR - INICIO');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            if (!window.photoBlob) {
                alert('Selecciona una imagen primero');
                return false;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                alert('Debes iniciar sesión');
                return false;
            }

            console.log('Enviando foto al servidor...');
            const formData = new FormData();
            formData.append('photo', window.photoBlob, 'player-photo.jpg');

            fetch('http://localhost:3000/api/upload/player-photo', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                })
                .then(r => {
                    console.log('Respuesta:', r.status);
                    return r.json();
                })
                .then(data => {
                    console.log('Data recibida:', data);
                    if (data.imageUrl) {
                        const selector = window.photoTeam === 'modal-edit' ?
                            `#modal-roster-table tr[data-player-id="${window.photoPlayerId}"] .player-photo, #modal-bench-table tr[data-player-id="${window.photoPlayerId}"] .player-photo` :
                            `#roster-${window.photoTeam} tr[data-player-id="${window.photoPlayerId}"] .player-photo, #bench-table-${window.photoTeam} tr[data-player-id="${window.photoPlayerId}"] .player-photo`;

                        const photoCell = document.querySelector(selector);
                        if (photoCell) {
                            photoCell.innerHTML = `<img src="http://localhost:3000${data.imageUrl}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">`;
                            photoCell.dataset.photoUrl = data.imageUrl;
                            console.log('✅ Foto actualizada');
                        } else {
                            console.warn('No se encontró celda:', selector);
                        }

                        window.closePhotoModal();
                    } else {
                        alert('Error al guardar');
                    }
                })
                .catch(err => {
                    console.error('Error:', err);
                    alert('Error al guardar la foto');
                });

            return false;
        }, true);
        console.log('✅ Listener de guardar configurado');
    } else {
        console.error('❌ No se encontró el botón btn-guardar-foto');
    }
});