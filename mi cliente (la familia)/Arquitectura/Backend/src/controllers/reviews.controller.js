const Reviews = require('../models/reviews.model');
const { validateUuid, normalizeReviewPayload } = require('../services/reviews.service');

const serializeSummary = (row) => ({
  average: Number(row.average),
  total: row.total,
  distribution: {
    5: row.five,
    4: row.four,
    3: row.three,
    2: row.two,
    1: row.one,
  },
});

const getProductReviews = async (req, res, next) => {
  try {
    const inventoryId = validateUuid(req.params.inventoryId, 'Producto');
    const [{ rows: reviews }, { rows: summaries }] = await Promise.all([
      Reviews.findByProduct(inventoryId, req.user.id),
      Reviews.getSummary(inventoryId),
    ]);

    const eligibility = req.user.role === 'customer'
      ? await Reviews.getEligibility(inventoryId, req.user.id)
      : { exists: true, can_review: false, reason: 'customer_only' };
    if (!eligibility.exists) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json({
      reviews,
      summary: serializeSummary(summaries[0]),
      eligibility,
    });
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const inventoryId = validateUuid(req.body.inventory_id, 'Producto');
    const payload = normalizeReviewPayload(req.body);
    const review = await Reviews.create({
      inventoryId,
      userId: req.user.id,
      ...payload,
    });
    res.status(201).json(review);
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const id = validateUuid(req.params.id, 'Reseña');
    const payload = normalizeReviewPayload(req.body);
    const { rows } = await Reviews.update(id, req.user.id, payload);
    if (!rows.length) return res.status(404).json({ error: 'Reseña no encontrada' });
    res.json(rows[0]);
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    const id = validateUuid(req.params.id, 'Reseña');
    const canModerate = ['admin', 'manager'].includes(req.user.role);
    const { rows } = await Reviews.remove(id, req.user.id, canModerate);
    if (!rows.length) return res.status(404).json({ error: 'Reseña no encontrada' });
    res.status(204).send();
  } catch (error) { next(error); }
};

module.exports = { getProductReviews, create, update, remove };
