const db = require('../db');

const create = async ({ user_id, token_hash, ip_address, user_agent, expires_at }) => {
  const query = `
    INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, expires_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [user_id, token_hash, ip_address, user_agent, expires_at];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const findByTokenHash = async (token_hash) => {
  const query = `
    SELECT * FROM user_sessions
    WHERE token_hash = $1 AND revoked = FALSE AND expires_at > NOW();
  `;
  const { rows } = await db.query(query, [token_hash]);
  return rows[0];
};

const revoke = async (token_hash) => {
  const query = `
    UPDATE user_sessions
    SET revoked = TRUE
    WHERE token_hash = $1
    RETURNING id;
  `;
  const { rows } = await db.query(query, [token_hash]);
  return rows[0];
};

const revokeAllForUser = async (user_id) => {
  const query = `
    UPDATE user_sessions
    SET revoked = TRUE
    WHERE user_id = $1
    RETURNING id;
  `;
  const { rows } = await db.query(query, [user_id]);
  return rows;
};

module.exports = {
  create,
  findByTokenHash,
  revoke,
  revokeAllForUser,
};
