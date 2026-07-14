const router = require('express').Router();
const ctrl = require('../controllers/deliveryZones.controller');
const { verifyToken, requireExactRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, ctrl.getAll);
router.get('/fee', verifyToken, ctrl.getFee);
router.post('/quote', verifyToken, ctrl.quote);
router.get('/:id', verifyToken, ctrl.getOne);
router.get('/:id/audit', verifyToken, requireExactRole('admin'), ctrl.getAudit);
router.post('/', verifyToken, requireExactRole('admin'), ctrl.create);
router.put('/:id', verifyToken, requireExactRole('admin'), ctrl.update);
router.delete('/:id', verifyToken, requireExactRole('admin'), ctrl.remove);

module.exports = router;
