const router = require('express').Router();
const ctrl = require('../controllers/categories.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, ctrl.getAll);
router.get('/:id', verifyToken, ctrl.getOne);
router.post('/', verifyToken, requireRole('admin'), ctrl.create);
router.put('/:id', verifyToken, requireRole('admin'), ctrl.update);
router.delete('/:id', verifyToken, requireRole('admin'), ctrl.remove);

module.exports = router;
