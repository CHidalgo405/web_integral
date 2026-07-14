const CashAudit = require('../models/cashAudit.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await CashAudit.findAll(req.query);
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await CashAudit.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Auditoría de caja no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { rows } = await CashAudit.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create };
