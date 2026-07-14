const PurchaseOrders = require('../models/purchaseOrders.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await PurchaseOrders.findAll(req.query);
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await PurchaseOrders.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Orden de compra no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const getItems = async (req, res, next) => {
  try {
    const { rows } = await PurchaseOrders.findItems(req.params.id);
    res.json(rows);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { rows } = await PurchaseOrders.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { rows } = await PurchaseOrders.update(req.params.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Orden de compra no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows } = await PurchaseOrders.remove(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Orden de compra no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
};

const addItem = async (req, res, next) => {
  try {
    const { rows } = await PurchaseOrders.addItem(req.params.id, req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const updateItem = async (req, res, next) => {
  try {
    const { rows } = await PurchaseOrders.updateItem(req.params.itemId, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Producto de la orden no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const removeItem = async (req, res, next) => {
  try {
    const { rows } = await PurchaseOrders.removeItem(req.params.itemId);
    if (!rows.length) return res.status(404).json({ error: 'Producto de la orden no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
};

const receiveAll = async (req, res, next) => {
  try {
    const result = await PurchaseOrders.receiveAll(req.params.id, req.body.items, req.body.notes);
    res.status(201).json(result);
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, getItems, create, update, remove, addItem, updateItem, removeItem, receiveAll };
