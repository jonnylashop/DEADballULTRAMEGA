# Cómo hacerte ADMIN / MODERADOR del Chat

## Método 1: Script automático (Recomendado)

1. Abre una terminal en la carpeta `backend`
2. Ejecuta el script con tu email:

```bash
node make-admin.js tu-email@ejemplo.com
```

**Ejemplo:**
```bash
node make-admin.js admin@deadball.com
```

3. Verás un mensaje de confirmación:
```
✅ Usuario admin ahora es ADMIN
👑 Permisos de moderador activados
📋 Ahora puedes eliminar mensajes en el chat
```

4. Cierra sesión y vuelve a iniciar sesión para que los cambios surtan efecto

---

## Método 2: Manualmente con SQLite

1. Abre una terminal en la carpeta `backend`
2. Abre la base de datos:

```bash
sqlite3 database.sqlite
```

3. Consulta tu ID de usuario:

```sql
SELECT id, username, email, is_admin FROM users;
```

4. Haz admin al usuario con tu ID (cambia el número):

```sql
UPDATE users SET is_admin = 1 WHERE id = 1;
```

5. Verifica:

```sql
SELECT id, username, email, is_admin FROM users;
```

6. Sal de SQLite:

```sql
.quit
```

7. Cierra sesión y vuelve a iniciar sesión

---

## Permisos de Admin/Moderador

Como admin podrás:

- ✅ Ver un botón 🗑️ junto a cada mensaje del chat
- ✅ Eliminar cualquier mensaje del chat
- ✅ Los mensajes se eliminan en tiempo real para todos los usuarios
- ✅ Tu nombre aparece con una insignia "ADMIN" en tus mensajes
- ✅ Tu nombre tiene un emoji 👑 en el chat

---

## Revocar permisos de admin

Si quieres quitar los permisos de admin a alguien:

```bash
node make-admin.js email@usuario.com --remove
```

O manualmente:

```sql
UPDATE users SET is_admin = 0 WHERE email = 'email@usuario.com';
```
