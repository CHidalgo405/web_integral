const router = require('express').Router();
const ctrl = require('../controllers/purchaseOrders.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.get('/:id/items', ctrl.getItems);
router.post('/:id/receive', ctrl.receiveAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

router.post('/:id/items', ctrl.addItem);
router.put('/:id/items/:itemId', ctrl.updateItem);
router.delete('/:id/items/:itemId', ctrl.removeItem);

module.exports = router;
