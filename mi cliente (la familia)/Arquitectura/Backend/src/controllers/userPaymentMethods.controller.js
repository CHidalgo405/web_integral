const PaymentMethods = require('../models/userPaymentMethods.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await PaymentMethods.findAllByUser(req.user.id);
    res.json(rows);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { type, label } = req.body;
    if (!type || !label) {
      return res.status(400).json({ error: 'Tipo y etiqueta son obligatorios' });
    }
    if (!['card', 'cash'].includes(type)) {
      return res.status(400).json({ error: 'Tipo inválido (tarjeta o efectivo)' });
    }
    const { rows } = await PaymentMethods.create(req.user.id, req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { rows } = await PaymentMethods.update(req.params.id, req.user.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Método de pago no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows } = await PaymentMethods.remove(req.params.id, req.user.id);
    if (!rows.length) return res.status(404).json({ error: 'Método de pago no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove };
