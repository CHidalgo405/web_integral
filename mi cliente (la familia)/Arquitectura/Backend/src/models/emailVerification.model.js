const db = require('../db');

const MAX_ATTEMPTS = 3;

/**
 * Crea o reemplaza el registro de verificación para un usuario.
 * Usa ON CONFLICT para que sólo exista un código pendiente por usuario.
 */
const upsert = ({ user_id, code_hash }) =>
  db.query(
    `INSERT INTO email_verification_codes (user_id, code_hash)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE
       SET code_hash    = EXCLUDED.code_hash,
           attempts     = 0,
           verified     = FALSE,
           locked_until = NULL,
           created_at   = NOW(),
           expires_at   = NOW() + INTERVAL '1 hour'
     RETURNING *`,
    [user_id, code_hash]
  );

/**
 * Busca el registro de verificación pendiente (no verificado) de un usuario.
 */
const findPendingByUserId = (user_id) =>
  db.query(
    'SELECT * FROM email_verification_codes WHERE user_id = $1 AND verified = FALSE',
    [user_id]
  );

/**
 * Incrementa el número de intentos fallidos.
 * Si llega al máximo, activa el bloqueo por 1 hora.
 */
const incrementAttempts = async (id, currentAttempts) => {
  const newAttempts = currentAttempts + 1;
  if (newAttempts >= MAX_ATTEMPTS) {
    return db.query(
      `UPDATE email_verification_codes
       SET attempts = $1, locked_until = NOW() + INTERVAL '1 hour'
       WHERE id = $2 RETURNING *`,
      [newAttempts, id]
    );
  }
  return db.query(
    'UPDATE email_verification_codes SET attempts = $1 WHERE id = $2 RETURNING *',
    [newAttempts, id]
  );
};

/**
 * Marca el código como verificado exitosamente.
 */
const markAsVerified = (id) =>
  db.query(
    'UPDATE email_verification_codes SET verified = TRUE WHERE id = $1 RETURNING *',
    [id]
  );

module.exports = {
  upsert,
  findPendingByUserId,
  incrementAttempts,
  markAsVerified,
  MAX_ATTEMPTS,
};
