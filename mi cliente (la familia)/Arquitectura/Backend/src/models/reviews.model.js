const db = require('../db');

const REVIEW_SELECT = `
  SELECT pr.id, pr.inventory_id, pr.user_id, pr.purchase_id, pr.rating, pr.comment,
         pr.created_at, pr.updated_at,
         COALESCE(
           NULLIF(btrim(concat_ws(' ', e.first_name, e.last_name)), ''),
           split_part(u.username, '@', 1),
           'Cliente'
         ) AS user_name,
         TRUE AS verified_purchase`;

const findByProduct = (inventoryId, currentUserId) =>
  db.query(
    `${REVIEW_SELECT}, (pr.user_id = $2) AS is_mine
     FROM product_reviews pr
     JOIN users u ON u.id = pr.user_id
     LEFT JOIN employees e ON e.id = u.employee_id
     WHERE pr.inventory_id = $1
     ORDER BY pr.created_at DESC`,
    [inventoryId, currentUserId],
  );

const getSummary = (inventoryId) =>
  db.query(
    `SELECT COUNT(*)::int AS total,
            ROUND(COALESCE(AVG(rating), 0), 1) AS average,
            COUNT(*) FILTER (WHERE rating = 5)::int AS five,
            COUNT(*) FILTER (WHERE rating = 4)::int AS four,
            COUNT(*) FILTER (WHERE rating = 3)::int AS three,
            COUNT(*) FILTER (WHERE rating = 2)::int AS two,
            COUNT(*) FILTER (WHERE rating = 1)::int AS one
     FROM product_reviews
     WHERE inventory_id = $1`,
    [inventoryId],
  );

const productExists = (inventoryId) =>
  db.query('SELECT id FROM inventory WHERE id=$1 AND active=TRUE', [inventoryId]);

const getEligibility = async (inventoryId, userId) => {
  const [product, existingReview, purchase] = await Promise.all([
    db.query('SELECT id FROM inventory WHERE id=$1 AND active=TRUE', [inventoryId]),
    db.query(
      'SELECT id FROM product_reviews WHERE inventory_id=$1 AND user_id=$2',
      [inventoryId, userId],
    ),
    db.query(
      `SELECT p.id
       FROM purchases p
       JOIN purchase_items pi ON pi.purchase_id = p.id
       WHERE p.user_id=$1 AND pi.inventory_id=$2
         AND p.status IN ('completed', 'delivered')
       ORDER BY p.created_at DESC
       LIMIT 1`,
      [userId, inventoryId],
    ),
  ]);

  if (!product.rows.length) return { exists: false, can_review: false, reason: 'product_not_found' };
  if (existingReview.rows.length) {
    return {
      exists: true,
      can_review: false,
      reason: 'already_reviewed',
      review_id: existingReview.rows[0].id,
    };
  }
  if (!purchase.rows.length) return { exists: true, can_review: false, reason: 'purchase_required' };
  return {
    exists: true,
    can_review: true,
    reason: null,
    purchase_id: purchase.rows[0].id,
  };
};

const create = async ({ inventoryId, userId, rating, comment }) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { rows: products } = await client.query(
      'SELECT id FROM inventory WHERE id=$1 AND active=TRUE',
      [inventoryId],
    );
    if (!products.length) {
      const error = new Error('Producto no encontrado');
      error.status = 404;
      throw error;
    }

    const { rows: existing } = await client.query(
      'SELECT id FROM product_reviews WHERE inventory_id=$1 AND user_id=$2',
      [inventoryId, userId],
    );
    if (existing.length) {
      const error = new Error('Ya publicaste una reseña para este producto');
      error.status = 409;
      throw error;
    }

    const { rows: purchases } = await client.query(
      `SELECT p.id
       FROM purchases p
       JOIN purchase_items pi ON pi.purchase_id = p.id
       WHERE p.user_id=$1 AND pi.inventory_id=$2
         AND p.status IN ('completed', 'delivered')
       ORDER BY p.created_at DESC
       LIMIT 1
       FOR UPDATE OF p`,
      [userId, inventoryId],
    );
    if (!purchases.length) {
      const error = new Error('Sólo puedes reseñar productos de pedidos entregados o completados');
      error.status = 403;
      throw error;
    }

    const { rows: [review] } = await client.query(
      `INSERT INTO product_reviews (inventory_id, user_id, purchase_id, rating, comment)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [inventoryId, userId, purchases[0].id, rating, comment],
    );
    await client.query('COMMIT');
    return review;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const update = (id, userId, { rating, comment }) =>
  db.query(
    `UPDATE product_reviews
     SET rating=$1, comment=$2
     WHERE id=$3 AND user_id=$4
     RETURNING *`,
    [rating, comment, id, userId],
  );

const remove = (id, userId, canModerate) =>
  db.query(
    `DELETE FROM product_reviews
     WHERE id=$1 AND (user_id=$2 OR $3::boolean)
     RETURNING id`,
    [id, userId, canModerate],
  );

module.exports = { findByProduct, getSummary, productExists, getEligibility, create, update, remove };
