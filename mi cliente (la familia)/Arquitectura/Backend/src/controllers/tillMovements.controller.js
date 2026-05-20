const TillMovements = require('../models/tillMovements.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await TillMovements.findAll(req.query);
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await TillMovements.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Till movement not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const getBalance = async (req, res, next) => {
  try {
    const { rows } = await TillMovements.getBalance();
    res.json(rows);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { rows } = await TillMovements.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, getBalance, create };
