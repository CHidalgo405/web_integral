const Users = require('../models/users.model');
const bcrypt = require('bcryptjs');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await Users.findAll();
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await Users.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { rows } = await Users.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const createCashier = async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone, pin, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, apellido, correo y contraseña son obligatorios' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Correo inválido' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }
    if (pin && !/^\d{4}$/.test(String(pin))) {
      return res.status(400).json({ error: 'El PIN debe tener exactamente 4 dígitos' });
    }
    const { rows: existing } = await Users.findByUsername(normalizedEmail);
    if (existing.length) return res.status(409).json({ error: 'El correo ya está registrado' });

    const password_hash = await bcrypt.hash(password, 10);
    const cashier = await Users.createCashier({
      first_name: String(first_name).trim(),
      last_name: String(last_name).trim(),
      email: normalizedEmail,
      phone,
      pin: pin ? String(pin) : null,
      password_hash,
    });
    res.status(201).json(cashier);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const allowedRoles = ['admin', 'manager', 'cashier', 'stock', 'customer'];
    if (!allowedRoles.includes(req.body.role)) {
      return res.status(400).json({ error: 'El rol del usuario no es válido' });
    }
    if (req.params.id === req.user.id && (!['admin', 'manager'].includes(req.body.role) || req.body.active === false)) {
      return res.status(400).json({ error: 'No puedes quitar tus propios permisos administrativos' });
    }
    const { rows } = await Users.update(req.params.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows } = await Users.remove(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
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

module.exports = { getAll, getOne, create, createCashier, update, remove, getAddresses, getPaymentMethods };
