const router = require('express').Router();
const ctrl = require('../controllers/purchases.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/', requireRole('admin', 'cashier'), ctrl.getAll);
// /mine y /metrics deben declararse antes de /:id para que no los capture el parámetro
router.get('/mine', ctrl.getMine);
router.get('/metrics', requireRole('admin'), ctrl.getMetrics);
router.post('/pos', requireRole('admin', 'cashier'), ctrl.createPos);
router.get('/:id', ctrl.getOne);
router.get('/:id/items', ctrl.getItems);
// El checkout del frontend requiere sesión; la compra siempre queda ligada al usuario autenticado.
router.post('/', requireRole('admin', 'customer'), ctrl.create);
router.patch('/:id/status', ctrl.updateStatus);

module.exports = router;
