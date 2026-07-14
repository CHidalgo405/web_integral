const Categories = require('../models/categories.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await Categories.findAll();
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await Categories.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
    }
    const { rows } = await Categories.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { rows } = await Categories.update(req.params.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows } = await Categories.remove(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Category not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove };
