// ============================================
// CONFIGURACIÓN DE LA BASE DE DATOS
// ============================================
// Este archivo crea y configura la conexión con SQLite

const sqlite3 = require('sqlite3').verbose(); // Importar SQLite
const path = require('path');

// Ruta donde se guardará el archivo de base de datos
const DB_PATH = path.join(__dirname, '../../database.sqlite');

// Crear conexión con la base de datos
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Error al conectar con la base de datos:', err.message);
    } else {
        console.log('✅ Conectado a la base de datos SQLite');
    }
});

// ============================================
// CREAR TABLAS (si no existen)
// ============================================

// TABLA: users (usuarios del sistema)
db.serialize(() => {
    // serialize() asegura que las consultas se ejecuten en orden

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            profile_photo TEXT DEFAULT 'default-avatar.png',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear tabla users:', err.message);
        } else {
            console.log('✅ Tabla "users" lista');
        }
    });

    // TABLA: games (partidas jugadas)
    db.run(`
        CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            home_team TEXT NOT NULL,
            away_team TEXT NOT NULL,
            home_score INTEGER DEFAULT 0,
            away_score INTEGER DEFAULT 0,
            innings_played INTEGER DEFAULT 0,
            game_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear tabla games:', err.message);
        } else {
            console.log('✅ Tabla "games" lista');
        }
    });

    // TABLA: contacts (mensajes de contacto)
    db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear tabla contacts:', err.message);
        } else {
            console.log('✅ Tabla "contacts" lista');
        }
    });
});

// Exportar la conexión para usarla en otros archivos
module.exports = db;