const db = require('../db');

const findAll = ({ date } = {}) => {
  const where = date ? 'WHERE DATE(pr.created_at)=$1' : '';
  const params = date ? [date] : [];
  return db.query(
    `SELECT pr.*, e.first_name, e.last_name
     FROM purchase_returns pr
     LEFT JOIN employees e ON e.id = pr.employee_id
     ${where} ORDER BY pr.created_at DESC`,
    params
  );
};

const findById = (id) =>
  db.query('SELECT * FROM purchase_returns WHERE id=$1', [id]);

const findItems = (return_id) =>
  db.query(
    `SELECT pri.*, i.name AS inventory_name
     FROM purchase_return_items pri
     JOIN inventory i ON i.id = pri.inventory_id
     WHERE pri.return_id=$1`,
    [return_id]
  );

const createWithItems = async (ret, items) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { rows: [r] } = await client.query(
      `INSERT INTO purchase_returns
         (purchase_id, employee_id, refund_method, reason, notes, total_refunded)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [ret.purchase_id, ret.employee_id ?? null, ret.refund_method, ret.reason, ret.notes ?? null, ret.total_refunded]
    );

    for (const item of items) {
      await client.query(
        `INSERT INTO purchase_return_items
           (return_id, purchase_item_id, inventory_id, quantity, unit_price, restock)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [r.id, item.purchase_item_id, item.inventory_id, item.quantity, item.unit_price, item.restock ?? true]
      );
    }

    await client.query('COMMIT');
    return r;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { findAll, findById, findItems, createWithItems };
