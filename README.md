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

## 📋 Estado Actual del Proyecto

### ✅ COMPLETADO:
- [x] Juego de béisbol funcional con dados
- [x] Sistema de audio (música y efectos)
- [x] Servidor Express configurado
- [x] Base de datos SQLite creada
- [x] Estructura de carpetas organizada

### 🚧 EN DESARROLLO:
- [ ] Sistema de login y registro
- [ ] Autenticación con JWT
- [ ] Página de inicio
- [ ] Página de contacto
- [ ] Página de perfil de usuario
- [ ] Guardar partidas en la base de datos
- [ ] Historial de partidas del usuario

### 📝 POR HACER:
- [ ] Cambio de foto de perfil
- [ ] Cambio de contraseña
- [ ] Estadísticas de jugadores
- [ ] Ranking de jugadores
- [ ] Sistema de recuperación de contraseña

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

## 📡 Endpoints de la API (Planificados)

### Autenticación:
```
POST /api/auth/register    → Registrar nuevo usuario
POST /api/auth/login       → Iniciar sesión
GET  /api/auth/profile     → Obtener perfil (requiere token)
```

### Juegos:
```
POST /api/games            → Guardar nueva partida
GET  /api/games            → Obtener historial de partidas
GET  /api/games/:id        → Obtener partida específica
```

### Contacto:
```
POST /api/contact          → Enviar mensaje de contacto
GET  /api/contact          → Listar mensajes (admin)
```

### Usuario:
```
PUT  /api/user/photo       → Cambiar foto de perfil
PUT  /api/user/password    → Cambiar contraseña
```

---

## 🎯 Próximos Pasos

1. **Crear middleware de autenticación JWT**
2. **Crear rutas de registro y login**
3. **Crear páginas HTML de login/registro**
4. **Conectar frontend con backend**
5. **Implementar guardado de partidas**

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
