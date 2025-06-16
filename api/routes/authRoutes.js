const { AuthController } = require('../controllers/authController');
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { loginLimiter, generalLimiter } = require('../middleware/rateLimiter');

router.post('/login', loginLimiter, AuthController.login);
router.post('/register', authMiddleware(['admin']), AuthController.register);
router.get('/get-users', authMiddleware(['admin']), AuthController.getAllUsers);
router.post('/edit-user/:id', authMiddleware(['admin']), AuthController.editUser);
router.post('/create-token', generalLimiter, AuthController.createToken);
router.post('/logout', authMiddleware(), AuthController.logout);
router.post('/validate-session', authMiddleware(), AuthController.verifyToken);
router.post('/refresh-token', generalLimiter, AuthController.refreshToken);
router.post('/verify-role', authMiddleware(), AuthController.verifyRole);
router.post('/change-password', authMiddleware(), AuthController.changePassword);
router.post('/forgot-password', AuthController.forgotPassword);
router.get('/verify-token', AuthController.verifyTokenForgotPassword);
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;