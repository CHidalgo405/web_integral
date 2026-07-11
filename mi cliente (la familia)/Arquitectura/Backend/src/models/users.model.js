const db = require('../db');

const SAFE_COLS = 'id, employee_id, username, role, active, must_change_password, created_at, updated_at';

// Columnas seguras + datos del employee vinculado (nombre, teléfono) para el panel admin
const SAFE_COLS_JOINED = `u.id, u.employee_id, u.username, u.role, u.active,
   u.must_change_password, u.created_at, u.updated_at,
   e.first_name, e.last_name, e.phone, COALESCE(e.email, u.username) AS email`;

const findAll = () =>
  db.query(
    `SELECT ${SAFE_COLS_JOINED}
     FROM users u LEFT JOIN employees e ON e.id = u.employee_id
     ORDER BY u.created_at DESC`
  );

const findById = (id) =>
  db.query(
    `SELECT ${SAFE_COLS_JOINED}
     FROM users u LEFT JOIN employees e ON e.id = u.employee_id
     WHERE u.id=$1`,
    [id]
  );

const findByUsername = (username) =>
  db.query('SELECT * FROM users WHERE username=$1', [username]);

const create = ({ employee_id, username, password_hash, role, must_change_password, google_id }) =>
  db.query(
    `INSERT INTO users (employee_id, username, password_hash, role, must_change_password, google_id)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING ${SAFE_COLS}`,
    [employee_id ?? null, username, password_hash, role ?? 'customer', must_change_password ?? false, google_id ?? null]
  );

const linkGoogleId = (id, google_id) =>
  db.query('UPDATE users SET google_id=$1 WHERE id=$2 RETURNING id', [google_id, id]);

const createCashier = async ({ first_name, last_name, email, phone, pin, password_hash }) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { rows: [employee] } = await client.query(
      `INSERT INTO employees (first_name, last_name, email, phone, role, pin)
       VALUES ($1,$2,$3,$4,'cashier',$5) RETURNING *`,
      [first_name, last_name, email, phone ?? null, pin ?? null],
    );
    const { rows: [user] } = await client.query(
      `INSERT INTO users (employee_id, username, password_hash, role, must_change_password)
       VALUES ($1,$2,$3,'cashier',FALSE) RETURNING ${SAFE_COLS}`,
      [employee.id, email, password_hash],
    );
    await client.query('COMMIT');
    return { ...user, first_name, last_name, email, phone: phone ?? null };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const update = async (id, { username, role, active, must_change_password }) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE users SET username=$1, role=$2, active=$3, must_change_password=$4
       WHERE id=$5 RETURNING ${SAFE_COLS}`,
      [username, role, active ?? true, must_change_password, id],
    );
    const user = result.rows[0];
    if (user?.employee_id) {
      await client.query('UPDATE employees SET role=$1 WHERE id=$2', [role, user.employee_id]);
    }
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updatePassword = (id, password_hash) =>
  db.query(
    'UPDATE users SET password_hash=$1, must_change_password=FALSE WHERE id=$2 RETURNING id',
    [password_hash, id]
  );

const remove = (id) =>
  db.query('UPDATE users SET active=FALSE WHERE id=$1 RETURNING id', [id]);

module.exports = { findAll, findById, findByUsername, create, createCashier, update, updatePassword, remove, linkGoogleId };
