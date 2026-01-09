-- Script para hacer admin al primer usuario
-- Ejecuta esto después de registrarte

-- Ver todos los usuarios
SELECT id, username, email, is_admin FROM users;

-- Hacer admin al primer usuario (o cambiar el ID por el tuyo)
UPDATE users SET is_admin = 1 WHERE id = 1;

-- Verificar
SELECT id, username, email, is_admin FROM users;
