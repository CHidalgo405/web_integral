const router = require('express').Router();
const ctrl = require('../controllers/cashAudit.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);

module.exports = router;
