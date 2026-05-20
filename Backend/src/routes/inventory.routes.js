const router = require('express').Router();
const ctrl = require('../controllers/inventory.controller');

router.get('/', ctrl.getAll);
router.get('/low-stock', ctrl.getLowStock);
router.get('/barcode/:barcode', ctrl.findByBarcode);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

router.get('/:id/barcodes', ctrl.getBarcodes);
router.post('/:id/barcodes', ctrl.addBarcode);
router.delete('/:id/barcodes/:barcode', ctrl.removeBarcode);

module.exports = router;
