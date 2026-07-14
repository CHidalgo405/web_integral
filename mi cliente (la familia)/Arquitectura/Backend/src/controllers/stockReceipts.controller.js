const StockReceipts = require('../models/stockReceipts.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await StockReceipts.findAll(req.query);
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await StockReceipts.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Recepción de existencias no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { rows } = await StockReceipts.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create };
