const db = require('../db');

const findAll = ({ inventory_id } = {}) => {
  if (inventory_id) {
    return db.query(
      'SELECT * FROM stock_receipts WHERE inventory_id=$1 ORDER BY received_at DESC',
      [inventory_id]
    );
  }
  return db.query('SELECT * FROM stock_receipts ORDER BY received_at DESC');
};

const findById = (id) =>
  db.query('SELECT * FROM stock_receipts WHERE id=$1', [id]);

const create = ({ inventory_id, supplier_id, purchase_order_id, quantity, cost_per_unit, expiration_date, notes }) =>
  db.query(
    `INSERT INTO stock_receipts
       (inventory_id, supplier_id, purchase_order_id, quantity, cost_per_unit, expiration_date, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [inventory_id, supplier_id ?? null, purchase_order_id ?? null, quantity, cost_per_unit ?? null, expiration_date ?? null, notes ?? null]
  );

module.exports = { findAll, findById, create };
