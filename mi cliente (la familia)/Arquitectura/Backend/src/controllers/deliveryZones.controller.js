const DeliveryZones = require('../models/deliveryZones.model');
const { distanceKm, selectZone, feeFor } = require('../utils/delivery');

const { assertContiguous } = require('../utils/deliveryZones');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await DeliveryZones.findAll();
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await DeliveryZones.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Zona de entrega no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const getFee = async (req, res, next) => {
  try {
    const distance = parseFloat(req.query.distance);
    if (isNaN(distance) || distance < 0) {
      return res.status(400).json({ error: 'La distancia no es válida' });
    }
    const { rows } = await DeliveryZones.calculateFee(distance);
    res.json({ distance_km: distance, fee: rows[0].fee });
  } catch (err) { next(err); }
};

const quote = async (req, res, next) => {
  try {
    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);
    const subtotal = Math.max(Number(req.body.subtotal) || 0, 0);
    const method = req.body.shipping_method || 'standard';
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90
      || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Coordenadas inválidas' });
    }
    if (!['standard', 'express'].includes(method)) {
      return res.status(400).json({ error: 'Método de envío inválido' });
    }
    const { config, zones } = await DeliveryZones.getCoverageData();
    if (!config || config.latitude == null || config.longitude == null) {
      return res.status(409).json({ error: 'La ubicación de la tienda no está configurada', code: 'SHOP_LOCATION_REQUIRED' });
    }
    const distance = distanceKm(Number(config.latitude), Number(config.longitude), latitude, longitude);
    const zone = selectZone(zones, distance);
    if (!zone) return res.json({ eligible: false, distance_km: Number(distance.toFixed(2)), zone: null, fee: null });
    let fee = feeFor(zone, distance);
    if (method === 'standard' && config.free_shipping_threshold != null
      && subtotal >= Number(config.free_shipping_threshold)) fee = 0;
    if (method === 'express') fee += Number(config.express_surcharge || 0);
    res.json({ eligible: true, distance_km: Number(distance.toFixed(2)), zone, fee: Number(fee.toFixed(2)) });
  } catch (err) { next(err); }
};

const getAudit = async (req, res, next) => {
  try {
    const { rows } = await DeliveryZones.findAudit(req.params.id);
    res.json(rows);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const current = await DeliveryZones.findAll(); assertContiguous([...current.rows, req.body]);
    const { rows } = await DeliveryZones.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const saved = await DeliveryZones.updateWithAdjacent(req.params.id, req.body);
    res.json(saved);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const current = await DeliveryZones.findAll(); const target=current.rows.find(zone=>zone.id===req.params.id); const outer=Math.max(...current.rows.map(zone=>Number(zone.max_km))); if(target&&Number(target.max_km)!==outer) return res.status(409).json({error:'Solo puedes retirar la zona exterior para conservar cobertura continua'});
    const { rows } = await DeliveryZones.remove(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Zona de entrega no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, getFee, quote, getAudit, create, update, remove };
