const Inventory = require('../models/inventory.model');

// El mismo catálogo alimenta la tienda y el panel administrativo. No exponer
// costos, mínimos de stock ni metadatos internos a cuentas de cliente.
const toCatalogItem = ({ cost, min_stock, low_stock, created_at, updated_at, ...item }) => item;

const getAll = async (req, res, next) => {
  try {
    const { rows } = await Inventory.findAll(req.query);
    res.json(['admin', 'manager', 'stock'].includes(req.user.role) ? rows : rows.map(toCatalogItem));
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await Inventory.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Item not found' });
    res.json(['admin', 'manager', 'stock'].includes(req.user.role) ? rows[0] : toCatalogItem(rows[0]));
  } catch (err) { next(err); }
};

const getLowStock = async (req, res, next) => {
  try {
    const { rows } = await Inventory.findLowStock();
    res.json(rows);
  } catch (err) { next(err); }
};

const findByBarcode = async (req, res, next) => {
  try {
    const { rows } = await Inventory.findByBarcode(req.params.barcode);
    if (!rows.length) return res.status(404).json({ error: 'Barcode not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { rows } = await Inventory.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { rows } = await Inventory.update(req.params.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows } = await Inventory.remove(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Item not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};

const getBarcodes = async (req, res, next) => {
  try {
    const { rows } = await Inventory.findBarcodes(req.params.id);
    res.json(rows);
  } catch (err) { next(err); }
};

const addBarcode = async (req, res, next) => {
  try {
    const { rows } = await Inventory.addBarcode(req.params.id, req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const removeBarcode = async (req, res, next) => {
  try {
    const { rows } = await Inventory.removeBarcode(req.params.barcode);
    if (!rows.length) return res.status(404).json({ error: 'Barcode not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};

const getMovements = async (req, res, next) => {
  try {
    const { rows } = await Inventory.findMovements(req.query);
    res.json(rows);
  } catch (err) { next(err); }
};

const adjustStock = async (req, res, next) => {
  try {
    const quantityDelta = Number(req.body.quantity_delta);
    const reason = String(req.body.reason ?? '').trim();
    const notes = req.body.notes == null ? null : String(req.body.notes).trim();

    if (!Number.isInteger(quantityDelta) || quantityDelta === 0) {
      return res.status(400).json({ error: 'quantity_delta must be a non-zero integer' });
    }
    if (reason.length < 2 || reason.length > 80) {
      return res.status(400).json({ error: 'reason must be between 2 and 80 characters' });
    }
    if (notes && notes.length > 500) {
      return res.status(400).json({ error: 'notes must be 500 characters or fewer' });
    }

    const movement = await Inventory.adjustStock(req.params.id, {
      quantity_delta: quantityDelta,
      reason,
      notes,
      user_id: req.user.id,
    });
    res.status(201).json(movement);
  } catch (err) { next(err); }
};

module.exports = {
  getAll,
  getOne,
  getLowStock,
  findByBarcode,
  create,
  update,
  remove,
  getBarcodes,
  addBarcode,
  removeBarcode,
  getMovements,
  adjustStock,
};
