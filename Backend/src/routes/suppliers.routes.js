const router = require('express').Router();
const ctrl = require('../controllers/suppliers.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

router.get('/:id/items', ctrl.getItems);
router.post('/:id/items', ctrl.addItem);
router.put('/:id/items/:inventoryId', ctrl.updateItem);
router.delete('/:id/items/:inventoryId', ctrl.removeItem);

module.exports = router;
