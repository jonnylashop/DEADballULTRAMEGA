// ============================================
// RUTAS DE PARTIDAS (GAMES)
// ============================================
// Rutas para guardar, cargar y gestionar partidas

const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const verificarToken = require('../middleware/auth');

// ============================================
// RUTA: POST /api/games/save
// Guardar una nueva partida
// ============================================
router.post('/save', verificarToken, async(req, res) => {
    try {
        const userId = req.usuario.id;
        const estadoPartida = req.body;

        // Validar que vengan los datos mínimos
        if (!estadoPartida.homeTeam || !estadoPartida.awayTeam) {
            return res.status(400).json({
                error: 'Faltan datos del equipo'
            });
        }

        const resultado = await Game.guardar(userId, estadoPartida);

        res.status(201).json({
            mensaje: resultado.message,
            gameId: resultado.id
        });
    } catch (error) {
        console.error('Error en save game:', error);
        res.status(500).json({
            error: error.message || 'Error al guardar partida'
        });
    }
});

// ============================================
// RUTA: GET /api/games
// Obtener historial de partidas del usuario
// ============================================
router.get('/', verificarToken, async(req, res) => {
    try {
        const userId = req.usuario.id;
        const limit = req.query.limit || 50;

        const partidas = await Game.obtenerPorUsuario(userId, limit);

        res.json({
            partidas: partidas
        });
    } catch (error) {
        console.error('Error en get games:', error);
        res.status(500).json({
            error: 'Error al obtener partidas'
        });
    }
});

// ============================================
// RUTA: GET /api/games/stats
// Obtener estadísticas del usuario
// ============================================
router.get('/stats', verificarToken, async(req, res) => {
    try {
        const userId = req.usuario.id;
        const stats = await Game.obtenerEstadisticas(userId);

        res.json({
            estadisticas: stats
        });
    } catch (error) {
        console.error('Error en stats:', error);
        res.status(500).json({
            error: 'Error al obtener estadísticas'
        });
    }
});

// ============================================
// RUTA: GET /api/games/hall-of-fame
// Obtener Hall of Fame (ranking de jugadores)
// ============================================
router.get('/hall-of-fame', async(req, res) => {
    try {
        const limit = req.query.limit || 10;
        const ranking = await Game.obtenerHallOfFame(limit);

        res.json({
            ranking: ranking
        });
    } catch (error) {
        console.error('Error en hall of fame:', error);
        res.status(500).json({
            error: 'Error al obtener ranking'
        });
    }
});

// ============================================
// RUTA: GET /api/games/:id
// Obtener una partida específica para cargar
// ============================================
router.get('/:id', verificarToken, async(req, res) => {
    try {
        const gameId = req.params.id;
        const userId = req.usuario.id;

        const partida = await Game.obtenerPorId(gameId, userId);

        res.json({
            partida: partida
        });
    } catch (error) {
        console.error('Error en get game by id:', error);
        res.status(404).json({
            error: error.message || 'Partida no encontrada'
        });
    }
});

// ============================================
// RUTA: DELETE /api/games/:id
// Eliminar una partida guardada
// ============================================
router.delete('/:id', verificarToken, async(req, res) => {
    try {
        const gameId = req.params.id;
        const userId = req.usuario.id;

        const resultado = await Game.eliminar(gameId, userId);

        res.json({
            mensaje: resultado.message
        });
    } catch (error) {
        console.error('Error en delete game:', error);
        res.status(404).json({
            error: error.message || 'Error al eliminar partida'
        });
    }
});

// ============================================
// RUTA: PUT /api/games/:id/complete
// Marcar partida como completada
// ============================================
router.put('/:id/complete', verificarToken, async(req, res) => {
    try {
        const gameId = req.params.id;
        const userId = req.usuario.id;
        const { winner, homeScore, awayScore } = req.body;

        if (!winner || homeScore === undefined || awayScore === undefined) {
            return res.status(400).json({
                error: 'Faltan datos para completar la partida'
            });
        }

        const resultado = await Game.marcarCompletada(gameId, userId, winner, homeScore, awayScore);

        res.json({
            mensaje: resultado.message
        });
    } catch (error) {
        console.error('Error en complete game:', error);
        res.status(500).json({
            error: error.message || 'Error al completar partida'
        });
    }
});

// Exportar el router
module.exports = router;