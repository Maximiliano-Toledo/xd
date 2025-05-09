const { AuthController } = require('../controllers/authController');
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { loginLimiter, generalLimiter } = require('../middleware/rateLimiter');

router.post('/login', loginLimiter, AuthController.login);
router.post('/register', authMiddleware(['admin']), AuthController.register);
router.post('/create-token', generalLimiter, AuthController.createToken);
router.post('/logout', authMiddleware(), AuthController.logout);
router.post('/validate-session', generalLimiter, authMiddleware(), AuthController.verifyToken);
router.post('/refresh-token', generalLimiter, authMiddleware(), AuthController.refreshToken);
router.post('/verify-role', generalLimiter, authMiddleware(), AuthController.verifyRole);

module.exports = router;