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

module.exports = { findAll, findById, create, update, remove };
