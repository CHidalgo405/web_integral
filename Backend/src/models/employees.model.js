const db = require('../db');

const findAll = () =>
  db.query('SELECT * FROM employees WHERE active=TRUE ORDER BY last_name, first_name');

const findById = (id) =>
  db.query('SELECT * FROM employees WHERE id=$1', [id]);

const create = ({ first_name, last_name, phone, email, role, pin, hired_at }) =>
  db.query(
    `INSERT INTO employees (first_name, last_name, phone, email, role, pin, hired_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [first_name, last_name, phone ?? null, email ?? null, role ?? 'cashier', pin ?? null, hired_at ?? null]
  );

const update = (id, { first_name, last_name, phone, email, role, pin, hired_at, active }) =>
  db.query(
    `UPDATE employees
     SET first_name=$1, last_name=$2, phone=$3, email=$4, role=$5, pin=$6, hired_at=$7, active=$8
     WHERE id=$9 RETURNING *`,
    [first_name, last_name, phone, email, role, pin, hired_at, active ?? true, id]
  );

const remove = (id) =>
  db.query('UPDATE employees SET active=FALSE WHERE id=$1 RETURNING id', [id]);

module.exports = { findAll, findById, create, update, remove };
