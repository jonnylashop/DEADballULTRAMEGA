// ============================================
// MODELO DE PARTIDA (GAME)
// ============================================
// Este archivo maneja todas las operaciones relacionadas con
// las partidas guardadas de los usuarios

const db = require('../config/database');

class Game {
    // ============================================
    // GUARDAR UNA PARTIDA
    // ============================================
    // Guarda el estado completo de una partida en curso
    static async guardar(userId, estadoPartida) {
        try {
            const {
                homeTeam,
                awayTeam,
                homeScore,
                awayScore,
                inning,
                isTopInning,
                outs,
                bases,
                gameState, // JSON con todo el estado del juego
                completed,
                winner
            } = estadoPartida;

            const resultado = await db.run(
                `INSERT INTO games (
                    user_id, home_team, away_team, 
                    home_score, away_score, 
                    inning, is_top_inning, outs, bases,
                    game_state, completed, winner,
                    game_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))`, [
                    userId, homeTeam, awayTeam,
                    homeScore, awayScore,
                    inning, isTopInning ? 1 : 0, outs, JSON.stringify(bases),
                    JSON.stringify(gameState), completed ? 1 : 0, winner
                ]
            );

            return {
                id: resultado.lastID,
                message: 'Partida guardada exitosamente'
            };
        } catch (error) {
            throw error;
        }
    }

    // ============================================
    // OBTENER PARTIDAS DE UN USUARIO
    // ============================================
    // Devuelve el historial de partidas de un usuario
    static async obtenerPorUsuario(userId, limit = 50) {
        try {
            const partidas = await db.all(
                `SELECT 
                    id, home_team, away_team, 
                    home_score, away_score,
                    inning, completed, winner,
                    game_date
                FROM games 
                WHERE user_id = ? 
                ORDER BY game_date DESC 
                LIMIT ?`, [userId, limit]
            );
            return partidas;
        } catch (error) {
            throw error;
        }
    }

    // ============================================
    // OBTENER UNA PARTIDA ESPECÍFICA
    // ============================================
    // Obtiene todos los detalles de una partida para cargarla
    static async obtenerPorId(gameId, userId) {
        try {
            const partida = await db.get(
                `SELECT * FROM games 
                WHERE id = ? AND user_id = ?`, [gameId, userId]
            );

            if (!partida) {
                throw new Error('Partida no encontrada');
            }

            // Parsear los datos JSON
            if (partida.bases) {
                partida.bases = JSON.parse(partida.bases);
            }
            if (partida.game_state) {
                partida.game_state = JSON.parse(partida.game_state);
            }

            return partida;
        } catch (error) {
            throw error;
        }
    }

    // ============================================
    // ELIMINAR PARTIDA
    // ============================================
    static async eliminar(gameId, userId) {
        try {
            const resultado = await db.run(
                'DELETE FROM games WHERE id = ? AND user_id = ?', [gameId, userId]
            );

            if (resultado.changes === 0) {
                throw new Error('Partida no encontrada');
            }

            return { message: 'Partida eliminada exitosamente' };
        } catch (error) {
            throw error;
        }
    }

    // ============================================
    // ESTADÍSTICAS DEL USUARIO
    // ============================================
    // Obtiene estadísticas generales del usuario
    static async obtenerEstadisticas(userId) {
        try {
            const stats = await db.get(
                `SELECT 
                    COUNT(*) as total_games,
                    SUM(CASE WHEN completed = 1 AND winner = 'home' THEN 1 ELSE 0 END) as wins,
                    SUM(CASE WHEN completed = 1 AND winner = 'away' THEN 1 ELSE 0 END) as losses,
                    SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as in_progress
                FROM games 
                WHERE user_id = ?`, [userId]
            );
            return stats;
        } catch (error) {
            throw error;
        }
    }

    // ============================================
    // HALL OF FAME - TOP JUGADORES
    // ============================================
    // Obtiene el ranking de jugadores por partidos jugados
    static async obtenerHallOfFame(limit = 10) {
        try {
            const ranking = await db.all(
                `SELECT 
                    users.username as alias,
                    COUNT(*) as partidos_jugados,
                    SUM(CASE WHEN games.completed = 1 AND games.winner = 'home' THEN 1 ELSE 0 END) as ganados,
                    SUM(CASE WHEN games.completed = 1 AND games.winner = 'away' THEN 1 ELSE 0 END) as perdidos,
                    SUM(CASE WHEN games.completed = 1 THEN 1 ELSE 0 END) as completados
                FROM users
                INNER JOIN games ON users.id = games.user_id
                GROUP BY users.id
                ORDER BY partidos_jugados DESC, ganados DESC
                LIMIT ?`, [limit]
            );
            return ranking;
        } catch (error) {
            throw error;
        }
    }

    // ============================================
    // ACTUALIZAR PARTIDA (Marcar como completada)
    // ============================================
    static async marcarCompletada(gameId, userId, winner, finalHomeScore, finalAwayScore) {
        try {
            const resultado = await db.run(
                `UPDATE games 
                SET completed = 1, 
                    winner = ?, 
                    home_score = ?,
                    away_score = ?,
                    game_date = datetime("now")
                WHERE id = ? AND user_id = ?`, [winner, finalHomeScore, finalAwayScore, gameId, userId]
            );

            if (resultado.changes === 0) {
                throw new Error('Partida no encontrada');
            }

            return { message: 'Partida actualizada exitosamente' };
        } catch (error) {
            throw error;
        }
    }
}

// Exportar la clase
module.exports = Game;