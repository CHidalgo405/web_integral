const router = require('express').Router();
const ctrl = require('../controllers/deliveryZones.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, ctrl.getAll);
router.get('/fee', verifyToken, ctrl.getFee);
router.get('/:id', verifyToken, ctrl.getOne);
router.get('/:id/audit', verifyToken, requireRole('admin'), ctrl.getAudit);
router.post('/', verifyToken, requireRole('admin'), ctrl.create);
router.put('/:id', verifyToken, requireRole('admin'), ctrl.update);
router.delete('/:id', verifyToken, requireRole('admin'), ctrl.remove);

module.exports = router;
