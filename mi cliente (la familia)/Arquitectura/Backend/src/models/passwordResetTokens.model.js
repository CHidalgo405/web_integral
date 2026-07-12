const db = require('../db');

/**
 * Crea un nuevo token de restablecimiento de contraseña.
 * Por defecto expira en 1 hora según la definición de la tabla en init.sql.
 */
const create = ({ user_id, token_hash }) =>
  db.query(
    'INSERT INTO password_reset_tokens (user_id, token_hash) VALUES ($1, $2) RETURNING *',
    [user_id, token_hash]
  );

/**
 * Busca un token activo (no usado y no expirado).
 */
const findActiveByHash = (token_hash) =>
  db.query(
    'SELECT * FROM password_reset_tokens WHERE token_hash = $1 AND used = FALSE AND expires_at > NOW()',
    [token_hash]
  );

/**
 * Marca un token específico como utilizado.
 */
const markAsUsed = (id) =>
  db.query(
    'UPDATE password_reset_tokens SET used = TRUE WHERE id = $1 RETURNING *',
    [id]
  );

/**
 * Invalida todos los tokens antiguos no utilizados de un usuario específico.
 */
const invalidateOldTokens = (user_id) =>
  db.query(
    'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE',
    [user_id]
  );

module.exports = {
  create,
  findActiveByHash,
  markAsUsed,
  invalidateOldTokens,
};