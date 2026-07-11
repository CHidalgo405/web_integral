const router = require('express').Router();
const ctrl = require('../controllers/notifications.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', requireRole('admin'), ctrl.create);
router.patch('/seen-all', ctrl.markAllSeen);
router.patch('/:id/seen', ctrl.markSeen);

module.exports = router;
