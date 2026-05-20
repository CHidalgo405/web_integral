const db = require('../db');

const findAll = ({ inventory_id, include_removed } = {}) => {
  const conditions = [];
  const params = [];
  if (!include_removed) conditions.push('eb.removed=FALSE');
  if (inventory_id) conditions.push(`eb.inventory_id=$${params.push(inventory_id)}`);
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  return db.query(
    `SELECT eb.*, i.name AS inventory_name
     FROM expiration_batches eb
     JOIN inventory i ON i.id = eb.inventory_id
     ${where} ORDER BY eb.expiration_date ASC`,
    params
  );
};

const findById = (id) =>
  db.query('SELECT * FROM expiration_batches WHERE id=$1', [id]);

const create = ({ inventory_id, receipt_id, quantity, expiration_date }) =>
  db.query(
    `INSERT INTO expiration_batches (inventory_id, receipt_id, quantity, expiration_date)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [inventory_id, receipt_id ?? null, quantity, expiration_date]
  );

const update = (id, { quantity, notified, removed }) =>
  db.query(
    `UPDATE expiration_batches
     SET quantity=$1, notified=$2, removed=$3,
         removed_at = CASE WHEN $3=TRUE THEN NOW() ELSE removed_at END
     WHERE id=$4 RETURNING *`,
    [quantity, notified, removed, id]
  );

module.exports = { findAll, findById, create, update };
