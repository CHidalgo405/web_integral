const router = require('express').Router();
const authCtrl = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/google', authCtrl.googleLogin);
router.post('/refresh', authCtrl.refresh);
router.post('/logout', authCtrl.logout);
router.post('/forgot-password', authCtrl.forgotPassword);
router.post('/reset-password', authCtrl.resetPassword);

// Perfil propio (requiere sesión)
router.get('/me', verifyToken, authCtrl.me);
router.put('/me', verifyToken, authCtrl.updateMe);
router.post('/change-password', verifyToken, authCtrl.changePassword);

module.exports = router;