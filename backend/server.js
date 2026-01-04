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
const db = require('./src/config/database'); // Importar la base de datos

// 2. CREAR LA APLICACIÓN
const app = express(); // Crea el servidor
const PORT = process.env.PORT || 3000; // Puerto desde .env o 3000 por defecto

// 3. CONFIGURAR MIDDLEWARES
// Los middlewares son "filtros" que procesan las peticiones antes de llegar a las rutas

app.use(cors()); // Permite peticiones desde cualquier origen (frontend)
app.use(express.json()); // Permite leer JSON en el body de las peticiones
app.use(express.urlencoded({ extended: true })); // Permite leer formularios

// 4. SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND
// Esto hace que el servidor sirva tu juego HTML/CSS/JS
app.use(express.static(path.join(__dirname, '../frontend')));

// 5. RUTA DE PRUEBA
// Esta es una ruta simple para verificar que el servidor funciona
app.get('/api/test', (req, res) => {
    // req = request (petición que llega)
    // res = response (respuesta que envías)
    res.json({
        message: '✅ El servidor funciona correctamente',
        timestamp: new Date().toISOString()
    });
});

// 6. RUTA PRINCIPAL - Servir el juego
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 7. INICIAR EL SERVIDOR
app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║  🎮 SERVIDOR DEADBALL INICIADO        ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  📡 Servidor: http://localhost:${PORT}   ║`);
    console.log(`║  🎲 Juego:    http://localhost:${PORT}   ║`);
    console.log(`║  🔧 API Test: http://localhost:${PORT}/api/test ║`);
    console.log('╚════════════════════════════════════════╝');
});