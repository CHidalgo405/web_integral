const db = require('../db');

const findAll = () =>
  db.query('SELECT * FROM v_inventory_status ORDER BY name');

const findById = (id) =>
  db.query('SELECT * FROM inventory WHERE id=$1', [id]);

const findLowStock = () =>
  db.query('SELECT * FROM v_low_stock');

const findByBarcode = (barcode) =>
  db.query(
    `SELECT i.*, pb.barcode, pb.description AS barcode_description
     FROM product_barcodes pb
     JOIN inventory i ON i.id = pb.inventory_id
     WHERE pb.barcode=$1`,
    [barcode]
  );

const create = ({ name, sku, description, category_id, uom_id, price, cost, stock, min_stock, has_expiration }) =>
  db.query(
    `INSERT INTO inventory
       (name, sku, description, category_id, uom_id, price, cost, stock, min_stock, has_expiration)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [name, sku ?? null, description ?? null, category_id ?? null, uom_id ?? null,
     price, cost ?? null, stock ?? 0, min_stock ?? 0, has_expiration ?? false]
  );

const update = (id, { name, sku, description, category_id, uom_id, price, cost, min_stock, has_expiration, active }) =>
  db.query(
    `UPDATE inventory
     SET name=$1, sku=$2, description=$3, category_id=$4, uom_id=$5,
         price=$6, cost=$7, min_stock=$8, has_expiration=$9, active=$10
     WHERE id=$11 RETURNING *`,
    [name, sku, description, category_id, uom_id, price, cost, min_stock, has_expiration, active ?? true, id]
  );

const remove = (id) =>
  db.query('UPDATE inventory SET active=FALSE WHERE id=$1 RETURNING id', [id]);

const findBarcodes = (inventory_id) =>
  db.query('SELECT * FROM product_barcodes WHERE inventory_id=$1', [inventory_id]);

const addBarcode = (inventory_id, { barcode, description }) =>
  db.query(
    'INSERT INTO product_barcodes (barcode, inventory_id, description) VALUES ($1,$2,$3) RETURNING *',
    [barcode, inventory_id, description ?? null]
  );

const removeBarcode = (barcode) =>
  db.query('DELETE FROM product_barcodes WHERE barcode=$1 RETURNING *', [barcode]);

module.exports = { findAll, findById, findLowStock, findByBarcode, create, update, remove, findBarcodes, addBarcode, removeBarcode };
