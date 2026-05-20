const Suppliers = require('../models/suppliers.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await Suppliers.findAll();
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await Suppliers.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Supplier not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { rows } = await Suppliers.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { rows } = await Suppliers.update(req.params.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Supplier not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows } = await Suppliers.remove(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Supplier not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};

const getItems = async (req, res, next) => {
  try {
    const { rows } = await Suppliers.findItems(req.params.id);
    res.json(rows);
  } catch (err) { next(err); }
};

const addItem = async (req, res, next) => {
  try {
    const { rows } = await Suppliers.addItem(req.params.id, req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const updateItem = async (req, res, next) => {
  try {
    const { rows } = await Suppliers.updateItem(req.params.id, req.params.inventoryId, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Supplier item not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const removeItem = async (req, res, next) => {
  try {
    const { rows } = await Suppliers.removeItem(req.params.id, req.params.inventoryId);
    if (!rows.length) return res.status(404).json({ error: 'Supplier item not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove, getItems, addItem, updateItem, removeItem };
