const express = require('express');
const router = express.Router();
const ABMController = require('../controllers/abmController');
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

    router.get(
        `/localidades/provincia/:id`,
        generalLimiter,
        authMiddleware(['admin']),
        ABMController.createHandler('getLocalidadesByProvincia', entity.name)
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

module.exports = router;