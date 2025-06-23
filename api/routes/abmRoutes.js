const express = require('express');
const router = express.Router();
const ABMController = require('../controllers/abmController');
const auditLogger = require('../utils/auditLogger'); // NUEVA LÍNEA AGREGADA
const { authMiddleware } = require('../middleware/authMiddleware');
const { generalLimiter, writeLimiter } = require('../middleware/rateLimiter');

// Lista de entidades a configurar
const entities = [
    { name: 'planes', path: 'planes' },
    { name: 'categorias', path: 'categorias' },
    { name: 'especialidades', path: 'especialidades' },
    { name: 'provincias', path: 'provincias' },
    { name: 'localidades', path: 'localidades' }
];

// Crear rutas para cada entidad de forma automatizada
entities.forEach(entity => {
    // Rutas de lectura con limitador general
    router.get(
      `/${entity.path}`,
      generalLimiter,
      authMiddleware(['admin']),
      ABMController.createHandler('getAll', entity.name)
    );

    router.get(
      `/${entity.path}/:id`,
      generalLimiter,
      authMiddleware(['admin']),
      ABMController.createHandler('getById', entity.name)
    );

    // Rutas de escritura con limitador más estricto
    router.post(
      `/${entity.path}`,
      writeLimiter,
      authMiddleware(['admin']),
      ABMController.createHandler('create', entity.name)
    );

    router.put(
      `/${entity.path}/:id`,
      writeLimiter,
      authMiddleware(['admin']),
      ABMController.createHandler('update', entity.name)
    );

    router.delete(
      `/${entity.path}/:id`,
      writeLimiter,
      authMiddleware(['admin']),
      ABMController.createHandler('delete', entity.name)
    );

    router.patch(
      `/${entity.path}/:id/toggle-status`,
      writeLimiter,
      authMiddleware(['admin']),
      ABMController.createHandler('toggleStatus', entity.name)
    );
});

// ✅ RUTAS ESPECÍFICAS FUERA DEL BUCLE forEach

// Ruta para obtener localidades por provincia
router.get(
  '/localidades/provincia/:id',
  generalLimiter,
  authMiddleware(['admin']),
  ABMController.createHandler('getLocalidadesByProvincia', 'localidades')
);

// ✅ RUTAS ESPECÍFICAS PARA ACTUALIZAR ORDEN - CON MÉTODOS MEJORADOS
// CAMBIO 1: Usar método mejorado para planes
router.put(
  '/order/planes',
  writeLimiter,
  authMiddleware(['admin']),
  ABMController.updateOrderHandlerImproved('planes') // MÉTODO MEJORADO
);

// CAMBIO 2: Usar método mejorado para especialidades
router.put(
  '/especialidades/order',
  writeLimiter,
  authMiddleware(['admin']),
  ABMController.updateOrderHandlerImproved('especialidades') // MÉTODO MEJORADO
);

// CAMBIO 3: Usar método mejorado para categorías
router.put(
  '/categorias/order',
  writeLimiter,
  authMiddleware(['admin']),
  ABMController.updateOrderHandlerImproved('categorias') // MÉTODO MEJORADO
);

module.exports = router;