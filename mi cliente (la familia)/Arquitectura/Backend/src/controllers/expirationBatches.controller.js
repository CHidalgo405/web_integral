const ExpirationBatches = require('../models/expirationBatches.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await ExpirationBatches.findAll(req.query);
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await ExpirationBatches.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Expiration batch not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { rows } = await ExpirationBatches.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { rows } = await ExpirationBatches.update(req.params.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Expiration batch not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const removeBatch = async (req, res, next) => {
  try {
    res.json(await ExpirationBatches.removeBatch(req.params.id, req.body.reason));
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, removeBatch };
