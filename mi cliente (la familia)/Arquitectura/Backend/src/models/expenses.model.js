const db = require('../db');

const findAll = ({ date, category_id } = {}) => {
  const conditions = [];
  const params = [];
  if (date)        conditions.push(`e.expense_date=$${params.push(date)}`);
  if (category_id) conditions.push(`e.category_id=$${params.push(category_id)}`);
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  return db.query(
    `SELECT e.*, ec.name AS category_name, emp.first_name, emp.last_name
     FROM expenses e
     LEFT JOIN expense_categories ec  ON ec.id  = e.category_id
     LEFT JOIN employees emp          ON emp.id = e.employee_id
     ${where} ORDER BY e.expense_date DESC, e.created_at DESC`,
    params
  );
};

const findById = (id) =>
  db.query('SELECT * FROM expenses WHERE id=$1', [id]);

const create = ({ category_id, employee_id, description, amount, payment_method, receipt_ref, expense_date }) =>
  db.query(
    `INSERT INTO expenses
       (category_id, employee_id, description, amount, payment_method, receipt_ref, expense_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [category_id ?? null, employee_id ?? null, description, amount, payment_method, receipt_ref ?? null, expense_date ?? new Date().toISOString().slice(0, 10)]
  );

const update = (id, { category_id, employee_id, description, amount, payment_method, receipt_ref, expense_date }) =>
  db.query(
    `UPDATE expenses
     SET category_id=$1, employee_id=$2, description=$3, amount=$4,
         payment_method=$5, receipt_ref=$6, expense_date=$7
     WHERE id=$8 RETURNING *`,
    [category_id, employee_id, description, amount, payment_method, receipt_ref, expense_date, id]
  );

const remove = (id) =>
  db.query('DELETE FROM expenses WHERE id=$1 RETURNING id', [id]);

const reverse = async (id, { reason, created_by }) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT * FROM expenses WHERE id=$1 FOR UPDATE', [id]);
    const original = rows[0];
    if (!original) throw Object.assign(new Error('Gasto no encontrado'), { status: 404 });
    if (original.entry_type === 'reversal') {
      throw Object.assign(new Error('Una reversión no puede revertirse'), { status: 409 });
    }
    const existing = await client.query('SELECT id FROM expenses WHERE reverses_expense_id=$1', [id]);
    if (existing.rowCount) throw Object.assign(new Error('El gasto ya fue revertido'), { status: 409 });
    if (!reason || reason.trim().length < 4) {
      throw Object.assign(new Error('Indica el motivo de la reversión'), { status: 400 });
    }
    const { rows: saved } = await client.query(
      `INSERT INTO expenses
        (category_id,employee_id,description,amount,payment_method,receipt_ref,expense_date,
         entry_type,reverses_expense_id,reversal_reason,created_by)
       VALUES ($1,$2,$3,$4,$5,$6,CURRENT_DATE,'reversal',$7,$8,$9) RETURNING *`,
      [original.category_id, original.employee_id, 'Reversión: ' + original.description,
        original.amount, original.payment_method, original.receipt_ref, id, reason.trim(), created_by]
    );
    await client.query('COMMIT');
    return saved[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
};

module.exports = { findAll, findById, create, update, remove, reverse };
