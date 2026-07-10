const Purchases = require('../models/purchases.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await Purchases.findAll(req.query);
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await Purchases.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Purchase not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const getItems = async (req, res, next) => {
  try {
    const { rows } = await Purchases.findItems(req.params.id);
    res.json(rows);
  } catch (err) { next(err); }
};

const getMine = async (req, res, next) => {
  try {
    const { rows } = await Purchases.findAll({ ...req.query, user_id: req.user.id });
    res.json(rows);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { items, ...purchase } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'At least one item is required' });
    }
    // Si hay sesión activa, la compra queda ligada a ese usuario
    if (req.user?.id) purchase.user_id = req.user.id;
    const row = await Purchases.createWithItems(purchase, items);
    res.status(201).json(row);
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { rows } = await Purchases.updateStatus(req.params.id, status);
    if (!rows.length) return res.status(404).json({ error: 'Purchase not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, getItems, getMine, create, updateStatus };
