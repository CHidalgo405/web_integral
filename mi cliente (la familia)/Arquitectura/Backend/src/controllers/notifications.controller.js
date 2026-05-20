const Notifications = require('../models/notifications.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await Notifications.findAll(req.query);
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await Notifications.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Notification not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { rows } = await Notifications.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const markSeen = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    const { rows } = await Notifications.markSeen(req.params.id, user_id);
    if (!rows.length) return res.status(404).json({ error: 'Notification not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const markAllSeen = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    const { rows } = await Notifications.markAllSeen(user_id);
    res.json({ marked: rows.length });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, markSeen, markAllSeen };
