const Categories = require('../models/categories.model');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await Categories.findAll();
    res.json(rows);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const { rows } = await Categories.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const sanitizeSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Cambiar espacios por guiones
    .replace(/[^a-z0-9\-]/g, '') // Quitar caracteres raros excepto números, letras y guiones
    .replace(/-+/g, '-'); // Colapsar múltiples guiones
};

const create = async (req, res, next) => {
  try {
    const { name } = req.body;
    let { slug } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
    }

    if (!slug || !slug.trim()) {
      slug = name;
    }
    req.body.slug = sanitizeSlug(slug);

    const { rows } = await Categories.create(req.body);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    if (req.body.slug || req.body.name) {
      const slugBase = req.body.slug && req.body.slug.trim() ? req.body.slug : req.body.name;
      if (slugBase) {
        req.body.slug = sanitizeSlug(slugBase);
      }
    }
    const { rows } = await Categories.update(req.params.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows } = await Categories.remove(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove };
