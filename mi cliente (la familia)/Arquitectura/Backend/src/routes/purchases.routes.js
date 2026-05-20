const router = require('express').Router();
const ctrl = require('../controllers/purchases.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.get('/:id/items', ctrl.getItems);
router.post('/', ctrl.create);
router.patch('/:id/status', ctrl.updateStatus);

module.exports = router;
