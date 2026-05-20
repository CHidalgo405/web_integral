const ShopConfig = require('../models/shopConfig.model');

const get = async (req, res, next) => {
  try {
    const { rows } = await ShopConfig.get();
    if (!rows.length) return res.status(404).json({ error: 'Shop config not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { rows } = await ShopConfig.update(req.body);
    res.json(rows[0]);
  } catch (err) { next(err); }
};

module.exports = { get, update };
