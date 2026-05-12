const db = require('../db');

const findAll = () =>
  db.query('SELECT * FROM categories ORDER BY name');

const findById = (id) =>
  db.query('SELECT * FROM categories WHERE id=$1', [id]);

const create = ({ name, slug, parent_id }) =>
  db.query(
    'INSERT INTO categories (name, slug, parent_id) VALUES ($1,$2,$3) RETURNING *',
    [name, slug, parent_id ?? null]
  );

const update = (id, { name, slug, parent_id }) =>
  db.query(
    'UPDATE categories SET name=$1, slug=$2, parent_id=$3 WHERE id=$4 RETURNING *',
    [name, slug, parent_id ?? null, id]
  );

const remove = (id) =>
  db.query('DELETE FROM categories WHERE id=$1 RETURNING id', [id]);

module.exports = { findAll, findById, create, update, remove };
