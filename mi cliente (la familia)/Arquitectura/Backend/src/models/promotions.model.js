const db = require('../db');

const findAll = ({ inventory_id, include_inactive } = {}) => {
  if (inventory_id) {
    return db.query(
      `SELECT * FROM promotions
       WHERE active=TRUE AND (inventory_id=$1 OR inventory_id IS NULL)
       ORDER BY created_at DESC`,
      [inventory_id]
    );
  }
  return db.query(`SELECT * FROM promotions ${include_inactive === 'true' ? '' : 'WHERE active=TRUE'} ORDER BY created_at DESC`);
};

const findOverlap = (inventoryId, validFrom, validUntil, excludeId) => db.query(
  `SELECT id FROM promotions WHERE inventory_id=$1 AND active=TRUE AND ($4::uuid IS NULL OR id<>$4)
   AND COALESCE(valid_until,'infinity'::date)>=COALESCE($2::date,'-infinity'::date)
   AND COALESCE(valid_from,'-infinity'::date)<=COALESCE($3::date,'infinity'::date) LIMIT 1`,
  [inventoryId, validFrom || null, validUntil || null, excludeId || null]
);

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

module.exports = { findAll, findById, findOverlap, create, update, remove };
