# 📚 GUÍA COMPLETA PARA PRINCIPIANTES - DEADball

## 🎯 Índice
1. [Conceptos Básicos](#conceptos-básicos)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Flujo de Autenticación](#flujo-de-autenticación)
4. [Sistema de Chat](#sistema-de-chat)
5. [Glosario de Términos](#glosario-de-términos)

---

## 📖 Conceptos Básicos

### ¿Qué es Frontend y Backend?

**FRONTEND** (lo que ves)
- Son los archivos HTML, CSS y JavaScript que se ejecutan en tu navegador
- Es la "cara" de la aplicación, lo que el usuario ve y toca
- Ejemplos: botones, formularios, el chat, las páginas
- Archivos: `index.html`, `login.html`, `chat.html`, `auth.js`

**BACKEND** (lo que no ves)
- Es el servidor que procesa peticiones y guarda datos
- Es el "cerebro" de la aplicación, gestiona la lógica
- Se ejecuta en el servidor (tu computadora o un servidor remoto)
- Archivos: `server.js`, `auth.js` (del backend), base de datos

### ¿Qué es una API?

**API = Application Programming Interface**

Es como un "camarero" en un restaurante:
1. El cliente (frontend) hace un pedido
2. El camarero (API) lleva el pedido a la cocina
3. La cocina (backend) prepara el pedido
4. El camarero trae el pedido al cliente

**Ejemplo real en nuestro proyecto:**
```javascript
// Frontend pide: "quiero iniciar sesión"
fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
})

// Backend responde: "aquí está tu token"
res.json({ token: 'abc123', usuario: {...} })
```

---

## 🏗️ Estructura del Proyecto

```
DEADballULTRAMEGA/
│
├── backend/                    # El servidor (cerebro)
│   ├── server.js              # Punto de entrada del servidor
│   ├── database.sqlite        # Base de datos (archivo)
│   ├── make-admin.js          # Script para hacer admins
│   ├── .env                   # Variables secretas
│   ├── package.json           # Lista de dependencias
│   │
│   └── src/
│       ├── config/
│       │   └── database.js    # Configuración de BD
│       ├── middleware/
│       │   └── auth.js        # Verificador de tokens
│       ├── models/
│       │   └── User.js        # Lógica de usuarios
│       └── routes/
│           └── auth.js        # Rutas de autenticación
│
└── frontend/                   # La interfaz (cara)
    ├── index.html             # Página del juego
    ├── login.html             # Página de login
    ├── register.html          # Página de registro
    ├── profile.html           # Página de perfil
    ├── chat.html              # Página del chat
    ├── auth.js                # Funciones de autenticación
    └── style.css              # Estilos visuales
```

---

## 🔐 Flujo de Autenticación

### Paso a Paso: ¿Cómo funciona el login?

#### 1. Usuario rellena el formulario
```html
<!-- login.html -->
<input type="email" id="email">
<input type="password" id="password">
<button>Iniciar Sesión</button>
```

#### 2. JavaScript captura el envío
```javascript
// frontend/auth.js
form.addEventListener('submit', async (e) => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Llamar a la función login
    await login(email, password);
});
```

#### 3. Frontend envía datos al backend
```javascript
// frontend/auth.js
async function login(email, password) {
    const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',                    // Tipo de petición
        headers: {
            'Content-Type': 'application/json'  // Formato de datos
        },
        body: JSON.stringify({ email, password })  // Datos a enviar
    });
}
```

**¿Qué es fetch?**
- Es una función de JavaScript para hacer peticiones HTTP
- Es como enviar una carta por correo y esperar respuesta
- `await` = espera a que llegue la respuesta antes de continuar

**¿Qué es JSON?**
- JSON = JavaScript Object Notation
- Es un formato para enviar datos de forma organizada
- Ejemplo: `{ "nombre": "Juan", "edad": 25 }`

#### 4. Backend recibe la petición
```javascript
// backend/src/routes/auth.js
router.post('/login', async (req, res) => {
    // req.body contiene { email: "...", password: "..." }
    const { email, password } = req.body;
    
    // Buscar usuario en la base de datos
    const usuario = await Usuario.buscarPorEmail(email);
    
    // Verificar contraseña
    const passwordValido = await Usuario.verificarPassword(password, usuario.password);
    
    if (passwordValido) {
        // Generar token JWT
        const token = Usuario.generarToken(usuario);
        
        // Enviar respuesta exitosa
        res.json({ token, usuario });
    }
});
```

#### 5. Backend verifica las credenciales

**Encriptación de contraseñas con bcrypt:**
```javascript
// Cuando se registra (se guarda encriptada)
const passwordEncriptado = await bcrypt.hash('miPassword123', 10);
// Resultado: "$2b$10$abc123xyz..." (irreversible)

// Cuando hace login (se compara)
const esValida = await bcrypt.compare('miPassword123', passwordEncriptado);
// Resultado: true o false
```

**¿Por qué encriptar?**
- Si alguien roba la base de datos, no puede ver las contraseñas
- bcrypt es "unidireccional": no se puede desencriptar
- Cada contraseña genera un hash único

#### 6. Backend genera un JWT

**¿Qué es JWT (JSON Web Token)?**

Es un "carnet de identidad digital" en 3 partes:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  ← HEADER (algoritmo)
.
eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIn0  ← PAYLOAD (datos)
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← SIGNATURE (firma)
```

**Contenido del token:**
```javascript
// Información que guardamos en el token
{
    id: 1,
    email: "user@example.com",
    nombre: "Juan",
    isAdmin: 0,
    exp: 1704844800  // Fecha de expiración
}
```

**Código de generación:**
```javascript
// backend/src/models/User.js
const token = jwt.sign(
    { id, email, nombre, isAdmin },  // Datos a guardar
    process.env.JWT_SECRET,           // Clave secreta
    { expiresIn: '7d' }               // Expira en 7 días
);
```

#### 7. Frontend guarda el token

```javascript
// frontend/auth.js
localStorage.setItem('token', data.token);
localStorage.setItem('usuario', JSON.stringify(data.usuario));
```

**¿Qué es localStorage?**
- Es un "cajón" en el navegador para guardar datos
- Los datos persisten incluso si cierras el navegador
- Cada sitio web tiene su propio localStorage separado

#### 8. Frontend usa el token en cada petición

```javascript
// frontend/auth.js
const response = await fetch('/api/auth/profile', {
    headers: {
        'Authorization': `Bearer ${token}`  // ← Aquí va el token
    }
});
```

#### 9. Backend verifica el token (middleware)

```javascript
// backend/src/middleware/auth.js
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'].split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;  // Guardar datos del usuario
    
    next();  // Continuar a la ruta
};
```

---

## 💬 Sistema de Chat en Tiempo Real

### ¿Qué es Socket.IO?

**Socket.IO** es una librería para comunicación en **tiempo real**.

**Diferencia con HTTP normal:**

```
HTTP (petición-respuesta):
Cliente → "¿hay mensajes nuevos?" → Servidor
Cliente ← "no" ← Servidor
Cliente → "¿hay mensajes nuevos?" → Servidor
Cliente ← "sí, aquí está" ← Servidor
(tiene que preguntar constantemente)

WebSocket (tiempo real):
Cliente ←→ Servidor (conexión abierta)
Servidor → "nuevo mensaje" → Cliente
(el servidor avisa automáticamente)
```

### Flujo del Chat

#### 1. Usuario se conecta al chat
```javascript
// frontend/chat.html
const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('✅ Conectado');
});
```

#### 2. Usuario envía un mensaje
```javascript
// frontend/chat.html
socket.emit('chat-message', {
    userId: 1,
    username: 'Juan',
    message: 'Hola a todos!'
});
```

**emit = enviar un evento al servidor**

#### 3. Servidor recibe el mensaje
```javascript
// backend/server.js
socket.on('chat-message', async (data) => {
    // Guardar en base de datos
    await db.run('INSERT INTO chat_messages ...');
    
    // Enviar a TODOS los usuarios conectados
    io.emit('chat-message', {
        username: data.username,
        message: data.message,
        timestamp: new Date()
    });
});
```

**io.emit = enviar a todos**
**socket.emit = enviar solo a uno**

#### 4. Todos los usuarios reciben el mensaje
```javascript
// frontend/chat.html
socket.on('chat-message', (data) => {
    // Mostrar el mensaje en la pantalla
    mostrarMensaje(data.username, data.message);
});
```

### Moderación del Chat

#### Admin elimina un mensaje
```javascript
// frontend/chat.html (solo si es admin)
function eliminarMensaje(messageId) {
    socket.emit('delete-message', { messageId });
}

// backend/server.js
socket.on('delete-message', async (data) => {
    // Eliminar de la base de datos
    await db.run('DELETE FROM chat_messages WHERE id = ?');
    
    // Notificar a todos que se eliminó
    io.emit('message-deleted', { messageId });
});

// frontend/chat.html (todos los usuarios)
socket.on('message-deleted', (data) => {
    // Eliminar el mensaje de la pantalla
    document.querySelector(`[data-message-id="${data.messageId}"]`).remove();
});
```

---

## 📚 Glosario de Términos

### A

**API (Application Programming Interface)**
- Conjunto de rutas que permiten comunicarse con el servidor
- Ejemplo: `/api/auth/login`, `/api/chat/messages`

**async/await**
- Forma moderna de trabajar con código asíncrono en JavaScript
- `async` = función que puede esperar
- `await` = espera a que termine una operación

**Authentication (Autenticación)**
- Proceso de verificar quién eres
- "Demuestra que eres tú"

**Authorization (Autorización)**
- Proceso de verificar qué puedes hacer
- "Demuestra que tienes permiso"

### B

**Backend**
- El servidor que procesa la lógica y guarda datos

**bcrypt**
- Librería para encriptar contraseñas de forma segura

### C

**Callback**
- Función que se ejecuta cuando termina otra función
- Ejemplo: `db.get('SELECT ...', (err, user) => { ... })`

**CORS (Cross-Origin Resource Sharing)**
- Permite que el frontend hable con el backend
- Sin CORS, el navegador bloquea las peticiones

**CSS (Cascading Style Sheets)**
- Lenguaje para dar estilo visual a HTML

### D

**Database (Base de Datos)**
- Lugar donde se guardan los datos permanentemente
- Tipos: SQLite, MySQL, PostgreSQL, MongoDB

### E

**Environment Variables (Variables de Entorno)**
- Configuraciones secretas que no se suben a GitHub
- Archivo: `.env`
- Ejemplo: `JWT_SECRET=miClaveSecreta123`

**Express**
- Framework de Node.js para crear servidores web

### F

**fetch()**
- Función de JavaScript para hacer peticiones HTTP
- Reemplaza a `XMLHttpRequest` (antiguo)

**Frontend**
- La interfaz visual que ves en el navegador

### H

**HTTP (Hypertext Transfer Protocol)**
- Protocolo para comunicarse en internet
- Métodos: GET, POST, PUT, DELETE

**HTML (Hypertext Markup Language)**
- Lenguaje para estructurar páginas web

### J

**JavaScript**
- Lenguaje de programación para web
- Se usa en frontend y backend (Node.js)

**JSON (JavaScript Object Notation)**
- Formato para intercambiar datos
- Ejemplo: `{ "nombre": "Juan", "edad": 25 }`

**JWT (JSON Web Token)**
- Token de autenticación para identificar usuarios

### L

**localStorage**
- Almacenamiento en el navegador que persiste
- Tamaño máximo: ~5-10 MB

### M

**Middleware**
- Función que se ejecuta antes de las rutas
- Ejemplo: verificar tokens antes de acceder

### N

**Node.js**
- JavaScript en el servidor (backend)
- Permite crear servidores con JavaScript

**npm (Node Package Manager)**
- Gestor de paquetes de Node.js
- Comando para instalar librerías: `npm install`

### P

**Promise**
- Objeto que representa el resultado futuro de una operación
- Estados: pending, fulfilled, rejected

### R

**REST API**
- Estilo de arquitectura para APIs
- Usa métodos HTTP (GET, POST, PUT, DELETE)

**req (request)**
- Objeto con la información de la petición
- Contiene: body, headers, params, query

**res (response)**
- Objeto para enviar la respuesta
- Métodos: .json(), .send(), .status()

**Router**
- Objeto de Express para organizar rutas
- Ejemplo: `router.post('/login', ...)`

### S

**Socket.IO**
- Librería para comunicación en tiempo real
- Usa WebSockets

**SQL (Structured Query Language)**
- Lenguaje para trabajar con bases de datos
- Comandos: SELECT, INSERT, UPDATE, DELETE

**SQLite**
- Base de datos ligera en un solo archivo
- Perfecta para proyectos pequeños

### T

**Token**
- "Llave" digital que prueba tu identidad
- Se envía en cada petición

### W

**WebSocket**
- Protocolo para comunicación bidireccional en tiempo real
- Mantiene conexión abierta entre cliente y servidor

---

## 🎓 Recursos para Seguir Aprendiendo

### JavaScript
- [MDN Web Docs](https://developer.mozilla.org/es/)
- [JavaScript.info](https://javascript.info/)

### Node.js
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express Documentation](https://expressjs.com/)

### Bases de Datos
- [SQLite Tutorial](https://www.sqlitetutorial.net/)
- [SQL básico](https://www.w3schools.com/sql/)

### Seguridad
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT.io](https://jwt.io/)

### Tiempo Real
- [Socket.IO Documentation](https://socket.io/docs/)

---

## ❓ Preguntas Frecuentes

**P: ¿Por qué usar JWT en lugar de sesiones?**
R: JWT es stateless (sin estado). El servidor no necesita guardar las sesiones, solo verificar el token. Es más escalable.

**P: ¿Por qué SQLite y no MySQL?**
R: SQLite es más simple para aprender y proyectos pequeños. No necesita servidor adicional, es un solo archivo.

**P: ¿El token se puede hackear?**
R: Si usas HTTPS y una clave secreta fuerte, es muy difícil. Nunca subas tu `.env` a GitHub.

**P: ¿Por qué usar bcrypt y no otra encriptación?**
R: bcrypt está diseñado específicamente para contraseñas. Es lento a propósito para dificultar ataques de fuerza bruta.

**P: ¿Qué pasa si cambio JWT_SECRET?**
R: Todos los tokens existentes dejarán de funcionar. Los usuarios tendrán que volver a iniciar sesión.

---

📝 **Documento creado como guía educativa para el proyecto DEADball**
