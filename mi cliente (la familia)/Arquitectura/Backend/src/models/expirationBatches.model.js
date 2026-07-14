const db = require('../db');

const findAll = ({ inventory_id, include_removed } = {}) => {
  const conditions = [];
  const params = [];
  if (include_removed !== 'true' && include_removed !== true) conditions.push('eb.removed=FALSE');
  if (inventory_id) conditions.push(`eb.inventory_id=$${params.push(inventory_id)}`);
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  return db.query(
    `SELECT eb.*, i.name AS inventory_name
     FROM expiration_batches eb
     JOIN inventory i ON i.id = eb.inventory_id
     ${where} ORDER BY eb.expiration_date ASC`,
    params
  );
};

const findById = (id) =>
  db.query('SELECT * FROM expiration_batches WHERE id=$1', [id]);

const create = ({ inventory_id, receipt_id, quantity, expiration_date }) =>
  db.query(
    `INSERT INTO expiration_batches (inventory_id, receipt_id, quantity, expiration_date)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [inventory_id, receipt_id ?? null, quantity, expiration_date]
  );

const update = (id, { quantity, notified, removed }) =>
  db.query(
    `UPDATE expiration_batches
     SET quantity=$1, notified=$2, removed=$3,
         removed_at = CASE WHEN $3=TRUE THEN NOW() ELSE removed_at END
     WHERE id=$4 RETURNING *`,
    [quantity, notified, removed, id]
  );

const removeBatch = async (id, reason) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT * FROM expiration_batches WHERE id=$1 FOR UPDATE', [id]
    );
    const batch = rows[0];
    if (!batch) throw Object.assign(new Error('Lote no encontrado'), { status: 404 });
    if (batch.removed) throw Object.assign(new Error('El lote ya fue retirado'), { status: 409 });
    await client.query(
      'UPDATE inventory SET stock=GREATEST(stock-$1,0) WHERE id=$2',
      [batch.quantity, batch.inventory_id]
    );
    await client.query(
      'UPDATE expiration_batches SET removed=TRUE,removed_at=NOW() WHERE id=$1', [id]
    );
    await client.query(
      `INSERT INTO expired_log (inventory_id,batch_id,quantity_removed,expiration_date,reason)
       VALUES ($1,$2,$3,$4,$5)`,
      [batch.inventory_id, id, batch.quantity, batch.expiration_date, reason || 'expired']
    );
    await client.query('COMMIT');
    return { ...batch, removed: true, reason: reason || 'expired' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
};

module.exports = { findAll, findById, create, update, removeBatch };
