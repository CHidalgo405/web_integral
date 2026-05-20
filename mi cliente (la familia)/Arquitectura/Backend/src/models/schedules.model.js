const db = require('../db');

const findAll = ({ work_date, employee_id } = {}) => {
  const conditions = [];
  const params = [];
  if (work_date)   conditions.push(`s.work_date=$${params.push(work_date)}`);
  if (employee_id) conditions.push(`s.employee_id=$${params.push(employee_id)}`);
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  return db.query(
    `SELECT s.*, e.first_name, e.last_name
     FROM schedules s
     JOIN employees e ON e.id = s.employee_id
     ${where} ORDER BY s.work_date, s.shift`,
    params
  );
};

const findById = (id) =>
  db.query('SELECT * FROM schedules WHERE id=$1', [id]);

const create = ({ employee_id, work_date, shift }) =>
  db.query(
    'INSERT INTO schedules (employee_id, work_date, shift) VALUES ($1,$2,$3) RETURNING *',
    [employee_id, work_date, shift]
  );

const update = (id, { employee_id, work_date, shift }) =>
  db.query(
    'UPDATE schedules SET employee_id=$1, work_date=$2, shift=$3 WHERE id=$4 RETURNING *',
    [employee_id, work_date, shift, id]
  );

const remove = (id) =>
  db.query('DELETE FROM schedules WHERE id=$1 RETURNING id', [id]);

module.exports = { findAll, findById, create, update, remove };
