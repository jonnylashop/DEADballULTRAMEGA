# 🎮 DEADball ULTRAMEGA

Simulador de béisbol basado en dados con sistema de autenticación y base de datos.

---

## 📁 Estructura del Proyecto

```
DEADballULTRAMEGA/
│
├── backend/                          # SERVIDOR Y API
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Configuración de SQLite
│   │   ├── models/                  # Modelos de datos (por crear)
│   │   ├── routes/                  # Endpoints de la API (por crear)
│   │   └── middleware/              # Autenticación JWT (por crear)
│   │
│   ├── .env                         # Variables de entorno (NO SUBIR A GIT)
│   ├── server.js                    # ARCHIVO PRINCIPAL del servidor
│   ├── package.json                 # Dependencias del backend
│   └── database.sqlite              # Base de datos (se crea automáticamente)
│
├── frontend/                         # JUEGO Y PÁGINAS WEB
│   ├── imagenes/                    # Imágenes del juego
│   ├── audio/                       # Efectos de sonido
│   ├── index.html                   # Página principal del juego
│   ├── script_new.js                # Lógica del juego
│   ├── audio_system.js              # Sistema de audio
│   └── style.css                    # Estilos visuales
│
└── README.md                        # Este archivo
```

---

## 🗃️ Base de Datos (SQLite)

### Tablas Creadas:

#### 1️⃣ **users** (Usuarios)
```sql
- id              → Identificador único
- username        → Nombre de usuario
- email           → Correo electrónico
- password        → Contraseña encriptada
- profile_photo   → URL de la foto de perfil
- created_at      → Fecha de registro
- updated_at      → Última actualización
```

#### 2️⃣ **games** (Partidas)
```sql
- id              → Identificador único
- user_id         → Quién jugó la partida
- home_team       → Equipo local
- away_team       → Equipo visitante
- home_score      → Puntuación local
- away_score      → Puntuación visitante
- innings_played  → Innings jugados
- game_date       → Fecha de la partida
```

#### 3️⃣ **contacts** (Mensajes de contacto)
```sql
- id              → Identificador único
- name            → Nombre del remitente
- email           → Email del remitente
- message         → Mensaje
- created_at      → Fecha del mensaje
```

---

## 🚀 Cómo Iniciar el Proyecto

### 1️⃣ Instalar Dependencias
```bash
cd backend
npm install
```

### 2️⃣ Iniciar el Servidor
```bash
cd backend
node server.js
```

### 3️⃣ Abrir en el Navegador
```
http://localhost:3000
```

---

## 🔧 Tecnologías Utilizadas

### Backend:
- **Node.js** - Entorno de ejecución de JavaScript
- **Express** - Framework para crear el servidor web
- **SQLite3** - Base de datos ligera
- **bcryptjs** - Encriptación de contraseñas
- **jsonwebtoken (JWT)** - Tokens de autenticación
- **cors** - Permitir peticiones entre frontend y backend
- **dotenv** - Gestión de variables de entorno

### Frontend:
- **HTML5** - Estructura de la página
- **CSS3** - Estilos y animación
- **JavaScript (Vanilla)** - Lógica del juego
- **Bootstrap 5** - Framework CSS para diseño

---

## 🏗️ Arquitectura REST API

El proyecto sigue una arquitectura **REST (Representational State Transfer)** que separa claramente el frontend del backend:

```
┌─────────────┐         JSON          ┌─────────────┐        SQL         ┌──────────────┐
│   Cliente   │ ◄──────────────────► │   Servidor  │ ◄───────────────► │  SQLite DB   │
│  (Frontend) │   HTTP Methods        │  (Backend)  │    Consultas       │   (Datos)    │
│             │  GET/POST/PUT/DELETE  │             │                    │              │
└─────────────┘                       └─────────────┘                    └──────────────┘
```

### Flujo de Comunicación:
1. **Cliente** (navegador) envía petición HTTP con datos en formato JSON
2. **Servidor** (Express.js) recibe la petición, procesa la lógica de negocio
3. **Base de Datos** (SQLite) almacena/recupera datos mediante consultas SQL
4. **Servidor** devuelve respuesta JSON al cliente
5. **Cliente** renderiza los datos en la interfaz HTML

### 📡 Endpoints de la API (Implementados)

| URL | MÉTODO | DESCRIPCIÓN | ROL |
|-----|--------|-------------|-----|
| `/api/auth/register` | POST | Registrar nuevo usuario | Público |
| `/api/auth/login` | POST | Iniciar sesión y obtener JWT | Público |
| `/api/auth/verify` | GET | Verificar token de autenticación | Autenticado |
| `/api/auth/request-reset` | POST | Solicitar restablecimiento de contraseña | Público |
| `/api/auth/reset-password` | POST | Restablecer contraseña con token | Público |
| `/api/teams` | GET | Obtener todos los equipos del usuario | Autenticado |
| `/api/teams/:id` | GET | Obtener equipo específico por ID | Autenticado |
| `/api/teams` | POST | Crear nuevo equipo personalizado | Autenticado |
| `/api/teams/:id` | PUT | Actualizar equipo existente | Autenticado |
| `/api/teams/:id` | DELETE | Eliminar equipo | Autenticado |
| `/api/games/save` | POST | Guardar estado de partida | Autenticado |
| `/api/games/load` | GET | Cargar partidas guardadas | Autenticado |
| `/api/upload/player-photo` | POST | Subir foto de jugador (multipart) | Autenticado |

### 🔐 Autenticación:
- Autenticación mediante **JWT (JSON Web Token)**
- Token enviado en el header: `Authorization: Bearer <token>`
- Expiración del token: **24 horas**
- Contraseñas encriptadas con **bcryptjs**

### 📦 Formato de Respuesta:
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

---

## 📋 Estado Actual del Proyecto

### ✅ COMPLETADO:
- [x] Juego de béisbol funcional con sistema de dados profesional
- [x] Sistema de audio completo (música y efectos de sonido)
- [x] Servidor Express con arquitectura REST API
- [x] Base de datos SQLite con 6 tablas
- [x] Sistema de autenticación JWT
- [x] Sistema de login y registro de usuarios
- [x] Sistema de recuperación de contraseña (email)
- [x] Gestión completa de equipos (CRUD)
- [x] Sistema de guardado/carga de partidas
- [x] Sistema de subida de fotos de jugadores
- [x] Integración de equipos MLB
- [x] Interfaz de juego con efectos visuales
- [x] Sistema de chat entre usuarios

### 🚧 EN DESARROLLO:
- [ ] Página de perfil de usuario
- [ ] Cambio de foto de perfil
- [ ] Cambio de contraseña desde perfil
- [ ] Estadísticas avanzadas de jugadores

### 📝 POR HACER:
- [ ] Ranking de jugadores
- [ ] Historial detallado de partidas
- [ ] Sistema de torneos
- [ ] Modo multijugador en tiempo real

---

## 🔑 Variables de Entorno (.env)

Archivo ubicado en `backend/.env`:

```env
JWT_SECRET=deadball_super_secret_key_cambiar_en_produccion_123456
PORT=3000
JWT_EXPIRES_IN=24h
```

⚠️ **IMPORTANTE**: Este archivo NO se debe subir a GitHub

---

## 🎯 Próximos Pasos

1. **Implementar página de perfil de usuario**
2. **Añadir estadísticas avanzadas de partidas**
3. **Crear sistema de torneos**
4. **Optimizar rendimiento del motor de juego**
5. **Implementar modo multijugador**

---

## 👨‍💻 Desarrollo

Para trabajar con auto-reinicio del servidor:
```bash
npm run dev
```

---

## 📚 Recursos y Documentación

- [Express.js](https://expressjs.com/)
- [SQLite3](https://www.sqlite.org/)
- [JWT.io](https://jwt.io/)
- [Bootstrap 5](https://getbootstrap.com/)

---

## 🐛 Solución de Problemas

### El servidor no inicia:
```bash
# Verificar que Node.js está instalado
node --version

# Reinstalar dependencias
cd backend
npm install
```

### La base de datos no se crea:
```bash
# Verificar que la carpeta backend existe
# El archivo database.sqlite se crea automáticamente al iniciar el servidor
```

### El juego no carga imágenes:
```bash
# Verificar que las rutas en index.html son correctas
# Deben apuntar a: imagenes/zelaia.jpg
```

---

## 📄 Licencia

MIT

---

## 📞 Contacto

Proyecto desarrollado para Codespace Academy
