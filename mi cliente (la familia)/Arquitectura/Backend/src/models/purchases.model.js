const db = require('../db');

const findAll = ({ date, employee_id, status } = {}) => {
  const conditions = [];
  const params = [];
  if (date)        conditions.push(`DATE(p.created_at)=$${params.push(date)}`);
  if (employee_id) conditions.push(`p.employee_id=$${params.push(employee_id)}`);
  if (status)      conditions.push(`p.status=$${params.push(status)}`);
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  return db.query(
    `SELECT p.*, e.first_name, e.last_name, c.name AS customer_name
     FROM purchases p
     LEFT JOIN employees e ON e.id = p.employee_id
     LEFT JOIN customers c ON c.id = p.customer_id
     ${where} ORDER BY p.created_at DESC`,
    params
  );
};

const findById = (id) =>
  db.query(
    `SELECT p.*, e.first_name, e.last_name, c.name AS customer_name
     FROM purchases p
     LEFT JOIN employees e ON e.id = p.employee_id
     LEFT JOIN customers c ON c.id = p.customer_id
     WHERE p.id=$1`,
    [id]
  );

const findItems = (purchase_id) =>
  db.query(
    `SELECT pi.*, i.name AS inventory_name, i.sku
     FROM purchase_items pi
     JOIN inventory i ON i.id = pi.inventory_id
     WHERE pi.purchase_id=$1`,
    [purchase_id]
  );

const createWithItems = async (purchase, items) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { rows: [p] } = await client.query(
      `INSERT INTO purchases
         (customer_id, employee_id, delivery_method, delivery_address,
          delivery_distance_km, delivery_zone_id, delivery_fee,
          payment_method, status, subtotal, discount_total, total, cash_tendered, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [
        purchase.customer_id ?? null,
        purchase.employee_id ?? null,
        purchase.delivery_method ?? 'on_spot',
        purchase.delivery_address ?? null,
        purchase.delivery_distance_km ?? null,
        purchase.delivery_zone_id ?? null,
        purchase.delivery_fee ?? 0,
        purchase.payment_method,
        purchase.status ?? 'completed',
        purchase.subtotal,
        purchase.discount_total ?? 0,
        purchase.total,
        purchase.cash_tendered ?? null,
        purchase.notes ?? null,
      ]
    );

    for (const item of items) {
      await client.query(
        `INSERT INTO purchase_items
           (purchase_id, inventory_id, promotion_id, quantity, unit_price, discount_pct, line_total)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [p.id, item.inventory_id, item.promotion_id ?? null, item.quantity, item.unit_price, item.discount_pct ?? 0, item.line_total]
      );
    }

    await client.query('COMMIT');
    return p;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateStatus = (id, status) =>
  db.query('UPDATE purchases SET status=$1 WHERE id=$2 RETURNING *', [status, id]);

module.exports = { findAll, findById, findItems, createWithItems, updateStatus };
