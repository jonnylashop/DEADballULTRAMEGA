// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================
// Este archivo contiene todas las rutas relacionadas
// con registro, login y perfil de usuario

const express = require('express');
const router = express.Router();
const Usuario = require('../models/User');
const verificarToken = require('../middleware/auth');
const { enviarEmailBienvenida, enviarEmailRecuperacion } = require('../config/email');

// ============================================
// RUTA: POST /api/auth/register
// Registrar un nuevo usuario
// ============================================
// Esta ruta se llama cuando alguien se registra en la aplicación
// Método: POST (porque estamos CREANDO un nuevo usuario)
// URL: http://localhost:3000/api/auth/register
router.post('/register', async(req, res) => {
    try {
        // ============================================
        // PASO 1: Obtener los datos enviados por el cliente
        // ============================================
        // req.body contiene los datos del formulario de registro
        // Ejemplo: {nombre: "Juan", email: "juan@ejemplo.com", password: "123456"}
        const { nombre, email, password } = req.body;

        // DEBUG: Ver qué datos llegan
        console.log('📝 Datos recibidos en /register:', { nombre, email, password: password ? '***' : 'undefined' });

        // ============================================
        // PASO 2: Validaciones básicas
        // ============================================
        // Verificar que ningún campo esté vacío
        if (!nombre || !email || !password) {
            // status(400) = Bad Request (el cliente envió datos incorrectos)
            console.log('❌ Error: Campos faltantes');
            return res.status(400).json({
                error: 'Todos los campos son obligatorios (nombre, email, password)'
            });
        }

        // Validar longitud mínima de la contraseña
        if (password.length < 6) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Validar formato de email usando una expresión regular (regex)
        // Esta regex verifica que el email tenga formato: algo@algo.algo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'El formato del email no es válido'
            });
        }

        // ============================================
        // PASO 3: Crear el usuario
        // ============================================
        // Usuario.crear() maneja la lógica de:
        // - Verificar que el email no exista
        // - Encriptar la contraseña
        // - Insertar en la base de datos
        const nuevoUsuario = await Usuario.crear(nombre, email, password);

        // ============================================
        // PASO 4: Generar token de autenticación
        // ============================================
        // Generamos el token inmediatamente para que el usuario
        // no tenga que hacer login manualmente después de registrarse
        const token = Usuario.generarToken(nuevoUsuario);

        // ============================================
        // PASO 4.5: Enviar email de bienvenida
        // ============================================
        // Intentamos enviar el email, pero si falla, no bloqueamos el registro
        enviarEmailBienvenida(email, nombre).catch(err => {
            console.log('⚠️ No se pudo enviar email de bienvenida, pero el usuario fue creado correctamente');
        });

        // ============================================
        // PASO 5: Responder con éxito
        // ============================================
        // status(201) = Created (se creó un nuevo recurso exitosamente)
        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            token: token,
            usuario: nuevoUsuario
        });
    } catch (error) {
        // Si algo falla (email duplicado, error de BD, etc.)
        console.error('Error en register:', error);
        res.status(400).json({
            error: error.message || 'Error al registrar usuario'
        });
    }
});

// ============================================
// RUTA: POST /api/auth/login
// Iniciar sesión
// ============================================
// Esta ruta verifica las credenciales y devuelve un token JWT
// Método: POST (porque estamos enviando credenciales sensibles)
// URL: http://localhost:3000/api/auth/login
router.post('/login', async(req, res) => {
    try {
        // ============================================
        // PASO 1: Obtener credenciales
        // ============================================
        const { email, password } = req.body;

        // ============================================
        // PASO 2: Validar que no estén vacíos
        // ============================================
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email y contraseña son obligatorios'
            });
        }

        // ============================================
        // PASO 3: Intentar hacer login
        // ============================================
        // Usuario.login() verifica:
        // 1. Que el email existe
        // 2. Que la contraseña sea correcta
        // 3. Genera el token JWT
        const resultado = await Usuario.login(email, password);

        // ============================================
        // PASO 4: Responder con éxito
        // ============================================
        // El frontend guardará el token en localStorage
        res.json({
            mensaje: 'Login exitoso',
            token: resultado.token,
            usuario: resultado.usuario
        });
    } catch (error) {
        console.error('Error en login:', error);
        // status(401) = Unauthorized (credenciales inválidas)
        res.status(401).json({
            error: error.message || 'Error al iniciar sesión'
        });
    }
});

// ============================================
// RUTA: GET /api/auth/profile
// Ver perfil del usuario (ruta protegida)
// ============================================
// Esta ruta está PROTEGIDA por el middleware "verificarToken"
// Solo los usuarios autenticados (con token válido) pueden acceder
router.get('/profile', verificarToken, async(req, res) => {
    try {
        // ============================================
        // req.usuario viene del middleware verificarToken
        // ============================================
        // El middleware ya verificó el token y extrajo los datos del usuario
        // Ahora obtenemos los datos completos de la base de datos
        const usuario = await Usuario.buscarPorId(req.usuario.id);

        if (!usuario) {
            // status(404) = Not Found
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Responder con los datos del usuario
        // Nota: Usuario.buscarPorId() ya NO incluye la contraseña
        res.json({
            usuario: usuario
        });
    } catch (error) {
        console.error('Error en profile:', error);
        // status(500) = Internal Server Error
        res.status(500).json({
            error: 'Error al obtener el perfil'
        });
    }
});

// ============================================
// RUTA: GET /api/auth/verify
// Verificar si el token es válido
// ============================================
// Esta ruta se usa para verificar si un usuario sigue logueado
// Por ejemplo, cuando recarga la página
router.get('/verify', verificarToken, (req, res) => {
    // Si llegamos aquí, significa que el middleware verificarToken
    // pasó exitosamente, por lo tanto el token es válido
    res.json({
        valido: true,
        usuario: req.usuario // Datos extraídos del token
    });
});

// ============================================
// RUTA: POST /api/auth/request-reset
// Solicitar código para recuperar contraseña (ENDPOINT PRINCIPAL)
// ============================================
// Primera parte del proceso de recuperación: generar el código y enviarlo por email
router.post('/request-reset', async(req, res) => {
    try {
        // 1) Recoger email del body
        const { email } = req.body;

        // 2) Validar que exista
        if (!email) {
            return res.status(400).json({ error: 'Email es obligatorio' });
        }

        // 3) Generar código (y guardarlo en password_resets con expiración)
        const codigo = await Usuario.generarCodigoRecuperacion(email);

        // 4) Enviar email con el código
        // Si falla, devolvemos error para que el usuario pueda reintentar
        const enviado = await enviarEmailRecuperacion(email, codigo);

        if (!enviado) {
            return res.status(500).json({
                error: 'No se pudo enviar el email de recuperación. Inténtalo de nuevo más tarde.'
            });
        }

        // 5) Respuesta OK (NO devolvemos el código por seguridad)
        return res.json({
            mensaje: 'Te hemos enviado un email con el código de recuperación.'
        });

    } catch (error) {
        console.error('Error en request-reset:', error);
        return res.status(400).json({
            error: error.message || 'Error al solicitar código'
        });
    }
});

// ============================================
// ALIAS / COMPATIBILIDAD
// RUTA: POST /api/auth/request-password-reset (DEPRECATED)
// Mantener el endpoint antiguo para no romper el frontend viejo
// ============================================
router.post('/request-password-reset', async(req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email es obligatorio' });
        }

        const codigo = await Usuario.generarCodigoRecuperacion(email);
        const enviado = await enviarEmailRecuperacion(email, codigo);

        if (!enviado) {
            return res.status(500).json({
                error: 'No se pudo enviar el email de recuperación.'
            });
        }

        return res.json({
            mensaje: 'Te hemos enviado un email con el código de recuperación.'
        });
    } catch (error) {
        console.error('Error en request-password-reset:', error);
        return res.status(400).json({
            error: error.message || 'Error al solicitar código'
        });
    }
});

// ============================================
// RUTA: POST /api/auth/reset-password
// Resetear contraseña con código
// ============================================
// Segunda parte del proceso: usar el código para cambiar la contraseña
router.post('/reset-password', async(req, res) => {
    try {
        // Se necesitan 3 cosas:
        // 1. email: Para saber de qué usuario es
        // 2. code: El código de 6 dígitos
        // 3. newPassword: La nueva contraseña
        const { email, code, newPassword } = req.body;

        // Validar que todos los campos estén presentes
        if (!email || !code || !newPassword) {
            return res.status(400).json({
                error: 'Email, código y nueva contraseña son obligatorios'
            });
        }

        // Validar longitud mínima de la nueva contraseña
        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // ============================================
        // Verificar código y cambiar contraseña
        // ============================================
        // Este método:
        // 1. Verifica que el código sea correcto y no haya expirado
        // 2. Encripta la nueva contraseña
        // 3. Actualiza la BD
        // 4. Elimina el código usado
        await Usuario.resetearPassword(email, code, newPassword);

        res.json({
            mensaje: 'Contraseña cambiada exitosamente'
        });
    } catch (error) {
        console.error('Error en reset-password:', error);
        res.status(400).json({
            error: error.message || 'Error al cambiar contraseña'
        });
    }
});

// ============================================
// RUTA: DELETE /api/auth/delete-account
// Eliminar cuenta del usuario (ruta protegida)
// ============================================
// Método: DELETE (porque estamos ELIMINANDO un recurso)
// Esta es una acción irreversible y peligrosa, por eso:
// 1. Requiere autenticación (verificarToken)
// 2. Requiere confirmación de contraseña
router.delete('/delete-account', verificarToken, async(req, res) => {
    try {
        const { password } = req.body;

        // ============================================
        // PASO 1: Verificar que se envió la contraseña
        // ============================================
        if (!password) {
            return res.status(400).json({
                error: 'Contraseña es requerida para eliminar la cuenta'
            });
        }

        // ============================================
        // PASO 2: Confirmar la identidad del usuario
        // ============================================
        // Aunque ya tiene un token válido, pedimos la contraseña
        // como confirmación adicional antes de eliminar la cuenta
        const usuario = await Usuario.buscarPorId(req.usuario.id);
        const passwordValido = await Usuario.verificarPassword(password, usuario.password);

        if (!passwordValido) {
            // status(401) = Unauthorized
            return res.status(401).json({
                error: 'Contraseña incorrecta'
            });
        }

        // ============================================
        // PASO 3: Eliminar la cuenta
        // ============================================
        // Esto eliminará:
        // - El usuario
        // - Todas sus partidas guardadas
        // (los mensajes de chat se mantienen por ahora)
        await Usuario.eliminarCuenta(req.usuario.id);

        res.json({
            mensaje: 'Cuenta eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error en delete-account:', error);
        res.status(500).json({
            error: error.message || 'Error al eliminar cuenta'
        });
    }
});

// ============================================
// EXPORTAR EL ROUTER
// ============================================
// Esto permite que server.js use todas estas rutas con:
// app.use('/api/auth', authRoutes);
module.exports = router;