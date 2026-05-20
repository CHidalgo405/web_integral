const DeliveryZones = require('../models/deliveryZones.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await DeliveryZones.findAll();
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await DeliveryZones.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Delivery zone not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const getFee = async (req, res, next) => {
  try {
    const distance = parseFloat(req.query.distance);
    if (isNaN(distance) || distance < 0) {
      return res.status(400).json({ error: 'Invalid distance value' });
    }
    const { rows } = await DeliveryZones.calculateFee(distance);
    res.json({ distance_km: distance, fee: rows[0].fee });
  } catch (err) { next(err); }
};

const getAudit = async (req, res, next) => {
  try {
    const { rows } = await DeliveryZones.findAudit(req.params.id);
    res.json(rows);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { rows } = await DeliveryZones.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { rows } = await DeliveryZones.update(req.params.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Delivery zone not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows } = await DeliveryZones.remove(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Delivery zone not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, getFee, getAudit, create, update, remove };
