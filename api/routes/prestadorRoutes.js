/**
 * @module routes/prestadorRoutes
 * @description Rutas para operaciones relacionadas con prestadores
 */

const PrestadorController = require('../controllers/prestadorController');
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');


// Rutas públicas para consulta
router.get('/planes', PrestadorController.getPlanes);
router.get('/provincias/plan/:idPlan', PrestadorController.getProvincias);
router.get('/localidades/plan/:idPlan/provincia/:idProvincia', PrestadorController.getLocalidades);
router.get('/categorias/plan/:idPlan/localidad/:idLocalidad', PrestadorController.getCategorias);
router.get('/especialidades/localidad/:idLocalidad/provincia/:idProvincia/categoria/:idCategoria/plan/:idPlan', PrestadorController.getEspecialidades);
router.get('/especialidadesPrestador/plan/:idPlan/provincia/:idProvincia/localidad/:idLocalidad/categoria/:idCategoria/nombre/:nombre_prestador', PrestadorController.getEspecialesdesByNombrePrestador);
router.get('/nombrePrestadores/plan/:idPlan/provincia/:idProvincia/localidad/:idLocalidad/categoria/:idCategoria', PrestadorController.getNombrePrestadores);
router.get('/prestadores/especialidad/:idEspecialidad/localidad/:idLocalidad/provincia/:idProvincia/categoria/:idCategoria/plan/:idPlan', PrestadorController.getPrestadores);
router.get('/prestadoresPorNombre/plan/:idPlan/categoria/:idCategoria/localidad/:idLocalidad/especialidad/:idEspecialidad/nombre/:nombre_prestador', PrestadorController.getPrestadoresByNombre);
router.get('/prestadoresCartilla', PrestadorController.getPrestadoresCartilla);
// Rutas protegidas que requieren autenticación
router.post('/subir-cartilla', authMiddleware(), PrestadorController.uploadCSV);
router.get('/descargar-cartilla-pdf/plan/:idPlan/provincia/:idProvincia', authMiddleware(), PrestadorController.getCartillaPDF);
router.get('/descargar-cartilla', authMiddleware(), PrestadorController.getCartilla);


// Rutas de modificación de prestadores
router.post('/crear-prestador', authMiddleware(), PrestadorController.postCrearPrestador);
router.post('/actualizar-prestador/:id', authMiddleware(), PrestadorController.postActualizarPrestador);
router.post('/actualizar-estado-prestador-por-nombre', authMiddleware(), PrestadorController.postActualizarEstadoPrestadorPorNombre);
router.post('/baja-prestador/:id', authMiddleware(), PrestadorController.postBajaPrestador);

module.exports = router;