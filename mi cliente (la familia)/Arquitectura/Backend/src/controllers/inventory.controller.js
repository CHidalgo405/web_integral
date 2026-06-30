const Inventory = require('../models/inventory.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await Inventory.findAll(req.query);
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await Inventory.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const getLowStock = async (req, res, next) => {
  try {
    const { rows } = await Inventory.findLowStock();
    res.json(rows);
  } catch (err) { next(err); }
};

const findByBarcode = async (req, res, next) => {
  try {
    const { rows } = await Inventory.findByBarcode(req.params.barcode);
    if (!rows.length) return res.status(404).json({ error: 'Barcode not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { rows } = await Inventory.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { rows } = await Inventory.update(req.params.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows } = await Inventory.remove(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Item not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};

const getBarcodes = async (req, res, next) => {
  try {
    const { rows } = await Inventory.findBarcodes(req.params.id);
    res.json(rows);
  } catch (err) { next(err); }
};

const addBarcode = async (req, res, next) => {
  try {
    const { rows } = await Inventory.addBarcode(req.params.id, req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const removeBarcode = async (req, res, next) => {
  try {
    const { rows } = await Inventory.removeBarcode(req.params.barcode);
    if (!rows.length) return res.status(404).json({ error: 'Barcode not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, getLowStock, findByBarcode, create, update, remove, getBarcodes, addBarcode, removeBarcode };

