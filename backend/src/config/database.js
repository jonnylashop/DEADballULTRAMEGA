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
            is_admin INTEGER DEFAULT 0,
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
            inning INTEGER DEFAULT 1,
            is_top_inning INTEGER DEFAULT 1,
            outs INTEGER DEFAULT 0,
            bases TEXT,
            game_state TEXT,
            completed INTEGER DEFAULT 0,
            winner TEXT,
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

    // TABLA: password_resets (códigos de recuperación de contraseña)
    db.run(`
        CREATE TABLE IF NOT EXISTS password_resets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            code TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear tabla password_resets:', err.message);
        } else {
            console.log('✅ Tabla "password_resets" lista');
        }
    });

    // TABLA: chat_messages (mensajes del chat general)
    db.run(`
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear tabla chat_messages:', err.message);
        } else {
            console.log('✅ Tabla "chat_messages" lista');
        }
    });

    // TABLA: teams (equipos guardados de los usuarios)
    db.run(`
        CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            team_name TEXT NOT NULL,
            players TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear tabla teams:', err.message);
        } else {
            console.log('✅ Tabla "teams" lista');
        }
    });
});

// ============================================
// FUNCIONES HELPER PARA USAR CON ASYNC/AWAIT
// ============================================
// SQLite originalmente usa CALLBACKS (funciones que se ejecutan cuando termina la consulta)
// Pero en JavaScript moderno preferimos usar ASYNC/AWAIT
// Por eso "envolvemos" las funciones de SQLite en Promises

// Guardar referencias a las funciones originales de SQLite
const Database = require('sqlite3').Database;
const originalGet = Database.prototype.get;
const originalAll = Database.prototype.all;
const originalRun = Database.prototype.run;

// ============================================
// db.get() - Para consultas que devuelven UNA fila
// ============================================
// Ejemplo: SELECT * FROM users WHERE id = 1
db.get = function(sql, params = []) {
    // Retornamos una Promise que se puede usar con await
    return new Promise((resolve, reject) => {
        // Usar la función original de SQLite
        originalGet.call(this, sql, params, (err, row) => {
            if (err) reject(err); // Si hay error, rechazamos la Promise
            else resolve(row); // Si todo bien, resolvemos con la fila encontrada
        });
    });
}.bind(db); // .bind(db) asegura que 'this' dentro de la función apunte a 'db'

// ============================================
// db.all() - Para consultas que devuelven MÚLTIPLES filas
// ============================================
// Ejemplo: SELECT * FROM users (devuelve todos los usuarios)
db.all = function(sql, params = []) {
    return new Promise((resolve, reject) => {
        // Usar la función original de SQLite
        originalAll.call(this, sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows); // rows es un array []
        });
    });
}.bind(db);

// ============================================
// db.run() - Para INSERT, UPDATE, DELETE
// ============================================
// Estas consultas NO devuelven filas, pero sí información útil:
// - lastID: El ID del último registro insertado (útil para INSERT)
// - changes: Cuántas filas se modificaron (útil para UPDATE/DELETE)
db.run = function(sql, params = []) {
    return new Promise((resolve, reject) => {
        // IMPORTANTE: Usamos function() normal (NO arrow =>) porque necesitamos 'this'
        originalRun.call(this, sql, params, function(err) {
            if (err) reject(err);
            else resolve({
                lastID: this.lastID, // ID del último INSERT
                changes: this.changes // Número de filas afectadas
            });
        });
    });
}.bind(db);

// Exportar la conexión para usarla en otros archivos
module.exports = db;