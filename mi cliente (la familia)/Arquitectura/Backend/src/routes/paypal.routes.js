const router = require('express').Router();
const ctrl = require('../controllers/paypal.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/config', ctrl.config);
router.post('/create-order', ctrl.createOrder);
router.post('/capture-order', ctrl.captureOrder);

module.exports = router;
