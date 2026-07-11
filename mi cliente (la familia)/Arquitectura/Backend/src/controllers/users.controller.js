const Users = require('../models/users.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await Users.findAll();
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await Users.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { rows } = await Users.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const allowedRoles = ['admin', 'manager', 'cashier', 'stock', 'customer'];
    if (!allowedRoles.includes(req.body.role)) {
      return res.status(400).json({ error: 'Invalid user role' });
    }
    if (req.params.id === req.user.id && (req.body.role !== 'admin' || req.body.active === false)) {
      return res.status(400).json({ error: 'No puedes quitar tus propios permisos administrativos' });
    }
    const { rows } = await Users.update(req.params.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows } = await Users.remove(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};

// Vistas admin: direcciones y métodos de pago de cualquier usuario
const Addresses = require('../models/userAddresses.model');
const PaymentMethods = require('../models/userPaymentMethods.model');

const getAddresses = async (req, res, next) => {
  try {
    const { rows } = await Addresses.findAllByUser(req.params.id);
    res.json(rows);
  } catch (err) { next(err); }
};

const getPaymentMethods = async (req, res, next) => {
  try {
    const { rows } = await PaymentMethods.findAllByUser(req.params.id);
    res.json(rows);
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove, getAddresses, getPaymentMethods };
