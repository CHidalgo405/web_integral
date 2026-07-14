const router = require('express').Router();
const ctrl = require('../controllers/reviews.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/products/:inventoryId', ctrl.getProductReviews);
router.post('/', requireRole('customer'), ctrl.create);
router.put('/:id', requireRole('customer'), ctrl.update);
router.delete('/:id', requireRole('customer', 'admin'), ctrl.remove);

module.exports = router;
