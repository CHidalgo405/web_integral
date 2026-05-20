const db = require('../db');

const findAll = ({ search } = {}) => {
  if (search) {
    return db.query(
      `SELECT * FROM customers WHERE name ILIKE $1 OR phone ILIKE $1 ORDER BY name`,
      [`%${search}%`]
    );
  }
  return db.query('SELECT * FROM customers ORDER BY name');
};

const findById = (id) =>
  db.query('SELECT * FROM customers WHERE id=$1', [id]);

const create = ({ name, phone, email, address }) =>
  db.query(
    'INSERT INTO customers (name, phone, email, address) VALUES ($1,$2,$3,$4) RETURNING *',
    [name, phone ?? null, email ?? null, address ?? null]
  );

const update = (id, { name, phone, email, address }) =>
  db.query(
    'UPDATE customers SET name=$1, phone=$2, email=$3, address=$4 WHERE id=$5 RETURNING *',
    [name, phone, email, address, id]
  );

const remove = (id) =>
  db.query('DELETE FROM customers WHERE id=$1 RETURNING id', [id]);

module.exports = { findAll, findById, create, update, remove };
