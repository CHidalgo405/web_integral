const db = require('../db');

const findAll = ({ date, shift } = {}) => {
  const conditions = [];
  const params = [];
  if (date)  conditions.push(`DATE(ca.created_at)=$${params.push(date)}`);
  if (shift) conditions.push(`ca.shift=$${params.push(shift)}`);
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  return db.query(
    `SELECT ca.*, e.first_name, e.last_name
     FROM cash_audit ca
     LEFT JOIN employees e ON e.id = ca.employee_id
     ${where} ORDER BY ca.created_at DESC`,
    params
  );
};

const findById = (id) =>
  db.query('SELECT * FROM cash_audit WHERE id=$1', [id]);

const create = ({ employee_id, shift, audit_type, expected_amount, counted_amount, notes }) =>
  db.query(
    `INSERT INTO cash_audit (employee_id, shift, audit_type, expected_amount, counted_amount, notes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [employee_id ?? null, shift ?? null, audit_type, expected_amount ?? null, counted_amount, notes ?? null]
  );

module.exports = { findAll, findById, create };
