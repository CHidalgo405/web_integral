const router = require('express').Router();
const ctrl = require('../controllers/notifications.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.patch('/seen-all', ctrl.markAllSeen);
router.patch('/:id/seen', ctrl.markSeen);

module.exports = router;
