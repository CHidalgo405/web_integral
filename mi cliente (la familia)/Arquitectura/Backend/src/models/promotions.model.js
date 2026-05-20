const db = require('../db');

const findAll = ({ inventory_id } = {}) => {
  if (inventory_id) {
    return db.query(
      `SELECT * FROM promotions
       WHERE active=TRUE AND (inventory_id=$1 OR inventory_id IS NULL)
       ORDER BY created_at DESC`,
      [inventory_id]
    );
  }
  return db.query('SELECT * FROM promotions WHERE active=TRUE ORDER BY created_at DESC');
};

const findById = (id) =>
  db.query('SELECT * FROM promotions WHERE id=$1', [id]);

const create = ({ name, description, discount_pct, discount_fixed, inventory_id, valid_from, valid_until }) =>
  db.query(
    `INSERT INTO promotions
       (name, description, discount_pct, discount_fixed, inventory_id, valid_from, valid_until)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [name, description ?? null, discount_pct ?? null, discount_fixed ?? null, inventory_id ?? null, valid_from ?? null, valid_until ?? null]
  );

const update = (id, { name, description, discount_pct, discount_fixed, inventory_id, active, valid_from, valid_until }) =>
  db.query(
    `UPDATE promotions
     SET name=$1, description=$2, discount_pct=$3, discount_fixed=$4,
         inventory_id=$5, active=$6, valid_from=$7, valid_until=$8
     WHERE id=$9 RETURNING *`,
    [name, description, discount_pct, discount_fixed, inventory_id, active ?? true, valid_from, valid_until, id]
  );

const remove = (id) =>
  db.query('UPDATE promotions SET active=FALSE WHERE id=$1 RETURNING id', [id]);

module.exports = { findAll, findById, create, update, remove };
