// ============================================
// PLAN DE TRABAJO - PRÓXIMOS PASOS
// ============================================
// Fecha: 4 de enero de 2026
// Estado: Backend estructura básica lista
// Siguiente: Sistema de autenticación

// ============================================
// ✅ COMPLETADO HOY
// ============================================
/*
1. ✅ Reestructuración del proyecto
   - Separación frontend/backend
   - Movido todos los archivos a sus carpetas

2. ✅ Configuración del servidor
   - Instalado Node.js + Express
   - Servidor escuchando en localhost:3000
   - Sirviendo el juego correctamente

3. ✅ Base de datos SQLite
   - Creada estructura de 3 tablas:
     * users (usuarios)
     * games (partidas)
     * contacts (mensajes)
   - Archivo: backend/src/config/database.js

4. ✅ Documentación
   - README.md completo
   - .gitignore configurado
   - Todo el código comentado línea por línea

5. ✅ Variables de entorno
   - Archivo .env con configuración
   - JWT_SECRET configurado
*/

// ============================================
// ✅ COMPLETADO - FASE 2 (8 enero 2026)
// ============================================
/*
OBJETIVO: Sistema de Login y Registro ✅ COMPLETADO

✅ PASO 1-8: Sistema de autenticación completo
   - Login/Registro ✅
   - Middleware JWT ✅
   - Recuperar contraseña con código ✅
   - Eliminar cuenta ✅
   - Login obligatorio para jugar ✅

✅ PASO 9: Sistema de Chat en Tiempo Real
   - Socket.IO instalado y configurado ✅
   - Chat general único (sin salas) ✅
   - Historial de mensajes guardado en BD ✅
   - frontend/chat.html creado ✅
   - Tabla chat_messages en BD ✅
   - Mensajes en tiempo real funcionando ✅
*/

// ============================================
// 📋 SIGUIENTE SESIÓN - FASE 3
// ============================================
/*
OBJETIVO: Guardar Partidas y Sistema de Guardado

PASO 1: Crear modelo de Partida
   Archivo: backend/src/models/Game.js
   - Guardar estado completo del juego
   - Guardar puntuación
   - Obtener historial de usuario
   - Cargar partida guardada

PASO 2: Crear rutas de partidas
   Archivo: backend/src/routes/games.js
   - POST /api/games/save → Guardar partida en curso
   - GET /api/games → Ver historial del usuario
   - GET /api/games/:id → Cargar partida específica
   - DELETE /api/games/:id → Eliminar partida guardada

PASO 3: Integrar guardado en el juego
   - Modificar script_new.js para guardar estado
   - Botón "Guardar Partida"
   - Botón "Cargar Partida"
   - Auto-guardar cada X minutos (opcional)

PASO 4: Crear página de historial
   - frontend/historial.html → Ver partidas guardadas
   - Mostrar estadísticas del usuario
   - Poder continuar partidas guardadas
*/

// ============================================
// 🔧 COMANDOS ÚTILES
// ============================================
/*
INICIAR SERVIDOR:
   cd backend
   node server.js

INSTALAR NUEVAS DEPENDENCIAS:
   cd backend
   npm install nombre-libreria

VER EL JUEGO:
   http://localhost:3000

PROBAR LA API:
   http://localhost:3000/api/test

GIT:
   git status
   git add -A
   git commit -m "mensaje"
   git push
*/

// ============================================
// 📚 CONCEPTOS EXPLICADOS
// ============================================
/*
VARIABLES DE ENTORNO (.env):
   - Archivo con datos secretos
   - NO se sube a GitHub
   - Se accede con process.env.NOMBRE_VARIABLE

JWT (JSON Web Token):
   - Token de seguridad
   - Se genera al hacer login
   - Se envía en cada petición para identificarse

MIDDLEWARE:
   - Función que se ejecuta antes de las rutas
   - Sirve para verificar permisos, validar datos, etc.

API REST:
   - Sistema de comunicación cliente-servidor
   - Usa HTTP (GET, POST, PUT, DELETE)
   - Envía y recibe JSON
*/

// ============================================
// ⚠️ PROBLEMAS CONOCIDOS Y SOLUCIONES
// ============================================
/*
PROBLEMA: El servidor no inicia
SOLUCIÓN: 
   cd backend
   npm install
   node server.js

PROBLEMA: Las imágenes no cargan
SOLUCIÓN: 
   - Verificar que las rutas apuntan a imagenes/zelaia.jpg
   - Verificar que el servidor está corriendo

PROBLEMA: "Cannot GET /api/algo"
SOLUCIÓN:
   - Esa ruta aún no existe
   - Hay que crearla en el siguiente paso
*/

// ============================================
// 📞 DUDAS PENDIENTES PARA RESOLVER
// ============================================
/*
1. ¿Quieres que el login sea obligatorio para jugar?
   O se puede jugar sin login (modo invitado)

2. ¿Quieres guardar todas las partidas automáticamente?
   O solo cuando el usuario le dé a "Guardar"

3. ¿Sistema de avatares predefinidos o subida de fotos?
*/

// ============================================
// 🎯 OBJETIVO FINAL
// ============================================
/*
Al terminar la FASE 2 (próxima sesión) tendrás:
   ✅ Login funcional
   ✅ Registro funcional
   ✅ Página de perfil
   ✅ Tokens JWT funcionando
   ✅ Rutas protegidas
   ✅ Frontend conectado con backend

FASE 3 (futura):
   - Guardar partidas en BD
   - Historial de partidas
   - Estadísticas
   - Ranking
*/

// ============================================
// FIN DEL ARCHIVO - ¡Hasta mañana! 👋
// ============================================