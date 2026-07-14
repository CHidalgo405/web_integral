const router = require('express').Router();
const ctrl = require('../controllers/shopConfig.controller');
const { verifyToken, requireExactRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, ctrl.get);
router.put('/', verifyToken, requireExactRole('admin'), ctrl.update);

module.exports = router;
