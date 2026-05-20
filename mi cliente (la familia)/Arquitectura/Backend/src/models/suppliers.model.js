const db = require('../db');

const findAll = () =>
  db.query('SELECT * FROM suppliers WHERE active=TRUE ORDER BY name');

const findById = (id) =>
  db.query('SELECT * FROM suppliers WHERE id=$1', [id]);

const create = ({ name, contact_name, phone, email, address, notes }) =>
  db.query(
    `INSERT INTO suppliers (name, contact_name, phone, email, address, notes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [name, contact_name ?? null, phone ?? null, email ?? null, address ?? null, notes ?? null]
  );

const update = (id, { name, contact_name, phone, email, address, notes, active }) =>
  db.query(
    `UPDATE suppliers
     SET name=$1, contact_name=$2, phone=$3, email=$4, address=$5, notes=$6, active=$7
     WHERE id=$8 RETURNING *`,
    [name, contact_name, phone, email, address, notes, active ?? true, id]
  );

const remove = (id) =>
  db.query('UPDATE suppliers SET active=FALSE WHERE id=$1 RETURNING id', [id]);

const findItems = (supplier_id) =>
  db.query(
    `SELECT si.*, i.name AS inventory_name, i.sku
     FROM supplier_items si
     JOIN inventory i ON i.id = si.inventory_id
     WHERE si.supplier_id=$1`,
    [supplier_id]
  );

const addItem = (supplier_id, { inventory_id, supplier_sku, supplier_price, is_preferred }) =>
  db.query(
    `INSERT INTO supplier_items (supplier_id, inventory_id, supplier_sku, supplier_price, is_preferred)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [supplier_id, inventory_id, supplier_sku ?? null, supplier_price ?? null, is_preferred ?? false]
  );

const updateItem = (supplier_id, inventory_id, { supplier_sku, supplier_price, is_preferred }) =>
  db.query(
    `UPDATE supplier_items
     SET supplier_sku=$1, supplier_price=$2, is_preferred=$3
     WHERE supplier_id=$4 AND inventory_id=$5 RETURNING *`,
    [supplier_sku, supplier_price, is_preferred, supplier_id, inventory_id]
  );

const removeItem = (supplier_id, inventory_id) =>
  db.query(
    'DELETE FROM supplier_items WHERE supplier_id=$1 AND inventory_id=$2 RETURNING *',
    [supplier_id, inventory_id]
  );

module.exports = { findAll, findById, create, update, remove, findItems, addItem, updateItem, removeItem };
