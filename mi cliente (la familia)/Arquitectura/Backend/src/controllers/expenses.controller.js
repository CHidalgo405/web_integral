const Expenses = require('../models/expenses.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await Expenses.findAll(req.query);
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await Expenses.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { rows } = await Expenses.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { rows } = await Expenses.update(req.params.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows } = await Expenses.remove(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
};

const reverse = async (req, res, next) => {
  try {
    const row = await Expenses.reverse(req.params.id, {
      reason: req.body.reason,
      created_by: req.user.id,
    });
    res.status(201).json(row);
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove, reverse };
