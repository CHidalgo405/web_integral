const router = require('express').Router();
const ctrl = require('../controllers/userPaymentMethods.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Todas las rutas operan sobre los métodos de pago del usuario autenticado
router.use(verifyToken);

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
