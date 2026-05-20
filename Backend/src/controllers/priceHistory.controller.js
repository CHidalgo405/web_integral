const PriceHistory = require('../models/priceHistory.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await PriceHistory.findAll();
    res.json(rows);
  } catch (err) { next(err); }
};

const getByInventory = async (req, res, next) => {
  try {
    const { rows } = await PriceHistory.findByInventory(req.params.id);
    res.json(rows);
  } catch (err) { next(err); }
};

module.exports = { getAll, getByInventory };
