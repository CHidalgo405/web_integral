const router = require('express').Router();
const ctrl = require('../controllers/users.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// Proteger todo el catálogo de usuarios
router.use(verifyToken);
router.use(requireRole('admin'));

router.get('/', ctrl.getAll);
router.post('/cashiers', ctrl.createCashier);
router.get('/:id', ctrl.getOne);
router.get('/:id/addresses', ctrl.getAddresses);
router.get('/:id/payment-methods', ctrl.getPaymentMethods);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
