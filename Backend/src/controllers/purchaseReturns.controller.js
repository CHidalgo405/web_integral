const PurchaseReturns = require('../models/purchaseReturns.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await PurchaseReturns.findAll(req.query);
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await PurchaseReturns.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Return not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const getItems = async (req, res, next) => {
  try {
    const { rows } = await PurchaseReturns.findItems(req.params.id);
    res.json(rows);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { items, ...ret } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'At least one item is required' });
    }
    const row = await PurchaseReturns.createWithItems(ret, items);
    res.status(201).json(row);
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, getItems, create };
