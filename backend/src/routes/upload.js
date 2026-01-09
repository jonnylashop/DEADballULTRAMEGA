// ============================================
// RUTAS: UPLOAD (Subida de imágenes)
// ============================================
// Endpoint para subir fotos de jugadores

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verificarToken = require('../middleware/auth');

// Crear directorio para imágenes si no existe
const uploadsDir = path.join(__dirname, '../../uploads/players');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar multer para almacenamiento
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function(req, file, cb) {
        // Generar nombre único: userId_timestamp_random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `player_${req.usuario.id}_${uniqueSuffix}${ext}`);
    }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
    },
    fileFilter: fileFilter
});

// ============================================
// RUTA: POST /api/upload/player-photo
// Subir foto de un jugador
// ============================================
router.post('/player-photo', verificarToken, upload.single('photo'), async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No se proporcionó ninguna imagen'
            });
        }

        // URL relativa para acceder a la imagen
        const imageUrl = `/uploads/players/${req.file.filename}`;

        res.status(201).json({
            mensaje: 'Imagen subida exitosamente',
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({
            error: error.message || 'Error al subir imagen'
        });
    }
});

// ============================================
// RUTA: DELETE /api/upload/player-photo/:filename
// Eliminar foto de un jugador
// ============================================
router.delete('/player-photo/:filename', verificarToken, async(req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadsDir, filename);

        // Verificar que el archivo pertenece al usuario
        if (!filename.startsWith(`player_${req.usuario.id}_`)) {
            return res.status(403).json({
                error: 'No tienes permiso para eliminar esta imagen'
            });
        }

        // Eliminar archivo
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({
                mensaje: 'Imagen eliminada exitosamente'
            });
        } else {
            res.status(404).json({
                error: 'Imagen no encontrada'
            });
        }
    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        res.status(500).json({
            error: error.message || 'Error al eliminar imagen'
        });
    }
});

module.exports = router;