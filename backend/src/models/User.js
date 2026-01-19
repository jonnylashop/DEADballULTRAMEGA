// ============================================
// MODELO DE USUARIO
// ============================================
// Este archivo contiene todas las funciones para
// interactuar con la tabla de usuarios

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Clase para manejar usuarios
class Usuario {

    // ============================================
    // CREAR UN NUEVO USUARIO
    // ============================================
    // Este método se ejecuta cuando alguien se registra
    static async crear(nombre, email, password) {
        try {
            // ============================================
            // PASO 1: Verificar que el email no esté en uso
            // ============================================
            // Buscamos si ya existe un usuario con ese email
            const usuarioExistente = await this.buscarPorEmail(email);
            if (usuarioExistente) {
                // Si existe, lanzamos un error para detener el proceso
                throw new Error('El email ya está registrado');
            }

            // ============================================
            // PASO 2: Encriptar la contraseña
            // ============================================
            // NUNCA guardamos contraseñas en texto plano por seguridad
            // bcrypt.hash() convierte "miContraseña123" en algo como:
            // "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
            // 
            // El segundo parámetro (10) es el "cost factor":
            // - Más alto = más seguro pero más lento
            // - 10 es un buen balance (tarda ~100ms)
            // - 12-14 se usa en aplicaciones de alta seguridad
            const passwordEncriptado = await bcrypt.hash(password, 10);

            // ============================================
            // PASO 3: Insertar en la base de datos
            // ============================================
            // Los ? son "placeholders" que previenen SQL Injection
            // El array [nombre, email, passwordEncriptado] reemplaza cada ?
            const resultado = await db.run(
                'INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, datetime("now"))', [nombre, email, passwordEncriptado]
            );

            // ============================================
            // PASO 4: Devolver el usuario creado
            // ============================================
            // resultado.lastID contiene el ID que SQLite asignó automáticamente
            // IMPORTANTE: NO devolvemos la contraseña encriptada por seguridad
            return {
                id: resultado.lastID,
                nombre: nombre,
                email: email
            };
        } catch (error) {
            // Si algo falla en cualquier paso, lanzamos el error
            // para que lo maneje quien llamó a este método
            throw error;
        }
    }

    // ============================================
    // BUSCAR USUARIO POR EMAIL
    // ============================================
    // Este método se usa en login y para verificar si un email existe
    static async buscarPorEmail(email) {
        try {
            // db.get devuelve UNA fila o undefined si no encuentra nada
            // SELECT * significa "seleccionar todas las columnas"
            const usuario = await db.get(
                'SELECT * FROM users WHERE email = ?', [email]
            );
            // Si no existe, usuario será undefined
            return usuario;
        } catch (error) {
            throw error;
        }
    }

    // ============================================
    // BUSCAR USUARIO POR ID
    // ============================================
    // Este método se usa cuando ya tenemos el ID del usuario
    // (por ejemplo, después de verificar el JWT token)
    static async buscarPorId(id) {
        try {
            // NOTA: Aquí NO seleccionamos la contraseña (SELECT id, username...)
            // porque no la necesitamos y es más seguro no devolverla
            const usuario = await db.get(
                'SELECT id, username, email, is_admin, created_at FROM users WHERE id = ?', [id]
            );
            return usuario;
        } catch (error) {
            throw error;
        }
    }

    // ============================================
    // VERIFICAR CONTRASEÑA
    // ============================================
    // Este método compara la contraseña que el usuario escribe
    // con la contraseña encriptada guardada en la base de datos
    static async verificarPassword(password, passwordEncriptado) {
        try {
            // bcrypt.compare hace la "magia" de verificar
            // sin necesidad de desencriptar la contraseña guardada
            // 
            // Ejemplo:
            // password = "miPassword123" (lo que escribe el usuario)
            // passwordEncriptado = "$2b$10$EixZaYVK1fsbw1..." (lo que está en la BD)
            // devuelve true si coinciden, false si no
            const esValida = await bcrypt.compare(password, passwordEncriptado);
            return esValida; // true o false
        } catch (error) {
            throw error;
        }
    }

    // ============================================
    // GENERAR TOKEN JWT
    // ============================================
    // JWT (JSON Web Token) es como una "credencial digital"
    // que prueba que el usuario está autenticado
    static generarToken(usuario) {
        // jwt.sign() crea el token con 3 partes:
        // 
        // 1. PAYLOAD (datos del usuario que se incluyen en el token)
        // 2. SECRET (clave secreta que está en .env)
        // 3. OPCIONES (tiempo de expiración, etc.)
        //
        // El token resultante es un string largo como:
        // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjA..."
        const token = jwt.sign({
                id: usuario.id,
                email: usuario.email,
                // Si viene de login, suele ser usuario.username (viene de BD)
                // Si viene de register, tu crear() devuelve usuario.nombre
                nombre: usuario.username || usuario.nombre,
                isAdmin: usuario.is_admin || 0 // 1 si es admin, 0 si no
            },
            process.env.JWT_SECRET, // Clave secreta para firmar (NUNCA compartir)
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } // Configurable desde .env
        );
        return token;
    }

    // ============================================
    // LOGIN - Iniciar sesión
    // ============================================
    // Este es el proceso completo de login
    static async login(email, password) {
        try {
            // ============================================
            // PASO 1: Buscar el usuario por email
            // ============================================
            const usuario = await this.buscarPorEmail(email);

            // Si no existe el usuario
            if (!usuario) {
                // Por seguridad, no decimos "el email no existe"
                // sino un mensaje genérico para evitar que ataquen probando emails
                throw new Error('Email o contraseña incorrectos');
            }

            // ============================================
            // PASO 2: Verificar que la contraseña sea correcta
            // ============================================
            const passwordValido = await this.verificarPassword(password, usuario.password);

            if (!passwordValido) {
                // Mismo mensaje genérico por seguridad
                throw new Error('Email o contraseña incorrectos');
            }

            // ============================================
            // PASO 3: Todo correcto - Generar el token
            // ============================================
            const token = this.generarToken(usuario);

            // Devolvemos:
            // - token: para que el frontend lo guarde en localStorage
            // - usuario: datos básicos para mostrar en la UI
            return {
                token: token,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.username,
                    email: usuario.email,
                    isAdmin: usuario.is_admin || 0
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // ============================================
    // GENERAR CÓDIGO DE RECUPERACIÓN DE CONTRASEÑA
    // ============================================
    // Cuando un usuario olvida su contraseña, genera un código
    // de 6 dígitos que tiene 15 minutos de validez
    static async generarCodigoRecuperacion(email) {
        try {
            // ============================================
            // PASO 1: Verificar que el email existe
            // ============================================
            const usuario = await this.buscarPorEmail(email);
            if (!usuario) {
                throw new Error('Email no encontrado');
            }

            // ============================================
            // PASO 2: Generar código aleatorio de 6 dígitos
            // ============================================
            // Math.random() genera un número entre 0 y 1
            // Ejemplo: 0.543891
            // 
            // Math.random() * 900000 da un número entre 0 y 899999
            // Ejemplo: 489502.19
            // 
            // + 100000 asegura que esté entre 100000 y 999999 (6 dígitos)
            // Ejemplo: 589502.19
            // 
            // Math.floor() elimina los decimales
            // Ejemplo: 589502
            // 
            // .toString() lo convierte a texto
            // Ejemplo: "589502"
            const codigo = Math.floor(100000 + Math.random() * 900000).toString();

            // ============================================
            // PASO 3: Guardar el código en la base de datos
            // ============================================
            // Primero eliminamos cualquier código anterior
            // (por si el usuario ya pidió uno antes)
            await db.run(
                'DELETE FROM password_resets WHERE email = ?', [email]
            );

            // Insertar el nuevo código con fecha de expiración
            // datetime("now", "+15 minutes") = fecha/hora actual + 15 minutos
            await db.run(
                'INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, datetime("now", "+15 minutes"))', [email, codigo]
            );

            // Devolver el código para mostrarlo (en producción se enviaría por email)
            return codigo;
        } catch (error) {
            throw error;
        }
    }

    // ============================================
    // RESETEAR CONTRASEÑA CON CÓDIGO
    // ============================================
    // Verifica el código y cambia la contraseña si es válido
    static async resetearPassword(email, code, newPassword) {
        try {
            // ============================================
            // PASO 1: Verificar que el código sea válido y no haya expirado
            // ============================================
            // Esta consulta busca un código que:
            // 1. Coincida con el email
            // 2. Coincida con el código ingresado
            // 3. No haya expirado (expires_at > now)
            const reset = await db.get(
                'SELECT * FROM password_resets WHERE email = ? AND code = ? AND expires_at > datetime("now")', [email, code]
            );

            if (!reset) {
                // Si no encuentra nada, el código es inválido o expiró
                throw new Error('Código inválido o expirado');
            }

            // ============================================
            // PASO 2: Encriptar la nueva contraseña
            // ============================================
            const passwordEncriptado = await bcrypt.hash(newPassword, 10);

            // ============================================
            // PASO 3: Actualizar la contraseña en la BD
            // ============================================
            // UPDATE modifica un registro existente
            await db.run(
                'UPDATE users SET password = ?, updated_at = datetime("now") WHERE email = ?', [passwordEncriptado, email]
            );

            // ============================================
            // PASO 4: Eliminar el código usado
            // ============================================
            // Por seguridad, eliminamos el código para que no se pueda reutilizar
            await db.run(
                'DELETE FROM password_resets WHERE email = ?', [email]
            );

            return true;
        } catch (error) {
            throw error;
        }
    }

    // ============================================
    // ELIMINAR CUENTA DE USUARIO
    // ============================================
    // Este método elimina permanentemente la cuenta del usuario
    // y todos sus datos relacionados
    static async eliminarCuenta(id) {
        try {
            // ============================================
            // PASO 1: Eliminar datos relacionados (CASCADE manual)
            // ============================================
            // SQLite no siempre maneja CASCADE DELETE automáticamente,
            // así que eliminamos manualmente las partidas del usuario primero
            // 
            // Si no hiciéramos esto, podría dar error de "FOREIGN KEY constraint"
            await db.run('DELETE FROM games WHERE user_id = ?', [id]);

            // También podríamos eliminar mensajes del chat si quisiéramos:
            // await db.run('DELETE FROM chat_messages WHERE user_id = ?', [id]);

            // ============================================
            // PASO 2: Eliminar el usuario
            // ============================================
            // Ahora que no hay datos relacionados, podemos eliminar el usuario
            await db.run('DELETE FROM users WHERE id = ?', [id]);

            return true;
        } catch (error) {
            throw error;
        }
    }
}

// ============================================
// EXPORTAR LA CLASE
// ============================================
// module.exports hace que la clase Usuario esté disponible
// en otros archivos cuando hacen require('./models/User')
module.exports = Usuario;