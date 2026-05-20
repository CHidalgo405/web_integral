const ExpenseCategories = require('../models/expenseCategories.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await ExpenseCategories.findAll();
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await ExpenseCategories.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Expense category not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { rows } = await ExpenseCategories.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { rows } = await ExpenseCategories.update(req.params.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Expense category not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows } = await ExpenseCategories.remove(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Expense category not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove };
