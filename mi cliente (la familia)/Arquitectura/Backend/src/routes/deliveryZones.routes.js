const router = require('express').Router();
const ctrl = require('../controllers/deliveryZones.controller');

router.get('/', ctrl.getAll);
router.get('/fee', ctrl.getFee);
router.get('/:id', ctrl.getOne);
router.get('/:id/audit', ctrl.getAudit);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
