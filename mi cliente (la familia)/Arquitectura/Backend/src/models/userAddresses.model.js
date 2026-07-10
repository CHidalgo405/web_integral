const db = require('../db');

const findAllByUser = (userId) =>
  db.query(
    'SELECT * FROM user_addresses WHERE user_id=$1 ORDER BY is_default DESC, created_at',
    [userId]
  );

const findById = (id, userId) =>
  db.query('SELECT * FROM user_addresses WHERE id=$1 AND user_id=$2', [id, userId]);

const clearDefault = (userId) =>
  db.query('UPDATE user_addresses SET is_default=FALSE WHERE user_id=$1', [userId]);

const create = async (userId, data) => {
  if (data.is_default) await clearDefault(userId);
  return db.query(
    `INSERT INTO user_addresses
       (user_id, label, full_name, phone, street, exterior_number, interior_number,
        neighborhood, city, state, zip_code, notes, is_default)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      userId,
      data.label ?? 'Casa',
      data.full_name,
      data.phone ?? null,
      data.street,
      data.exterior_number ?? null,
      data.interior_number ?? null,
      data.neighborhood ?? null,
      data.city ?? null,
      data.state ?? null,
      data.zip_code ?? null,
      data.notes ?? null,
      data.is_default ?? false,
    ]
  );
};

const update = async (id, userId, data) => {
  if (data.is_default) await clearDefault(userId);
  return db.query(
    `UPDATE user_addresses
     SET label=$1, full_name=$2, phone=$3, street=$4, exterior_number=$5,
         interior_number=$6, neighborhood=$7, city=$8, state=$9, zip_code=$10,
         notes=$11, is_default=$12
     WHERE id=$13 AND user_id=$14
     RETURNING *`,
    [
      data.label ?? 'Casa',
      data.full_name,
      data.phone ?? null,
      data.street,
      data.exterior_number ?? null,
      data.interior_number ?? null,
      data.neighborhood ?? null,
      data.city ?? null,
      data.state ?? null,
      data.zip_code ?? null,
      data.notes ?? null,
      data.is_default ?? false,
      id,
      userId,
    ]
  );
};

const remove = (id, userId) =>
  db.query('DELETE FROM user_addresses WHERE id=$1 AND user_id=$2 RETURNING id', [id, userId]);

module.exports = { findAllByUser, findById, create, update, remove };
