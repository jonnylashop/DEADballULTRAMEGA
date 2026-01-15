// ============================================
// MODELO: TEAM (Equipos guardados del usuario)
// ============================================
// Este modelo gestiona los equipos personalizados que cada usuario crea

const db = require('../config/database');

class Team {
    // ============================================
    // CREAR UN NUEVO EQUIPO
    // ============================================
    // Guarda un equipo completo con sus 9 jugadores
    static async crear(userId, teamData) {
        try {
            const {
                teamName, // Nombre del equipo
                players // Array de 9 jugadores con sus stats
            } = teamData;

            // Validar que hay al menos 9 jugadores titulares
            if (!players || players.length < 9) {
                throw new Error('Un equipo debe tener al menos 9 jugadores titulares');
            }

            // Validar que el nombre no esté vacío
            if (!teamName || teamName.trim().length === 0) {
                throw new Error('El equipo debe tener un nombre');
            }

            // Convertir el array de jugadores a JSON para guardarlo en la BD
            const playersJson = JSON.stringify(players);

            // Insertar en la base de datos
            const resultado = await db.run(
                `INSERT INTO teams (user_id, team_name, players, created_at, updated_at)
                 VALUES (?, ?, ?, datetime('now'), datetime('now'))`, [userId, teamName.trim(), playersJson]
            );

            return {
                id: resultado.lastID,
                teamName: teamName.trim(),
                players: players,
                mensaje: 'Equipo creado exitosamente'
            };
        } catch (error) {
            throw new Error('Error al crear equipo: ' + error.message);
        }
    }

    // ============================================
    // OBTENER TODOS LOS EQUIPOS DE UN USUARIO
    // ============================================
    static async obtenerPorUsuario(userId) {
        try {
            const equipos = await db.all(
                `SELECT id, team_name, players, created_at, updated_at 
                 FROM teams 
                 WHERE user_id = ? 
                 ORDER BY created_at DESC`, [userId]
            );

            // Parsear el JSON de jugadores en cada equipo
            return equipos.map(equipo => ({
                id: equipo.id,
                teamName: equipo.team_name,
                players: JSON.parse(equipo.players),
                createdAt: equipo.created_at,
                updatedAt: equipo.updated_at
            }));
        } catch (error) {
            throw new Error('Error al obtener equipos: ' + error.message);
        }
    }

    // ============================================
    // OBTENER UN EQUIPO POR ID
    // ============================================
    static async obtenerPorId(teamId, userId) {
        try {
            const equipo = await db.get(
                `SELECT id, team_name, players, created_at, updated_at 
                 FROM teams 
                 WHERE id = ? AND user_id = ?`, [teamId, userId]
            );

            if (!equipo) {
                throw new Error('Equipo no encontrado');
            }

            return {
                id: equipo.id,
                teamName: equipo.team_name,
                players: JSON.parse(equipo.players),
                createdAt: equipo.created_at,
                updatedAt: equipo.updated_at
            };
        } catch (error) {
            throw new Error('Error al obtener equipo: ' + error.message);
        }
    }

    // ============================================
    // ACTUALIZAR UN EQUIPO
    // ============================================
    static async actualizar(teamId, userId, teamData) {
        try {
            const { teamName, players } = teamData;

            // Validaciones - Permitir 9 o más jugadores (titulares + banquillo)
            if (players && players.length < 9) {
                throw new Error('Un equipo debe tener al menos 9 jugadores titulares');
            }

            const playersJson = JSON.stringify(players);

            const resultado = await db.run(
                `UPDATE teams 
                 SET team_name = ?, players = ?, updated_at = datetime('now')
                 WHERE id = ? AND user_id = ?`, [teamName, playersJson, teamId, userId]
            );

            if (resultado.changes === 0) {
                throw new Error('Equipo no encontrado o sin permisos');
            }

            return {
                mensaje: 'Equipo actualizado exitosamente'
            };
        } catch (error) {
            throw new Error('Error al actualizar equipo: ' + error.message);
        }
    }

    // ============================================
    // ELIMINAR UN EQUIPO
    // ============================================
    static async eliminar(teamId, userId) {
        try {
            const resultado = await db.run(
                `DELETE FROM teams WHERE id = ? AND user_id = ?`, [teamId, userId]
            );

            if (resultado.changes === 0) {
                throw new Error('Equipo no encontrado o sin permisos');
            }

            return {
                mensaje: 'Equipo eliminado exitosamente'
            };
        } catch (error) {
            throw new Error('Error al eliminar equipo: ' + error.message);
        }
    }
}

module.exports = Team;