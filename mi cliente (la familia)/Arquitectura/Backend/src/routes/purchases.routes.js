const router = require('express').Router();
const ctrl = require('../controllers/purchases.controller');
const { verifyToken, attachUser } = require('../middleware/auth.middleware');

router.get('/', ctrl.getAll);
// /mine debe declararse antes de /:id para que no lo capture el parámetro
router.get('/mine', verifyToken, ctrl.getMine);
router.get('/:id', ctrl.getOne);
router.get('/:id/items', ctrl.getItems);
// attachUser: si hay sesión la compra queda ligada al usuario; sin sesión sigue funcionando (POS/invitado)
router.post('/', attachUser, ctrl.create);
router.patch('/:id/status', ctrl.updateStatus);

module.exports = router;
