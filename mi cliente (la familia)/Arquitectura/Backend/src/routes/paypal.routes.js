const router = require('express').Router();
const ctrl = require('../controllers/paypal.controller');

router.get('/config', ctrl.config);
router.post('/create-order', ctrl.createOrder);
router.post('/capture-order', ctrl.captureOrder);

module.exports = router;
