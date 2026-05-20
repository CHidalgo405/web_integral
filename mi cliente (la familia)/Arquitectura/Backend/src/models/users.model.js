const db = require('../db');

const SAFE_COLS = 'id, employee_id, username, role, active, must_change_password, created_at, updated_at';

const findAll = () =>
  db.query(`SELECT ${SAFE_COLS} FROM users ORDER BY username`);

const findById = (id) =>
  db.query(`SELECT ${SAFE_COLS} FROM users WHERE id=$1`, [id]);

const findByUsername = (username) =>
  db.query('SELECT * FROM users WHERE username=$1', [username]);

const create = ({ employee_id, username, password_hash, role, must_change_password }) =>
  db.query(
    `INSERT INTO users (employee_id, username, password_hash, role, must_change_password)
     VALUES ($1,$2,$3,$4,$5) RETURNING ${SAFE_COLS}`,
    [employee_id ?? null, username, password_hash, role ?? 'cashier', must_change_password ?? false]
  );

const update = (id, { username, role, active, must_change_password }) =>
  db.query(
    `UPDATE users SET username=$1, role=$2, active=$3, must_change_password=$4
     WHERE id=$5 RETURNING ${SAFE_COLS}`,
    [username, role, active ?? true, must_change_password, id]
  );

const updatePassword = (id, password_hash) =>
  db.query(
    'UPDATE users SET password_hash=$1, must_change_password=FALSE WHERE id=$2 RETURNING id',
    [password_hash, id]
  );

const remove = (id) =>
  db.query('UPDATE users SET active=FALSE WHERE id=$1 RETURNING id', [id]);

module.exports = { findAll, findById, findByUsername, create, update, updatePassword, remove };
