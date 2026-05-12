const db = require('../db');

const findAll = ({ date, shift } = {}) => {
  const conditions = [];
  const params = [];
  if (date)  conditions.push(`DATE(tm.created_at)=$${params.push(date)}`);
  if (shift) conditions.push(`tm.shift=$${params.push(shift)}`);
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  return db.query(
    `SELECT tm.*, e.first_name, e.last_name
     FROM till_movements tm
     LEFT JOIN employees e ON e.id = tm.employee_id
     ${where} ORDER BY tm.created_at DESC`,
    params
  );
};

const findById = (id) =>
  db.query('SELECT * FROM till_movements WHERE id=$1', [id]);

const getBalance = () =>
  db.query('SELECT * FROM v_till_balance LIMIT 10');

const create = ({ employee_id, shift, movement_type, amount, reference_id, notes }) =>
  db.query(
    `INSERT INTO till_movements (employee_id, shift, movement_type, amount, reference_id, notes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [employee_id ?? null, shift ?? null, movement_type, amount, reference_id ?? null, notes ?? null]
  );

module.exports = { findAll, findById, getBalance, create };
