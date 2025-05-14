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
router.get('/planesEdit/edit/:edit', authMiddleware(), PrestadorController.getPlanes);
router.get('/provinciasEdit/plan/:idPlan/edit/:edit', authMiddleware(), PrestadorController.getProvincias);
router.get('/localidadesEdit/plan/:idPlan/provincia/:idProvincia/edit/:edit', authMiddleware(), PrestadorController.getLocalidades);
router.get('/categoriasEdit/plan/:idPlan/localidad/:idLocalidad/edit/:edit', authMiddleware(), PrestadorController.getCategorias);
router.get('/especialidadesEdit/localidad/:idLocalidad/provincia/:idProvincia/categoria/:idCategoria/plan/:idPlan/edit/:edit', authMiddleware(), PrestadorController.getEspecialidades);
router.get('/especialidadesPrestadorEdit/plan/:idPlan/provincia/:idProvincia/localidad/:idLocalidad/categoria/:idCategoria/nombre/:nombre_prestador/edit/:edit', authMiddleware(), PrestadorController.getEspecialesdesByNombrePrestador);
router.get('/prestadoresEdit/especialidad/:idEspecialidad/localidad/:idLocalidad/provincia/:idProvincia/categoria/:idCategoria/plan/:idPlan/edit/:edit', authMiddleware(), PrestadorController.getPrestadores);
router.get('/nombrePrestadoresEdit/plan/:idPlan/provincia/:idProvincia/localidad/:idLocalidad/categoria/:idCategoria/edit/:edit', authMiddleware(), PrestadorController.getNombrePrestadores);
router.get('/prestadoresPorNombreEdit/plan/:idPlan/categoria/:idCategoria/localidad/:idLocalidad/especialidad/:idEspecialidad/nombre/:nombre_prestador/edit/:edit', authMiddleware(), PrestadorController.getPrestadoresByNombre);
router.post('/subir-cartilla', authMiddleware(), PrestadorController.uploadCSV);
router.get('/descargar-cartilla-pdf/plan/:idPlan/provincia/:idProvincia', authMiddleware(), PrestadorController.getCartillaPDF);
router.get('/descargar-cartilla', authMiddleware(), PrestadorController.getCartilla);


// Rutas de modificación de prestadores
router.post('/crear-prestador', authMiddleware(), PrestadorController.postCrearPrestador);
router.post('/actualizar-prestador/:id', authMiddleware(), PrestadorController.postActualizarPrestador);
router.post('/actualizar-estado-prestador-por-nombre', authMiddleware(), PrestadorController.postActualizarEstadoPrestadorPorNombre);
router.post('/baja-prestador/:id', authMiddleware(), PrestadorController.postBajaPrestador);

module.exports = router;