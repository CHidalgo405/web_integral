const router = require('express').Router();
const ctrl = require('../controllers/priceHistory.controller');

router.get('/', ctrl.getAll);
router.get('/inventory/:id', ctrl.getByInventory);

module.exports = router;
