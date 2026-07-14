const router = require('express').Router();
const ctrl = require('../controllers/inventory.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, ctrl.getAll);
router.get('/low-stock', verifyToken, requireRole('admin', 'stock'), ctrl.getLowStock);
router.get('/movements', verifyToken, requireRole('admin', 'stock'), ctrl.getMovements);
router.get('/barcode/:barcode', verifyToken, requireRole('admin', 'cashier', 'stock'), ctrl.findByBarcode);
router.get('/:id', verifyToken, ctrl.getOne);
router.post('/', verifyToken, requireRole('admin'), ctrl.create);
router.post('/:id/adjustments', verifyToken, requireRole('admin', 'stock'), ctrl.adjustStock);
router.put('/:id', verifyToken, requireRole('admin'), ctrl.update);
router.delete('/:id', verifyToken, requireRole('admin'), ctrl.remove);

router.get('/:id/barcodes', verifyToken, requireRole('admin', 'stock'), ctrl.getBarcodes);
router.post('/:id/barcodes', verifyToken, requireRole('admin'), ctrl.addBarcode);
router.delete('/:id/barcodes/:barcode', verifyToken, requireRole('admin'), ctrl.removeBarcode);

module.exports = router;
