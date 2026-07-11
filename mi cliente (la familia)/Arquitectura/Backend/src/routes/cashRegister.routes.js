const router = require('express').Router();
const ctrl = require('../controllers/cashRegister.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.use(verifyToken, requireRole('admin', 'cashier'));

router.get('/status', ctrl.status);
router.post('/open', ctrl.open);
router.post('/close', ctrl.close);

module.exports = router;
