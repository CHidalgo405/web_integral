const CashRegister = require('../models/cashRegister.model');

const requireEmployee = (req, res) => {
  if (req.user.employee_id) return true;
  res.status(409).json({ error: 'La cuenta no está vinculada a un empleado' });
  return false;
};

const status = async (req, res, next) => {
  try {
    if (!requireEmployee(req, res)) return;
    res.json(await CashRegister.getStatus(req.user.employee_id));
  } catch (err) { next(err); }
};

const open = async (req, res, next) => {
  try {
    if (!requireEmployee(req, res)) return;
    const openingAmount = Number(req.body.opening_amount);
    if (!Number.isFinite(openingAmount) || openingAmount < 0) {
      return res.status(400).json({ error: 'El fondo inicial debe ser un monto válido' });
    }
    const shift = req.body.shift ?? CashRegister.currentShift();
    if (!['morning', 'afternoon'].includes(shift)) {
      return res.status(400).json({ error: 'Turno inválido' });
    }
    const audit = await CashRegister.open(req.user.employee_id, openingAmount, shift);
    res.status(201).json(audit);
  } catch (err) { next(err); }
};

const close = async (req, res, next) => {
  try {
    if (!requireEmployee(req, res)) return;
    const countedAmount = Number(req.body.counted_amount);
    if (!Number.isFinite(countedAmount) || countedAmount < 0) {
      return res.status(400).json({ error: 'El efectivo contado debe ser un monto válido' });
    }
    res.status(201).json(await CashRegister.close(req.user.employee_id, countedAmount));
  } catch (err) { next(err); }
};

module.exports = { status, open, close };
