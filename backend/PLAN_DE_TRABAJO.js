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
// 📋 SIGUIENTE SESIÓN - FASE 2
// ============================================
/*
OBJETIVO: Sistema de Login y Registro

PASO 1: Crear middleware de autenticación JWT
   Archivo: backend/src/middleware/auth.js
   - Verificar tokens
   - Proteger rutas

PASO 2: Crear rutas de autenticación
   Archivo: backend/src/routes/auth.js
   - POST /api/auth/register → Registrar usuario
   - POST /api/auth/login → Iniciar sesión
   - GET /api/auth/profile → Ver perfil (protegido)

PASO 3: Crear modelo de usuario
   Archivo: backend/src/models/User.js
   - Métodos para crear usuario
   - Métodos para buscar usuario
   - Encriptar contraseñas con bcrypt

PASO 4: Integrar rutas en server.js
   - Conectar las rutas al servidor principal

PASO 5: Crear páginas HTML del frontend
   - frontend/login.html → Página de login
   - frontend/register.html → Página de registro
   - frontend/profile.html → Página de perfil
   - frontend/inicio.html → Página de inicio
   - frontend/contacto.html → Página de contacto

PASO 6: Crear JavaScript para conectar frontend con backend
   Archivo: frontend/auth.js
   - Funciones para login
   - Funciones para registro
   - Guardar token en localStorage
   - Enviar token en peticiones
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