const db = require('../db');

const currentShift = () => (new Date().getHours() < 14 ? 'morning' : 'afternoon');

const latestAudit = (executor, employeeId) =>
  executor.query(
    `SELECT * FROM cash_audit
     WHERE employee_id=$1 AND created_at::date=CURRENT_DATE
     ORDER BY created_at DESC LIMIT 1`,
    [employeeId],
  );

const getStatus = async (employeeId) => {
  const { rows: audits } = await latestAudit(db, employeeId);
  const lastAudit = audits[0] ?? null;
  const isOpen = lastAudit?.audit_type === 'open';

  let balance = 0;
  if (isOpen) {
    const { rows } = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS balance
       FROM till_movements
       WHERE employee_id=$1 AND created_at >= $2`,
      [employeeId, lastAudit.created_at],
    );
    balance = Number(rows[0].balance);
  }

  const { rows: salesRows } = await db.query(
    `SELECT COUNT(*)::int AS sales_count, COALESCE(SUM(total), 0) AS sales_total
     FROM purchases
     WHERE employee_id=$1 AND status='completed' AND created_at::date=CURRENT_DATE`,
    [employeeId],
  );

  return {
    is_open: isOpen,
    shift: isOpen ? lastAudit.shift : null,
    opened_at: isOpen ? lastAudit.created_at : null,
    opening_amount: isOpen ? Number(lastAudit.counted_amount) : 0,
    expected_cash: balance,
    sales_count: salesRows[0].sales_count,
    sales_total: Number(salesRows[0].sales_total),
    last_close: !isOpen && lastAudit?.audit_type === 'close' ? lastAudit : null,
  };
};

const open = async (employeeId, openingAmount, shift = currentShift()) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { rows: audits } = await latestAudit(client, employeeId);
    if (audits[0]?.audit_type === 'open') {
      const err = new Error('La caja ya está abierta');
      err.status = 409;
      throw err;
    }

    const { rows: [audit] } = await client.query(
      `INSERT INTO cash_audit
         (employee_id, shift, audit_type, expected_amount, counted_amount, notes)
       VALUES ($1,$2,'open',$3,$3,'Apertura de caja') RETURNING *`,
      [employeeId, shift, openingAmount],
    );
    await client.query(
      `INSERT INTO till_movements
         (employee_id, shift, movement_type, amount, reference_id, notes)
       VALUES ($1,$2,'float_in',$3,$4,'Fondo inicial de caja')`,
      [employeeId, shift, openingAmount, audit.id],
    );
    await client.query('COMMIT');
    return audit;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const close = async (employeeId, countedAmount) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { rows: audits } = await latestAudit(client, employeeId);
    const opening = audits[0];
    if (!opening || opening.audit_type !== 'open') {
      const err = new Error('No hay una caja abierta');
      err.status = 409;
      throw err;
    }

    const { rows: balanceRows } = await client.query(
      `SELECT COALESCE(SUM(amount), 0) AS balance
       FROM till_movements
       WHERE employee_id=$1 AND created_at >= $2`,
      [employeeId, opening.created_at],
    );
    const expected = Number(balanceRows[0].balance);
    const { rows: [audit] } = await client.query(
      `INSERT INTO cash_audit
         (employee_id, shift, audit_type, expected_amount, counted_amount, notes)
       VALUES ($1,$2,'close',$3,$4,'Cierre de caja') RETURNING *`,
      [employeeId, opening.shift, expected, countedAmount],
    );
    await client.query('COMMIT');
    return audit;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { getStatus, open, close, currentShift };
