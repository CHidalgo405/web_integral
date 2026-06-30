const db = require('../db');

const findAll = ({ active, category_id, low_stock } = {}) => {
  const conditions = [];
  const params = [];

  if (active !== undefined) conditions.push(`i.active=$${params.push(active === true || active === 'true')}`);
  if (category_id) conditions.push(`i.category_id=$${params.push(category_id)}`);
  if (low_stock !== undefined && (low_stock === true || low_stock === 'true')) {
    conditions.push('i.stock <= i.min_stock');
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  return db.query(
    `SELECT
       i.id, i.name, i.sku, i.description, i.category_id, c.name AS category,
       u.abbreviation AS unit, i.uom_id, i.price, i.cost, i.stock, i.min_stock,
       i.stock <= i.min_stock AS low_stock, i.has_expiration, i.active,
       i.created_at, i.updated_at
     FROM inventory i
     LEFT JOIN categories c ON c.id = i.category_id
     LEFT JOIN units_of_measure u ON u.id = i.uom_id
     ${where}
     ORDER BY i.name`,
    params
  );
};

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

const update = (id, { name, sku, description, category_id, uom_id, price, cost, stock, min_stock, has_expiration, active }) =>
  db.query(
    `UPDATE inventory
     SET name=$1, sku=$2, description=$3, category_id=$4, uom_id=$5,
         price=$6, cost=$7, stock=$8, min_stock=$9, has_expiration=$10, active=$11
     WHERE id=$12 RETURNING *`,
    [name, sku, description, category_id, uom_id, price, cost, stock ?? 0, min_stock ?? 0, has_expiration ?? false, active ?? true, id]
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

