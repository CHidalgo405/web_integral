const Addresses = require('../models/userAddresses.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await Addresses.findAllByUser(req.user.id);
    res.json(rows);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { full_name, street } = req.body;
    if (!full_name || !street) {
      return res.status(400).json({ error: 'Nombre completo y calle son obligatorios' });
    }
    const { rows } = await Addresses.create(req.user.id, req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { full_name, street } = req.body;
    if (!full_name || !street) {
      return res.status(400).json({ error: 'Nombre completo y calle son obligatorios' });
    }
    const { rows } = await Addresses.update(req.params.id, req.user.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Dirección no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows } = await Addresses.remove(req.params.id, req.user.id);
    if (!rows.length) return res.status(404).json({ error: 'Dirección no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove };
