/**
 * @module routes/prestadorRoutes
 * @description Rutas para operaciones relacionadas con prestadores
 */

const PrestadorController = require('../controllers/prestadorController');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

// Rutas públicas para consulta
router.get('/planes', PrestadorController.getPlanes);
router.get('/provincias/plan/:idPlan', PrestadorController.getProvincias);
router.get('/localidades/plan/:idPlan/provincia/:idProvincia', PrestadorController.getLocalidades);
router.get('/categorias/plan/:idPlan/localidad/:idLocalidad', PrestadorController.getCategorias);
router.get('/especialidades/localidad/:idLocalidad/provincia/:idProvincia/categoria/:idCategoria/plan/:idPlan', PrestadorController.getEspecialidades);
router.get('/especialidadesPrestador/plan/:idPlan/provincia/:idProvincia/localidad/:idLocalidad/categoria/:idCategoria/nombre/:nombre_prestador', PrestadorController.getEspecialesdesByNombrePrestador);

// Ruta de prestadores con soporte para paginación (page y limit como query params)
router.get('/prestadores/especialidad/:idEspecialidad/localidad/:idLocalidad/provincia/:idProvincia/categoria/:idCategoria/plan/:idPlan', PrestadorController.getPrestadores);

router.get('/nombrePrestadores/plan/:idPlan/provincia/:idProvincia/localidad/:idLocalidad/categoria/:idCategoria', PrestadorController.getNombrePrestadores);

// Ruta para buscar por nombre.
router.get('/prestadoresPorNombre/plan/:idPlan/categoria/:idCategoria/localidad/:idLocalidad/especialidad/:idEspecialidad/nombre/:nombre_prestador', PrestadorController.getPrestadoresByNombre);

// Rutas protegidas que requieren autenticación
router.get('/descargar-cartilla', authMiddleware(), PrestadorController.getCartilla);
router.post('/subir-cartilla', authMiddleware(), upload.single('cartilla'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Debe subir un archivo CSV' });
    }

    const result = await PrestadorService.processUploadedCartilla(req.file);
    res.json({
      success: true,
      message: 'Cartilla actualizada correctamente',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rutas de modificación de prestadores
router.post('/crear-prestador', authMiddleware(), PrestadorController.postCrearPrestador);
router.post('/actualizar-prestador/:id', authMiddleware(), PrestadorController.postActualizarPrestador);
router.post('/actualizar-estado-prestador-por-nombre', authMiddleware(), PrestadorController.postActualizarEstadoPrestadorPorNombre);
router.post('/baja-prestador/:id', authMiddleware(), PrestadorController.postBajaPrestador);

module.exports = router;