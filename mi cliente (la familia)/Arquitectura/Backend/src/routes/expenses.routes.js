const router = require('express').Router();
const ctrl = require('../controllers/expenses.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.post('/:id/reverse', ctrl.reverse);

module.exports = router;
