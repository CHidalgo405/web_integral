const Units = require('../models/units.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await Units.findAll();
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await Units.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Unit not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { rows } = await Units.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { rows } = await Units.update(req.params.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Unit not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows } = await Units.remove(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Unit not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove };
