const db = require('../db');

const findAllByUser = (userId) =>
  db.query(
    'SELECT * FROM user_payment_methods WHERE user_id=$1 ORDER BY is_default DESC, created_at',
    [userId]
  );

const findById = (id, userId) =>
  db.query('SELECT * FROM user_payment_methods WHERE id=$1 AND user_id=$2', [id, userId]);

const clearDefault = (userId) =>
  db.query('UPDATE user_payment_methods SET is_default=FALSE WHERE user_id=$1', [userId]);

const create = async (userId, data) => {
  if (data.is_default) await clearDefault(userId);
  return db.query(
    `INSERT INTO user_payment_methods
       (user_id, type, label, brand, last4, holder_name, expiry, is_default)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      userId,
      data.type,
      data.label,
      data.brand ?? null,
      data.last4 ?? null,
      data.holder_name ?? null,
      data.expiry ?? null,
      data.is_default ?? false,
    ]
  );
};

const update = async (id, userId, data) => {
  if (data.is_default) await clearDefault(userId);
  return db.query(
    `UPDATE user_payment_methods
     SET type=$1, label=$2, brand=$3, last4=$4, holder_name=$5, expiry=$6, is_default=$7
     WHERE id=$8 AND user_id=$9
     RETURNING *`,
    [
      data.type,
      data.label,
      data.brand ?? null,
      data.last4 ?? null,
      data.holder_name ?? null,
      data.expiry ?? null,
      data.is_default ?? false,
      id,
      userId,
    ]
  );
};

const remove = (id, userId) =>
  db.query('DELETE FROM user_payment_methods WHERE id=$1 AND user_id=$2 RETURNING id', [id, userId]);

module.exports = { findAllByUser, findById, create, update, remove };
