const Promotions = require('../models/promotions.model');

const validate = async (body, excludeId) => {
  const pct = body.discount_pct == null ? null : Number(body.discount_pct);
  const fixed = body.discount_fixed == null ? null : Number(body.discount_fixed);
  if (!body.name || !body.inventory_id) throw Object.assign(new Error('Nombre y producto son obligatorios'), { status: 400 });
  if ((pct != null) === (fixed != null) || pct != null && (pct <= 0 || pct > 100) || fixed != null && fixed <= 0) throw Object.assign(new Error('Usa un porcentaje o un monto fijo válido'), { status: 400 });
  if (body.valid_from && body.valid_until && body.valid_from > body.valid_until) throw Object.assign(new Error('La fecha final debe ser posterior a la inicial'), { status: 400 });
  if (body.active !== false) { const overlap = await Promotions.findOverlap(body.inventory_id, body.valid_from, body.valid_until, excludeId); if (overlap.rowCount) throw Object.assign(new Error('Ya existe una promoción activa para este producto y periodo'), { status: 409 }); }
};

const getAll = async (req, res, next) => {
  try {
    const { rows } = await Promotions.findAll(req.query);
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await Promotions.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Promoción no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    await validate(req.body);
    const { rows } = await Promotions.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    await validate(req.body, req.params.id);
    const { rows } = await Promotions.update(req.params.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Promoción no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows } = await Promotions.remove(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Promoción no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove };
