// ============================================
// MIDDLEWARE DE AUTENTICACIÓN JWT
// ============================================
// ¿Qué es un MIDDLEWARE?
// Un middleware es una función que se ejecuta ANTES de llegar a la ruta final
// Piensa en él como un "guardia de seguridad" que verifica tu identidad
// antes de dejarte pasar a ciertas áreas del servidor

// ¿Qué es JWT?
// JWT = JSON Web Token
// Es como un "carnet de identidad digital" que prueba que eres quien dices ser
// Contiene información encriptada sobre el usuario

// PASO 1: Importar la librería jsonwebtoken
// Esta librería nos permite crear y verificar tokens JWT
const jwt = require('jsonwebtoken');

// PASO 2: Crear el middleware verificarToken
// (req, res, next) son los 3 parámetros que recibe todo middleware:
// - req = REQUEST (petición que llega del cliente)
// - res = RESPONSE (respuesta que enviamos al cliente)
// - next = función para continuar al siguiente paso
const verificarToken = (req, res, next) => {

    // PASO 3: Obtener el token del header "Authorization"
    // Cuando el frontend hace una petición, envía el token en los headers así:
    // Authorization: "Bearer abc123token456"
    // Donde "Bearer" es el tipo y "abc123token456" es el token real
    const authHeader = req.headers['authorization'];

    console.log('🔐 [AUTH] Header Authorization recibido:', authHeader ? 'Existe' : 'No existe');

    // PASO 4: Extraer solo el token (sin la palabra "Bearer")
    // authHeader && significa: "si authHeader existe, entonces..."
    // .split(' ') divide el texto en partes: ["Bearer", "abc123token456"]
    // [1] toma la segunda parte (el token)
    const token = authHeader && authHeader.split(' ')[1];

    console.log('🔑 [AUTH] Token extraído:', token ? token.substring(0, 20) + '...' : 'No existe');

    // PASO 5: Verificar si el token existe
    // Si no hay token, significa que el usuario no está autenticado
    if (!token) {
        // Devolver error 401 (Unauthorized = No autorizado)
        // .json() envía la respuesta en formato JSON
        console.log('❌ [AUTH] No se proporcionó token');
        return res.status(401).json({
            error: 'Acceso denegado. No se proporcionó token.'
        });
    }

    // PASO 6: Intentar verificar el token
    try {
        // jwt.verify() intenta desencriptar el token usando la clave secreta
        // Si el token es válido, devuelve los datos que están dentro
        // process.env.JWT_SECRET es la clave secreta del archivo .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log('✅ [AUTH] Token verificado correctamente. Usuario ID:', decoded.id);

        // PASO 7: Guardar los datos del usuario en req.usuario
        // Esto hace que las siguientes funciones puedan acceder a:
        // req.usuario.id, req.usuario.email, req.usuario.nombre, etc.
        req.usuario = decoded;

        // PASO 8: Continuar al siguiente paso
        // next() dice: "todo está bien, continúa con la ruta"
        next();

    } catch (error) {
        // PASO 9: Si hay algún error al verificar el token
        // Esto puede pasar si:
        // - El token está mal formado
        // - El token ha expirado
        // - El token fue manipulado
        console.log('❌ [AUTH] Error al verificar token:', error.message);
        return res.status(403).json({
            error: 'Token inválido o expirado.'
        });
    }
};

// PASO 10: Exportar el middleware para usarlo en otros archivos
// Esto permite importarlo con: const verificarToken = require('./middleware/auth')
module.exports = verificarToken;