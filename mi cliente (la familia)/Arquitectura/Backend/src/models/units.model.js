const db = require('../db');

const findAll = () =>
  db.query('SELECT * FROM units_of_measure ORDER BY name');

const findById = (id) =>
  db.query('SELECT * FROM units_of_measure WHERE id=$1', [id]);

const create = ({ name, abbreviation }) =>
  db.query(
    'INSERT INTO units_of_measure (name, abbreviation) VALUES ($1,$2) RETURNING *',
    [name, abbreviation]
  );

const update = (id, { name, abbreviation }) =>
  db.query(
    'UPDATE units_of_measure SET name=$1, abbreviation=$2 WHERE id=$3 RETURNING *',
    [name, abbreviation, id]
  );

const remove = (id) =>
  db.query('DELETE FROM units_of_measure WHERE id=$1 RETURNING id', [id]);

module.exports = { findAll, findById, create, update, remove };
