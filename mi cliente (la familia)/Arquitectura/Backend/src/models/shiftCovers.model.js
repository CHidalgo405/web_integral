const db = require('../db');

const findAll = ({ work_date } = {}) => {
  if (work_date) {
    return db.query('SELECT * FROM v_shift_cover_report WHERE work_date=$1', [work_date]);
  }
  return db.query('SELECT * FROM v_shift_cover_report');
};

const findById = (id) =>
  db.query('SELECT * FROM shift_covers WHERE id=$1', [id]);

const create = ({ schedule_id, original_employee_id, covering_employee_id, work_date, shift, discount_applied, notes }) =>
  db.query(
    `INSERT INTO shift_covers
       (schedule_id, original_employee_id, covering_employee_id, work_date, shift, discount_applied, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [schedule_id, original_employee_id, covering_employee_id, work_date, shift, discount_applied ?? false, notes ?? null]
  );

const remove = (id) =>
  db.query('DELETE FROM shift_covers WHERE id=$1 RETURNING id', [id]);

module.exports = { findAll, findById, create, remove };
