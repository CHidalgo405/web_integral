const Promotions = require('../models/promotions.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await Promotions.findAll(req.query);
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await Promotions.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Promotion not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { rows } = await Promotions.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { rows } = await Promotions.update(req.params.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Promotion not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows } = await Promotions.remove(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Promotion not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove };
