const Purchases = require('../models/purchases.model');
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const canAccess = (purchase, user) =>
  user.role === 'admin' ||
  purchase.user_id === user.id ||
  (user.role === 'cashier' && user.employee_id && purchase.employee_id === user.employee_id);

const findAccessiblePurchase = async (id, user) => {
  const { rows } = await Purchases.findById(id);
  if (!rows.length || !canAccess(rows[0], user)) return null;
  return rows[0];
};

const getAll = async (req, res, next) => {
  try {
    const filters = req.user.role === 'cashier'
      ? { ...req.query, employee_id: req.user.employee_id }
      : req.query;
    const { rows } = await Purchases.findAll(filters);
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const purchase = await findAccessiblePurchase(req.params.id, req.user);
    if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
    res.json(purchase);
  } catch (err) { next(err); }
};

const getItems = async (req, res, next) => {
  try {
    const purchase = await findAccessiblePurchase(req.params.id, req.user);
    if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
    const { rows } = await Purchases.findItems(req.params.id);
    res.json(rows);
  } catch (err) { next(err); }
};

const getMine = async (req, res, next) => {
  try {
    const { rows } = await Purchases.findAll({ ...req.query, user_id: req.user.id });
    res.json(rows);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { items, ...purchase } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'At least one item is required' });
    }
    // Si hay sesión activa, la compra queda ligada a ese usuario
    if (req.user?.id) purchase.user_id = req.user.id;
    const row = await Purchases.createWithItems(purchase, items);
    res.status(201).json(row);
  } catch (err) { next(err); }
};

const createPos = async (req, res, next) => {
  try {
    if (!req.user.employee_id) {
      return res.status(409).json({ error: 'La cuenta no está vinculada a un empleado' });
    }
    const { items, payment_method, cash_tendered, customer_id, notes } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Agrega al menos un producto' });
    }
    if (!['cash', 'card'].includes(payment_method)) {
      return res.status(400).json({ error: 'Método de pago no disponible en caja' });
    }
    const cashAmount = Number(cash_tendered);
    if (payment_method === 'cash' && (!Number.isFinite(cashAmount) || cashAmount < 0)) {
      return res.status(400).json({ error: 'Ingresa el efectivo recibido' });
    }
    if (customer_id && !UUID_PATTERN.test(customer_id)) {
      return res.status(400).json({ error: 'Cliente inválido' });
    }

    const quantities = new Map();
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!UUID_PATTERN.test(item.inventory_id) || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ error: 'Los productos y cantidades deben ser válidos' });
      }
      quantities.set(item.inventory_id, (quantities.get(item.inventory_id) ?? 0) + quantity);
    }
    const normalizedItems = [...quantities].map(([inventory_id, quantity]) => ({ inventory_id, quantity }));

    const sale = await Purchases.createPosSale(
      {
        employee_id: req.user.employee_id,
        customer_id: customer_id ?? null,
        payment_method,
        cash_tendered: payment_method === 'cash' ? cashAmount : null,
        notes,
      },
      normalizedItems,
    );
    res.status(201).json(sale);
  } catch (err) { next(err); }
};

const VALID_STATUSES = ['pending', 'preparing', 'shipped', 'delivered', 'completed', 'cancelled'];

const updateStatus = async (req, res, next) => {
  try {
    const { status, tracking_number } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Estado inválido. Usa uno de: ${VALID_STATUSES.join(', ')}` });
    }

    const purchase = await findAccessiblePurchase(req.params.id, req.user);
    if (!purchase) return res.status(404).json({ error: 'Purchase not found' });

    // Un cliente únicamente puede cancelar su propio pedido mientras todavía
    // está pendiente o en preparación. Los demás cambios son administrativos.
    if (req.user.role !== 'admin') {
      if (status !== 'cancelled') {
        return res.status(403).json({ error: 'Only administrators can change this order status' });
      }
      if (!['pending', 'preparing'].includes(purchase.status)) {
        return res.status(409).json({ error: 'This order can no longer be cancelled' });
      }
    }

    const { rows } = await Purchases.updateStatus(req.params.id, status, tracking_number);
    if (!rows.length) return res.status(404).json({ error: 'Purchase not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const getMetrics = async (req, res, next) => {
  try {
    const data = await Purchases.metrics();
    res.json(data);
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, getItems, getMine, create, createPos, updateStatus, getMetrics };
