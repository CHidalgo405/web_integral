const router = require('express').Router();
const ctrl = require('../controllers/shiftCovers.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.remove);

module.exports = router;
