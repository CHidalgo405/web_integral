const db = require('../db');

const findAll = () =>
  db.query('SELECT * FROM expense_categories ORDER BY name');

const findById = (id) =>
  db.query('SELECT * FROM expense_categories WHERE id=$1', [id]);

const create = ({ name }) =>
  db.query('INSERT INTO expense_categories (name) VALUES ($1) RETURNING *', [name]);

const update = (id, { name }) =>
  db.query('UPDATE expense_categories SET name=$1 WHERE id=$2 RETURNING *', [name, id]);

const remove = (id) =>
  db.query('DELETE FROM expense_categories WHERE id=$1 RETURNING id', [id]);

module.exports = { findAll, findById, create, update, remove };
