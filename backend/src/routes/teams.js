// ============================================
// RUTAS: TEAMS (Gestión de equipos)
// ============================================
// Endpoints para crear, leer, actualizar y eliminar equipos

const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const verificarToken = require('../middleware/auth');

// ============================================
// RUTA: POST /api/teams
// Crear un nuevo equipo
// ============================================
router.post('/', verificarToken, async(req, res) => {
    try {
        const userId = req.usuario.id;
        const { teamName, players } = req.body;

        // Validar datos requeridos
        if (!teamName || !players) {
            return res.status(400).json({
                error: 'Nombre del equipo y jugadores son obligatorios'
            });
        }

        const nuevoEquipo = await Team.crear(userId, { teamName, players });

        res.status(201).json({
            mensaje: 'Equipo creado exitosamente',
            equipo: nuevoEquipo
        });
    } catch (error) {
        console.error('Error en POST /teams:', error);
        res.status(400).json({
            error: error.message || 'Error al crear equipo'
        });
    }
});

// ============================================
// RUTA: GET /api/teams
// Obtener todos los equipos del usuario
// ============================================
router.get('/', verificarToken, async(req, res) => {
    try {
        const userId = req.usuario.id;
        const equipos = await Team.obtenerPorUsuario(userId);

        res.json({
            equipos: equipos,
            total: equipos.length
        });
    } catch (error) {
        console.error('Error en GET /teams:', error);
        res.status(500).json({
            error: error.message || 'Error al obtener equipos'
        });
    }
});

// ============================================
// RUTA: GET /api/teams/:id
// Obtener un equipo específico por ID
// ============================================
router.get('/:id', verificarToken, async(req, res) => {
    try {
        const userId = req.usuario.id;
        const teamId = req.params.id;

        const equipo = await Team.obtenerPorId(teamId, userId);

        res.json({
            equipo: equipo
        });
    } catch (error) {
        console.error('Error en GET /teams/:id:', error);
        res.status(404).json({
            error: error.message || 'Error al obtener equipo'
        });
    }
});

// ============================================
// RUTA: PUT /api/teams/:id
// Actualizar un equipo
// ============================================
router.put('/:id', verificarToken, async(req, res) => {
    try {
        const userId = req.usuario.id;
        const teamId = req.params.id;
        const { teamName, players } = req.body;

        await Team.actualizar(teamId, userId, { teamName, players });

        res.json({
            mensaje: 'Equipo actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error en PUT /teams/:id:', error);
        res.status(400).json({
            error: error.message || 'Error al actualizar equipo'
        });
    }
});

// ============================================
// RUTA: DELETE /api/teams/:id
// Eliminar un equipo
// ============================================
router.delete('/:id', verificarToken, async(req, res) => {
    try {
        const userId = req.usuario.id;
        const teamId = req.params.id;

        await Team.eliminar(teamId, userId);

        res.json({
            mensaje: 'Equipo eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error en DELETE /teams/:id:', error);
        res.status(400).json({
            error: error.message || 'Error al eliminar equipo'
        });
    }
});

module.exports = router;