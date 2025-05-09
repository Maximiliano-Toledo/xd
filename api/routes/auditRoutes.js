const express = require('express');
const router = express.Router();
const AuditController = require('../controllers/auditController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { generalLimiter } = require('../middleware/rateLimiter');

// Todas las rutas requieren autenticación como administrador
router.get('/logs',
    generalLimiter,
    authMiddleware(['admin']),
    AuditController.getLogs
);

router.get('/logs/entity/:entityType',
    generalLimiter,
    authMiddleware(['admin']),
    AuditController.getLogsByEntity
);

router.get('/logs/action/:action',
    generalLimiter,
    authMiddleware(['admin']),
    AuditController.getLogsByAction
);

router.get('/logs/user/:userId',
    generalLimiter,
    authMiddleware(['admin']),
    AuditController.getLogsByUser
);

router.get('/logs/entity/:entityType/id/:entityId',
    generalLimiter,
    authMiddleware(['admin']),
    AuditController.getLogsByEntityId
);

router.get('/logs/date-range',
    generalLimiter,
    authMiddleware(['admin']),
    AuditController.getLogsByDateRange
);

router.get('/summary',
    generalLimiter,
    authMiddleware(['admin']),
    AuditController.getAuditSummary
);

module.exports = router;