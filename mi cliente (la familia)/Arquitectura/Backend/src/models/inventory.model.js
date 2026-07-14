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
       i.image_url, i.image_public_id,
       COALESCE(r.rating, 0) AS rating, COALESCE(r.review_count, 0) AS review_count,
       i.created_at, i.updated_at
     FROM inventory i
     LEFT JOIN categories c ON c.id = i.category_id
     LEFT JOIN units_of_measure u ON u.id = i.uom_id
     LEFT JOIN (
       SELECT inventory_id, ROUND(AVG(rating), 1) AS rating, COUNT(*)::int AS review_count
       FROM product_reviews GROUP BY inventory_id
     ) r ON r.inventory_id = i.id
     ${where}
     ORDER BY i.name`,
    params
  );
};

const findById = (id) =>
  db.query(
    `SELECT i.*, COALESCE(r.rating, 0) AS rating, COALESCE(r.review_count, 0) AS review_count
     FROM inventory i
     LEFT JOIN (
       SELECT inventory_id, ROUND(AVG(rating), 1) AS rating, COUNT(*)::int AS review_count
       FROM product_reviews GROUP BY inventory_id
     ) r ON r.inventory_id = i.id
     WHERE i.id=$1`,
    [id],
  );

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

const create = ({ name, sku, description, category_id, uom_id, price, cost, stock, min_stock, has_expiration, image_url, image_public_id }) =>
  db.query(
    `INSERT INTO inventory
       (name, sku, description, category_id, uom_id, price, cost, stock, min_stock, has_expiration, image_url, image_public_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [name, sku ?? null, description ?? null, category_id ?? null, uom_id ?? null,
     price, cost ?? null, stock ?? 0, min_stock ?? 0, has_expiration ?? false, image_url ?? null, image_public_id ?? null]
  );

const update = (id, { name, sku, description, category_id, uom_id, price, cost, stock, min_stock, has_expiration, active, image_url, image_public_id }) =>
  db.query(
    `UPDATE inventory
     SET name=$1, sku=$2, description=$3, category_id=$4, uom_id=$5,
         price=$6, cost=$7, stock=$8, min_stock=$9, has_expiration=$10, active=$11, image_url=$13, image_public_id=$14
     WHERE id=$12 RETURNING *`,
    [name, sku, description, category_id, uom_id, price, cost, stock ?? 0, min_stock ?? 0, has_expiration ?? false, active ?? true, id, image_url ?? null, image_public_id ?? null]
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

const findMovements = ({ inventory_id, movement_type, limit = 100 } = {}) => {
  const conditions = [];
  const params = [];
  const parsedLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 100, 1), 250);

  if (inventory_id) conditions.push(`im.inventory_id=$${params.push(inventory_id)}`);
  if (movement_type) conditions.push(`im.movement_type=$${params.push(movement_type)}`);

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(parsedLimit);

  return db.query(
    `SELECT im.*, i.name AS inventory_name, i.sku,
            COALESCE(e.first_name || ' ' || e.last_name, u.username, 'Sistema') AS performed_by
     FROM inventory_movements im
     JOIN inventory i ON i.id = im.inventory_id
     LEFT JOIN users u ON u.id = im.user_id
     LEFT JOIN employees e ON e.id = u.employee_id
     ${where}
     ORDER BY im.created_at DESC
     LIMIT $${params.length}`,
    params
  );
};

const adjustStock = async (id, { quantity_delta, reason, notes, user_id }) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT id, name, sku, stock, min_stock FROM inventory WHERE id=$1 AND active=TRUE FOR UPDATE',
      [id]
    );

    if (!rows.length) {
      const error = new Error('Item not found');
      error.status = 404;
      throw error;
    }

    const item = rows[0];
    const previousStock = Number(item.stock);
    const newStock = previousStock + quantity_delta;
    if (newStock < 0) {
      const error = new Error('Stock cannot be negative');
      error.status = 400;
      throw error;
    }

    await client.query('UPDATE inventory SET stock=$1 WHERE id=$2', [newStock, id]);
    const movement = await client.query(
      `INSERT INTO inventory_movements
         (inventory_id, user_id, movement_type, quantity_delta, previous_stock, new_stock, reason, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [id, user_id ?? null, quantity_delta > 0 ? 'entry' : 'exit', quantity_delta,
       previousStock, newStock, reason, notes ?? null]
    );

    await client.query('COMMIT');
    return { ...movement.rows[0], inventory_name: item.name, sku: item.sku, min_stock: item.min_stock };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  findAll,
  findById,
  findLowStock,
  findByBarcode,
  create,
  update,
  remove,
  findBarcodes,
  addBarcode,
  removeBarcode,
  findMovements,
  adjustStock,
};
