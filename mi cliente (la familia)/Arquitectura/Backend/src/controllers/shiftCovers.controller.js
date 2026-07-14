const ShiftCovers = require('../models/shiftCovers.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await ShiftCovers.findAll(req.query);
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await ShiftCovers.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Cobertura de turno no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { rows } = await ShiftCovers.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows } = await ShiftCovers.remove(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Cobertura de turno no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, remove };
