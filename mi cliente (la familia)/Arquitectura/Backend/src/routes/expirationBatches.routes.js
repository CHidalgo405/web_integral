const router = require('express').Router();
const ctrl = require('../controllers/expirationBatches.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/:id/remove', ctrl.removeBatch);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);

module.exports = router;
