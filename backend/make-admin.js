// ============================================
// SCRIPT PARA HACER ADMIN A UN USUARIO
// ============================================
// Este script convierte a un usuario normal en administrador/moderador
// Uso desde terminal: node make-admin.js tumail@ejemplo.com

// PASO 1: Importar las librerías necesarias
// sqlite3 = librería para trabajar con bases de datos SQLite
// .verbose() = modo detallado, muestra más información en caso de errores
const sqlite3 = require('sqlite3').verbose();

// path = librería para trabajar con rutas de archivos
// Es útil porque las rutas son diferentes en Windows, Mac y Linux
const path = require('path');

// PASO 2: Definir la ruta de la base de datos
// __dirname = la carpeta donde está este archivo (backend)
// 'database.sqlite' = el archivo de la base de datos
// path.join() une las rutas de forma correcta según el sistema operativo
const DB_PATH = path.join(__dirname, 'database.sqlite');

// PASO 3: Conectar con la base de datos
// Esto abre el archivo database.sqlite para poder leer y escribir en él
const db = new sqlite3.Database(DB_PATH);

// PASO 4: Obtener el email del usuario desde los argumentos de terminal
// Cuando ejecutas: node make-admin.js email@ejemplo.com
// process.argv es un array: ['node', 'make-admin.js', 'email@ejemplo.com']
// [0] = 'node' (el programa Node.js)
// [1] = 'make-admin.js' (el archivo que se ejecuta)
// [2] = 'email@ejemplo.com' (el email que queremos)
const email = process.argv[2];

// PASO 5: Verificar que se proporcionó un email
if (!email) {
    // Si no hay email, mostrar mensaje de error
    console.error('❌ Error: Debes proporcionar un email');
    // Mostrar instrucciones de uso
    console.log('Uso: node make-admin.js <email>');
    console.log('Ejemplo: node make-admin.js tumail@ejemplo.com');
    // process.exit(1) = salir del programa con código de error
    // 0 = éxito, 1 = error
    process.exit(1);
}

// PASO 6: Buscar el usuario en la base de datos
// db.get() = ejecuta una consulta SQL y devuelve UNA fila
// SELECT * = selecciona todos los campos
// FROM users = de la tabla users
// WHERE email = ? = donde el email sea igual al valor que pasamos
// El ? es un placeholder que se reemplaza por [email] (segundo parámetro)
// Esto previene inyección SQL (un tipo de ataque)
db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    // Esta función callback se ejecuta cuando termina la consulta
    // err = error si algo salió mal
    // user = el usuario encontrado (o undefined si no existe)

    // PASO 7: Verificar si hubo un error en la consulta
    if (err) {
        console.error('❌ Error:', err.message);
        db.close(); // Cerrar la conexión a la base de datos
        process.exit(1); // Salir con error
    }

    // PASO 8: Verificar si se encontró el usuario
    if (!user) {
        console.error(`❌ No se encontró usuario con email: ${email}`);
        db.close();
        process.exit(1);
    }

    // PASO 9: Verificar si ya es admin
    // is_admin es un campo que puede ser 0 (no admin) o 1 (admin)
    if (user.is_admin === 1) {
        console.log(`ℹ️  El usuario ${user.username} (${email}) ya es admin`);
        db.close();
        process.exit(0); // Salir sin error
    }

    // PASO 10: Actualizar el usuario para hacerlo admin
    // db.run() = ejecuta una consulta SQL que modifica datos
    // UPDATE users = actualiza la tabla users
    // SET is_admin = 1 = cambia el campo is_admin a 1 (admin)
    // WHERE email = ? = solo para el usuario con este email
    db.run('UPDATE users SET is_admin = 1 WHERE email = ?', [email], function(err) {
        // NOTA: Usamos function() en lugar de ()=> porque necesitamos
        // acceder a 'this' que contiene información sobre la operación

        // PASO 11: Verificar si hubo error al actualizar
        if (err) {
            console.error('❌ Error al actualizar:', err.message);
            db.close();
            process.exit(1);
        }

        // PASO 12: Mostrar mensaje de éxito
        console.log(`✅ Usuario ${user.username} (${email}) ahora es ADMIN`);
        console.log(`👑 Permisos de moderador activados`);
        console.log(`📋 Ahora puedes eliminar mensajes en el chat`);

        // PASO 13: Cerrar la conexión a la base de datos
        // IMPORTANTE: Siempre cerrar la conexión cuando termines
        db.close();
    });
});