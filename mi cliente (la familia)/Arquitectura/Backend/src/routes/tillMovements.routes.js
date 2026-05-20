const router = require('express').Router();
const ctrl = require('../controllers/tillMovements.controller');

router.get('/', ctrl.getAll);
router.get('/balance', ctrl.getBalance);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);

module.exports = router;
