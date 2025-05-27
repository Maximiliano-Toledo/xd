const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/public', (req, res) => {
    res.json({ message: 'Esta es una ruta pública', timestamp: new Date() });
});

router.get('/protected', authMiddleware(), (req, res) => {
    res.json({
        message: 'Esta es una ruta protegida',
        user: req.user,
        timestamp: new Date()
    });
});

module.exports = router;