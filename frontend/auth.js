// ============================================
// MÓDULO DE AUTENTICACIÓN - FRONTEND
// ============================================
// Este archivo maneja toda la comunicación con el backend
// para login, registro y gestión de sesiones
//
// ¿QUÉ HACE ESTE ARCHIVO?
// - Envía peticiones HTTP al backend
// - Guarda el token JWT en localStorage
// - Verifica si el usuario está logueado
// - Maneja el cierre de sesión

// URL base del backend (servidor Node.js)
const API_URL = 'http://localhost:3000/api/auth';

// ============================================
// FUNCIÓN: REGISTRAR USUARIO
// ============================================
// Esta función se llama desde menu.html cuando alguien se registra
async function register(nombre, email, password) {
    try {
        // ============================================
        // PASO 1: Enviar petición HTTP al backend
        // ============================================
        // fetch() es la función moderna de JavaScript para hacer peticiones HTTP
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST', // Método HTTP (POST porque estamos creando algo)
            headers: {
                'Content-Type': 'application/json' // Le decimos al servidor que enviamos JSON
            },
            body: JSON.stringify({ nombre, email, password }) // Convertir objeto a texto JSON
        });

        // ============================================
        // PASO 2: Convertir la respuesta a JSON
        // ============================================
        const data = await response.json();

        // ============================================
        // PASO 3: Verificar si hubo error
        // ============================================
        // response.ok es false si el código de estado es 400, 401, 500, etc.
        if (!response.ok) {
            throw new Error(data.error || 'Error al registrar usuario');
        }

        // ============================================
        // PASO 4: Guardar el token en localStorage
        // ============================================
        // localStorage es como una "base de datos" del navegador
        // que persiste incluso si cierras la pestaña
        localStorage.setItem('token', data.token);

        // JSON.stringify() convierte el objeto usuario en texto
        // porque localStorage solo puede guardar strings
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        return data; // Devolver los datos para que el formulario los use
    } catch (error) {
        console.error('Error en register:', error);
        throw error; // Relanzar el error para que lo maneje quien llamó a register()
    }
}

// ============================================
// FUNCIÓN: LOGIN
// ============================================
// Esta función verifica las credenciales y obtiene el token JWT
async function login(email, password) {
    try {
        // ============================================
        // PASO 1: Enviar credenciales al backend
        // ============================================
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }) // Enviar credenciales
        });

        // ============================================
        // PASO 2: Procesar respuesta
        // ============================================
        const data = await response.json();

        if (!response.ok) {
            // Si hay error (usuario no existe, contraseña incorrecta, etc.)
            throw new Error(data.error || 'Error al iniciar sesión');
        }

        // ============================================
        // PASO 3: Guardar token y datos del usuario
        // ============================================
        // Estos datos se usarán en toda la aplicación para:
        // - Verificar si el usuario está logueado
        // - Mostrar su nombre en la UI
        // - Verificar si es admin
        // - Hacer peticiones autenticadas
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        return data;
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
}

// ============================================
// FUNCIÓN: LOGOUT (Cerrar sesión)
// ============================================
// Esta función elimina todos los datos de sesión
function logout() {
    // ============================================
    // PASO 1: Limpiar localStorage
    // ============================================
    // Eliminamos el token y los datos del usuario
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    // ============================================
    // PASO 2: Redirigir al menú
    // ============================================
    // window.location.href cambia la URL (como hacer clic en un enlace)
    window.location.href = 'menu.html';
}

// ============================================
// FUNCIÓN: OBTENER TOKEN
// ============================================
// Devuelve el token JWT guardado en localStorage
// Devuelve null si no hay token (usuario no logueado)
function getToken() {
    return localStorage.getItem('token');
}

// ============================================
// FUNCIÓN: OBTENER USUARIO ACTUAL
// ============================================
// Devuelve los datos del usuario logueado
function getUsuarioActual() {
    // localStorage.getItem() devuelve un string JSON
    // Ejemplo: '{"id":1,"nombre":"Juan","email":"juan@ejemplo.com"}'
    const usuarioStr = localStorage.getItem('usuario');

    // JSON.parse() convierte el string JSON a un objeto JavaScript
    // Si no hay usuario (usuarioStr es null), devuelve null
    return usuarioStr ? JSON.parse(usuarioStr) : null;
}

// ============================================
// FUNCIÓN: VERIFICAR SI ESTÁ LOGUEADO
// ============================================
// Devuelve true si hay un token, false si no
// Esta es una verificación SIMPLE que solo chequea localStorage
// NO verifica si el token es válido (para eso usa verificarToken())
function estaLogueado() {
    // getToken() devuelve null si no hay token
    // !== null significa "es diferente de null"
    // Ejemplo: 'abc123' !== null es true
    // Ejemplo: null !== null es false
    return getToken() !== null;
}

// ============================================
// FUNCIÓN: OBTENER PERFIL DEL SERVIDOR
// ============================================
// Esta función hace una petición autenticada al backend
// para obtener los datos actualizados del usuario
async function obtenerPerfil() {
    try {
        // ============================================
        // PASO 1: Verificar que hay token
        // ============================================
        const token = getToken();
        if (!token) {
            throw new Error('No hay token');
        }

        // ============================================
        // PASO 2: Hacer petición con autenticación
        // ============================================
        const response = await fetch(`${API_URL}/profile`, {
            method: 'GET', // GET porque estamos OBTENIENDO datos
            headers: {
                // Authorization: Bearer <token> es el estándar para JWT
                // "Bearer" significa "portador" (quien porta/tiene el token)
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al obtener perfil');
        }

        return data.usuario;
    } catch (error) {
        console.error('Error en obtenerPerfil:', error);
        throw error;
    }
}

// ============================================
// FUNCIÓN: VERIFICAR TOKEN
// ============================================
// Esta función verifica si el token es VÁLIDO (no expirado, no alterado)
// Hace una petición al backend que verifica la firma JWT
async function verificarToken() {
    try {
        const token = getToken();
        if (!token) {
            return false; // No hay token = no está logueado
        }

        // ============================================
        // Hacer petición a /verify
        // ============================================
        // El backend verificará:
        // 1. Que el token no esté alterado (firma válida)
        // 2. Que no haya expirado
        // 3. Que el usuario todavía exista
        const response = await fetch(`${API_URL}/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Si response.ok es true, el token es válido
        // Si es false (401, 403, etc.), el token es inválido
        return response.ok;
    } catch (error) {
        console.error('Error en verificarToken:', error);
        return false; // En caso de error, consideramos que no está logueado
    }
}

// ============================================
// FUNCIÓN: HACER PETICIÓN AUTENTICADA
// ============================================
// Esta es una función HELPER (auxiliar) para hacer cualquier
// petición HTTP que requiera autenticación
//
// Ejemplo de uso:
// const response = await fetchConAuth('http://localhost:3000/api/games', {
//     method: 'GET'
// });
async function fetchConAuth(url, options = {}) {
    // ============================================
    // PASO 1: Obtener el token
    // ============================================
    const token = getToken();

    if (!token) {
        throw new Error('No hay token de autenticación');
    }

    // ============================================
    // PASO 2: Añadir el token a los headers
    // ============================================
    // Usamos el operador spread (...) para combinar:
    // - Los headers que ya venían en options
    // - El header Authorization con el token
    const headers = {
        ...options.headers, // Headers existentes (si los hay)
        'Authorization': `Bearer ${token}` // Añadir autenticación
    };

    // ============================================
    // PASO 3: Hacer la petición
    // ============================================
    const response = await fetch(url, {
        ...options, // Todas las opciones originales (method, body, etc.)
        headers // Headers actualizados con el token
    });

    // ============================================
    // PASO 4: Manejar errores de autenticación
    // ============================================
    // 401 = Unauthorized (token inválido o expirado)
    // 403 = Forbidden (no tienes permisos)
    if (response.status === 401 || response.status === 403) {
        // Token inválido o expirado, hacer logout automáticamente
        logout();
        throw new Error('Sesión expirada');
    }

    return response;
}