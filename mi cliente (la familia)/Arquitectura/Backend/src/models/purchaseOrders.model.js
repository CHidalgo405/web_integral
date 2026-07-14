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

const receiveAll = async (orderId, receiptItems, notes) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { rows: orders } = await client.query(
      `SELECT * FROM purchase_orders WHERE id=$1 FOR UPDATE`, [orderId]
    );
    const order = orders[0];
    if (!order) throw Object.assign(new Error('Orden de compra no encontrada'), { status: 404 });
    if (!['sent', 'partial'].includes(order.status)) {
      throw Object.assign(new Error('La orden ya no se puede recibir'), { status: 409 });
    }
    const { rows: lines } = await client.query(
      `SELECT poi.*, i.has_expiration, i.name AS inventory_name
       FROM purchase_order_items poi JOIN inventory i ON i.id=poi.inventory_id
       WHERE poi.order_id=$1 ORDER BY poi.id FOR UPDATE`, [orderId]
    );
    if (!lines.length) throw Object.assign(new Error('La orden no contiene productos'), { status: 409 });
    const input = new Map((receiptItems || []).map((item) => [item.inventory_id, item]));
    const receipts = [];
    for (const line of lines) {
      const quantity = line.quantity_ordered - line.quantity_received;
      if (quantity <= 0) continue;
      const supplied = input.get(line.inventory_id) || {};
      if (line.has_expiration && !supplied.expiration_date) {
        throw Object.assign(new Error(`Indica la caducidad de ${line.inventory_name}`), { status: 400 });
      }
      const { rows: saved } = await client.query(
        `INSERT INTO stock_receipts
          (inventory_id,supplier_id,purchase_order_id,quantity,cost_per_unit,expiration_date,notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [line.inventory_id, order.supplier_id, orderId, quantity, line.unit_cost,
          supplied.expiration_date || null, notes || null]
      );
      const receipt = saved[0];
      receipts.push(receipt);
      if (line.has_expiration) {
        await client.query(
          `INSERT INTO expiration_batches (inventory_id,receipt_id,quantity,expiration_date)
           VALUES ($1,$2,$3,$4)`,
          [line.inventory_id, receipt.id, quantity, supplied.expiration_date]
        );
      }
      await client.query(
        `UPDATE purchase_order_items SET quantity_received=quantity_ordered WHERE id=$1`, [line.id]
      );
    }
    await client.query(`UPDATE purchase_orders SET status='received' WHERE id=$1`, [orderId]);
    await client.query('COMMIT');
    return { order_id: orderId, status: 'received', receipts };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { findAll, findById, findItems, create, update, remove, addItem, updateItem, removeItem, receiveAll };
