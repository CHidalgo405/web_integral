const router = require('express').Router();
const ctrl = require('../controllers/purchaseReturns.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.get('/:id/items', ctrl.getItems);
router.post('/', ctrl.create);

module.exports = router;
