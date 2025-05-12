/**
 * @module controllers/prestadorController
 * @description Controlador para operaciones relacionadas con prestadores médicos
 */

const PrestadorService = require("../services/prestadorService");
const handleResponse = require("../utils/responseHandler");
const handlePostResponse = require("../utils/responsePostHandler");
const { Entity } = require("../config/response-messages");
const { StatusCodes } = require("http-status-codes");
const auditLogger = require("../utils/auditLogger");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuración de Multer para la carga de archivos CSV
const upload = multer({
  dest: path.join(__dirname, '../temp'),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo tamaño de archivo
  },
  fileFilter: (req, file, cb) => {
    // Aceptar solo archivos CSV
    if (!file.originalname.match(/\.(csv)$/i)) {
      return cb(new Error('Solo se permiten archivos CSV'), false);
    }
    cb(null, true);
  }
}).single('file'); // 'file' es el nombre del campo en el formulario

/**
 * Controlador para gestionar prestadores médicos
 * @type {Object}
 */
const PrestadorController = {
  /**
   * Obtiene todos los planes disponibles
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getPlanes(req, res) {
    handleResponse(res, () => PrestadorService.getPlanes(), Entity.PLANES);
  },

  /**
   * Obtiene provincias filtradas por plan
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getProvincias(req, res) {
    handleResponse(
      res,
      () => PrestadorService.getProvincias(req.params.idPlan),
      Entity.PROVINCIAS
    );
  },

  /**
   * Obtiene localidades filtradas por plan y provincia
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getLocalidades(req, res) {
    handleResponse(
      res,
      () =>
        PrestadorService.getLocalidades(
          req.params.idPlan,
          req.params.idProvincia
        ),
      Entity.LOCALIDADES
    );
  },

  /**
   * Obtiene categorías filtradas por plan y localidad
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getCategorias(req, res) {
    handleResponse(
      res,
      () =>
        PrestadorService.getCategorias(
          req.params.idPlan,
          req.params.idLocalidad
        ),
      Entity.CATEGORIAS
    );
  },

  /**
   * Obtiene especialidades filtradas por varios criterios
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getEspecialidades(req, res) {
    handleResponse(
      res,
      () =>
        PrestadorService.getEspecialidades(
          req.params.idPlan,
          req.params.idCategoria,
          req.params.idProvincia,
          req.params.idLocalidad
        ),
      Entity.ESPECIALIDADES
    );
  },

  /**
   * Obtiene especialidades por nombre de prestador
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getEspecialesdesByNombrePrestador(req, res) {
    handleResponse(
      res,
      () =>
        PrestadorService.getEspecialidadesByNombrePrestador(
          req.params.idPlan,
          req.params.idProvincia,
          req.params.idLocalidad,
          req.params.idCategoria,
          req.params.nombre_prestador
        ),
      Entity.ESPECIALIDADES
    );
  },

  /**
   * Obtiene prestadores filtrados por varios criterios con paginación
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getPrestadores(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    handleResponse(
      res,
      () =>
        PrestadorService.getPrestadores(
          req.params.idPlan,
          req.params.idCategoria,
          req.params.idProvincia,
          req.params.idLocalidad,
          req.params.idEspecialidad,
          page,
          limit
        ),
      Entity.PRESTADORES
    );
  },

  /**
   * Obtiene prestadores filtrados por nombre y otros criterios con paginación
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getPrestadoresByNombre(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    handleResponse(
      res,
      () =>
        PrestadorService.getPrestadoresByNombre(
          req.params.idPlan,
          req.params.idCategoria,
          req.params.idLocalidad,
          req.params.idEspecialidad,
          req.params.nombre_prestador,
          page,
          limit
        ),
      Entity.PRESTADORES
    );
  },

  async getPrestadoresCartilla(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    handleResponse(
      res,
      () => PrestadorService.getPrestadoresCartilla(page, limit),
      Entity.PRESTADORES
    );
  },

  /**
   * Obtiene nombres de prestadores filtrados por varios criterios
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getNombrePrestadores(req, res) {
    handleResponse(
      res,
      () =>
        PrestadorService.getNombrePrestadores(
          req.params.idPlan,
          req.params.idProvincia,
          req.params.idLocalidad,
          req.params.idCategoria
        ),
      Entity.PRESTADORES
    );
  },

  /**
   * Crea un nuevo prestador
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async postCrearPrestador(req, res) {
    await handlePostResponse(
      res,
      async () => {
        const result = await PrestadorService.postCrearPrestador(req.body);
        // Registrar la acción en el sistema de auditoría
        // await auditLogger.logAction(
        //     req.user?.id || 0,
        //     'create',
        //     'prestadores',
        //     result.id,
        //     { requestData: req.body, result }
        // );
        return result;
      },
      "Prestador",
      { action: "crear", successStatus: StatusCodes.CREATED }
    );
  },

  /**
   * Actualiza un prestador existente
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async postActualizarPrestador(req, res) {
    await handlePostResponse(
      res,
      async () => {
        const result = await PrestadorService.postActualizarPrestador(
          req.params.id,
          req.body
        );
        // Registrar la acción en el sistema de auditoría
        await auditLogger.logAction(
          req.user?.id || 0,
          "update",
          "prestadores",
          req.params.id,
          { requestData: req.body, result }
        );
        return result;
      },
      "Prestador",
      { action: "actualizar", successStatus: StatusCodes.OK }
    );
  },

  /**
   * Actualiza el estado de un prestador por nombre
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async postActualizarEstadoPrestadorPorNombre(req, res) {
    await handlePostResponse(
      res,
      async () => {
        const result =
          await PrestadorService.postActualizarEstadoPrestadorPorNombre(
            req.body.nombre,
            req.body.estado
          );
        // Registrar la acción en el sistema de auditoría
        await auditLogger.logAction(
          req.user?.id || 0,
          "update",
          "prestadores",
          "nombre-" + req.body.nombre,
          {
            nombre: req.body.nombre,
            estado: req.body.estado,
            result,
          }
        );
        return result;
      },
      "Prestador",
      { action: "actualizar", successStatus: StatusCodes.OK }
    );
  },

  /**
   * Da de baja un prestador
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async postBajaPrestador(req, res) {
    await handlePostResponse(
      res,
      async () => {
        const result = await PrestadorService.postBajaPrestador(req.params.id);
        // Registrar la acción en el sistema de auditoría
        await auditLogger.logAction(
          req.user?.id || 0,
          "update",
          "prestadores",
          req.params.id,
          { action: "baja", result }
        );
        return result;
      },
      "Prestador",
      { action: "baja", successStatus: StatusCodes.OK }
    );
  },

  /**
   * Descarga la cartilla en formato CSV
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getCartilla(req, res) {
    try {
      const csvData = await PrestadorService.getCartillaStream();

      res.set({
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=cartilla.csv",
      });

      res.status(200).send(csvData);

      // Registrar la acción en el sistema de auditoría
      await auditLogger.logAction(
        req.user?.id || 0,
        "export",
        "cartilla",
        "all",
        { format: "csv" }
      );
    } catch (error) {
      console.error("Error en exportCartillaToCSV:", error);
      res.status(500).json({
        error: "Error al generar el archivo CSV",
        details: error.message,
      });
    }
  },

  /**
   * Subir y procesar un archivo CSV masivo de prestadores
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async uploadCSV(req, res) {
    // Creamos una promesa para manejar la carga del archivo
    const handleUpload = () => new Promise((resolve, reject) => {
      upload(req, res, async (err) => {
        if (err) {
          return reject(new Error(`Error al subir el archivo: ${err.message}`));
        }

        if (!req.file) {
          return reject(new Error('No se ha subido ningún archivo'));
        }

        try {
          let lastProgressUpdate = Date.now();
          const progressCallback = (progress) => {
            const now = Date.now();
            if (now - lastProgressUpdate > 1000) {
              lastProgressUpdate = now;
              console.log('Progreso de carga:', progress);
            }
          };

          const result = await PrestadorService.handleCSVUpload(req.file, progressCallback);
          
          await auditLogger.logAction(
            req.user?.id || 0,
            "import",
            "prestadores",
            "csv-upload",
            { 
              filename: req.file.originalname,
              size: req.file.size,
              records: result.totalProcessed
            }
          );

          resolve({
            message: result.message,
            data: {
              totalProcessed: result.totalProcessed,
              successful: result.successful,
              failed: result.failed,
              warnings: result.warnings || []
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    // Usamos handlePostResponse con la promesa creada
    await handlePostResponse(
      res,
      handleUpload,
      "CSV de Prestadores",
      { 
        action: "importar", 
        successStatus: StatusCodes.OK,
        includeDataInResponse: true // Para incluir los detalles del procesamiento
      }
    );
  },
};

module.exports = PrestadorController;