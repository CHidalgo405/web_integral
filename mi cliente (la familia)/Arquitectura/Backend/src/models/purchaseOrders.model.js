const db = require('../db');

const findAll = ({ status } = {}) => {
  const where = status ? 'WHERE po.status=$1' : '';
  const params = status ? [status] : [];
  return db.query(
    `SELECT po.*, s.name AS supplier_name
     FROM purchase_orders po
     JOIN suppliers s ON s.id = po.supplier_id
     ${where} ORDER BY po.created_at DESC`,
    params
  );
};

const findById = (id) =>
  db.query(
    `SELECT po.*, s.name AS supplier_name
     FROM purchase_orders po
     JOIN suppliers s ON s.id = po.supplier_id
     WHERE po.id=$1`,
    [id]
  );

const findItems = (order_id) =>
  db.query(
    `SELECT poi.*, i.name AS inventory_name, i.sku
     FROM purchase_order_items poi
     JOIN inventory i ON i.id = poi.inventory_id
     WHERE poi.order_id=$1`,
    [order_id]
  );

const create = ({ supplier_id, employee_id, expected_date, notes }) =>
  db.query(
    `INSERT INTO purchase_orders (supplier_id, employee_id, expected_date, notes)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [supplier_id, employee_id ?? null, expected_date ?? null, notes ?? null]
  );

const update = (id, { status, expected_date, notes }) =>
  db.query(
    'UPDATE purchase_orders SET status=$1, expected_date=$2, notes=$3 WHERE id=$4 RETURNING *',
    [status, expected_date, notes, id]
  );

const remove = (id) =>
  db.query("UPDATE purchase_orders SET status='cancelled' WHERE id=$1 RETURNING id", [id]);

const addItem = (order_id, { inventory_id, quantity_ordered, unit_cost }) =>
  db.query(
    `INSERT INTO purchase_order_items (order_id, inventory_id, quantity_ordered, unit_cost)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [order_id, inventory_id, quantity_ordered, unit_cost ?? null]
  );

const updateItem = (item_id, { quantity_ordered, quantity_received, unit_cost }) =>
  db.query(
    `UPDATE purchase_order_items
     SET quantity_ordered=$1, quantity_received=$2, unit_cost=$3
     WHERE id=$4 RETURNING *`,
    [quantity_ordered, quantity_received, unit_cost, item_id]
  );

const removeItem = (item_id) =>
  db.query('DELETE FROM purchase_order_items WHERE id=$1 RETURNING id', [item_id]);

module.exports = { findAll, findById, findItems, create, update, remove, addItem, updateItem, removeItem };
