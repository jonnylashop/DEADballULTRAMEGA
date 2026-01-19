// ============================================
// SERVIDOR PRINCIPAL DEL BACKEND
// ============================================
// Este archivo es el "cerebro" del backend.
// Escucha peticiones HTTP y responde.

// 1. IMPORTAR LIBRERÍAS
require('dotenv').config(); // Cargar variables de entorno (.env)
const express = require('express'); // Framework para crear el servidor
const cors = require('cors'); // Permite que el frontend hable con el backend
const path = require('path'); // Para manejar rutas de archivos
const http = require('http'); // Para crear servidor HTTP
const socketIO = require('socket.io'); // Para chat en tiempo real
const db = require('./src/config/database'); // Importar la base de datos

// 2. CREAR LA APLICACIÓN
const app = express(); // Crea el servidor
const server = http.createServer(app); // Crear servidor HTTP
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
}); // Socket.IO para chat
const PORT = process.env.PORT || 3000; // Puerto desde .env o 3000 por defecto

// 3. CONFIGURAR MIDDLEWARES
// Los middlewares son "filtros" que procesan las peticiones antes de llegar a las rutas

app.use(cors()); // Permite peticiones desde cualquier origen (frontend)
app.use(express.json()); // Permite leer JSON en el body de las peticiones
app.use(express.urlencoded({ extended: true })); // Permite leer formularios

// 4. SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND
// Esto hace que el servidor sirva tu juego HTML/CSS/JS
app.use(express.static(path.join(__dirname, '../frontend')));
// Servir imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. IMPORTAR Y USAR RUTAS
// Importar las rutas de autenticación
const authRoutes = require('./src/routes/auth');
// Importar las rutas de partidas
const gamesRoutes = require('./src/routes/games');
// Importar las rutas de equipos
const teamsRoutes = require('./src/routes/teams');
// Importar las rutas de subida de archivos
const uploadRoutes = require('./src/routes/upload');

// Usar las rutas de autenticación
app.use('/api/auth', authRoutes);
// Usar las rutas de partidas
app.use('/api/games', gamesRoutes);
// Usar las rutas de equipos
app.use('/api/teams', teamsRoutes);
// Usar las rutas de upload
app.use('/api/upload', uploadRoutes);

// 6. RUTA DE PRUEBA
// Esta es una ruta simple para verificar que el servidor funciona
app.get('/api/test', (req, res) => {
    // req = request (petición que llega)
    // res = response (respuesta que envías)
    res.json({
        message: '✅ El servidor funciona correctamente',
        timestamp: new Date().toISOString()
    });
});

// 7. RUTA PRINCIPAL - Servir el juego
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============================================
// 8. CONFIGURAR SOCKET.IO PARA EL CHAT EN TIEMPO REAL
// ============================================
// Socket.IO permite comunicación bidireccional instantánea
// entre el servidor y todos los clientes conectados

// ============================================
// MIDDLEWARE: Verificar JWT en Socket.IO
// ============================================
const jwt = require('jsonwebtoken');

io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Token no proporcionado'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro_cambiar_en_produccion');
        socket.userId = decoded.id;
        socket.userName = decoded.nombre;
        socket.isAdmin = decoded.isAdmin;
        next();
    } catch (error) {
        console.error('❌ Token inválido en Socket.IO:', error.message);
        next(new Error('Token inválido'));
    }
});

// 'connection' es un evento que se dispara cuando alguien se conecta
io.on('connection', (socket) => {
    // 'socket' representa la conexión individual de un usuario
    console.log(`💬 Usuario conectado al chat: ${socket.userName} (${socket.id})`);

    // ============================================
    // EVENTO: Cuando un usuario envía un mensaje
    // ============================================
    // 'chat-message' es el nombre del evento personalizado
    // El frontend emite este evento cuando alguien envía un mensaje
    socket.on('chat-message', async(data) => {
        try {
            // Usar datos del socket (verificados por JWT), NO del cliente
            const userId = socket.userId;
            const username = socket.userName;
            const message = data.message;

            // PASO 1: Guardar el mensaje en la base de datos
            // Esto asegura que los mensajes persistan aunque se reinicie el servidor
            const result = await db.run(
                'INSERT INTO chat_messages (user_id, username, message, created_at) VALUES (?, ?, ?, datetime("now"))', [userId, username, message]
            );

            // PASO 2: Enviar el mensaje a TODOS los usuarios conectados
            // io.emit() envía a TODOS (incluyendo quien lo envió)
            // socket.emit() solo enviaría al que lo mandó
            // socket.broadcast.emit() envía a todos EXCEPTO quien lo mandó
            io.emit('chat-message', {
                id: result.lastID, // ID del mensaje en la BD
                username: username, // Nombre del usuario (del JWT)
                message: message, // Contenido del mensaje
                timestamp: new Date().toISOString() // Marca de tiempo
            });
        } catch (error) {
            console.error('Error al guardar mensaje:', error);
        }
    });

    // ============================================
    // EVENTO: Cuando el admin elimina un mensaje
    // ============================================
    // Este evento solo lo emite el frontend si el usuario es admin
    socket.on('delete-message', async(data) => {
        try {
            // Verificar que el usuario es admin (del JWT)
            if (!socket.isAdmin) {
                console.log('❌ Usuario no admin intentó eliminar mensaje');
                return;
            }

            // data contiene: {messageId}

            // PASO 1: Eliminar el mensaje de la base de datos
            await db.run('DELETE FROM chat_messages WHERE id = ?', [data.messageId]);

            // PASO 2: Notificar a TODOS que se eliminó el mensaje
            // Esto hace que el mensaje desaparezca en tiempo real
            // para todos los usuarios conectados
            io.emit('message-deleted', {
                messageId: data.messageId
            });
        } catch (error) {
            console.error('Error al eliminar mensaje:', error);
        }
    });

    // ============================================
    // EVENTO: Cuando un usuario se desconecta
    // ============================================
    // Este evento se dispara automáticamente cuando alguien:
    // - Cierra la pestaña/ventana
    // - Pierde conexión a internet
    // - Navega a otra página
    socket.on('disconnect', () => {
        console.log('👋 Usuario desconectado del chat:', socket.id);
    });
});

// ============================================
// RUTA: GET /api/chat/messages
// Obtener historial de mensajes del chat
// ============================================
app.get('/api/chat/messages', async(req, res) => {
    try {
        // req.query.limit obtiene el parámetro ?limit=X de la URL
        // Si no se especifica, por defecto trae 50 mensajes
        const limit = req.query.limit || 50;

        // Consultar los últimos X mensajes de la base de datos
        // ORDER BY created_at DESC: Ordena del más reciente al más antiguo
        // LIMIT ?: Limita el número de resultados
        const messages = await db.all(
            'SELECT id, username, message, created_at FROM chat_messages ORDER BY created_at DESC LIMIT ?', [limit]
        );

        // reverse() invierte el array para mostrar los más antiguos primero
        // Esto hace que el chat se vea cronológicamente correcto
        res.json(messages.reverse());
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        // status(500) = Error interno del servidor
        res.status(500).json({ error: 'Error al obtener mensajes' });
    }
});

// ============================================
// 9. INICIAR EL SERVIDOR
// ============================================
// server.listen() inicia el servidor HTTP y Socket.IO
// Nota: Usamos 'server' (HTTP) y NO 'app' (Express) porque
// Socket.IO necesita el servidor HTTP subyacente
server.listen(PORT, () => {
    // Este callback se ejecuta cuando el servidor está listo
    // Mostramos un mensaje bonito en la consola
    console.log('╔════════════════════════════════════════╗');
    console.log('║  🎮 SERVIDOR DEADBALL INICIADO        ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  📡 Servidor: http://localhost:${PORT}   ║`);
    console.log(`║  🎲 Juego:    http://localhost:${PORT}   ║`);
    console.log(`║  💬 Chat:     http://localhost:${PORT}/chat.html ║`);
    console.log(`║  🔧 API Test: http://localhost:${PORT}/api/test ║`);
    console.log('╚════════════════════════════════════════╝');
});