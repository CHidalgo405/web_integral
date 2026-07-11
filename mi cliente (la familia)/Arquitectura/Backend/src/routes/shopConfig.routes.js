const router = require('express').Router();
const ctrl = require('../controllers/shopConfig.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, ctrl.get);
router.put('/', verifyToken, requireRole('admin'), ctrl.update);

module.exports = router;
