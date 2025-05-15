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
    fileSize: 100 * 1024 * 1024, // 100MB máximo tamaño de archivo
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
    try {
      const result = await handleResponse(res, () => PrestadorService.getPlanes(req.params.edit || false), Entity.PLANES);

      // Log para consultas de planes
      await auditLogger.logAction(
        req.user?.id || 0,
        'query',
        'planes',
        'all',
        {
          endpoint: '/api/cartilla/planes',
          edit_mode: req.params.edit || false,
          ip: req.clientIP
        }
      );

      return result;
    } catch (error) {
      console.error('Error en getPlanes:', error);
      throw error;
    }
  },

  /**
   * Obtiene provincias filtradas por plan
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getProvincias(req, res) {
    try {
      const result = await handleResponse(
        res,
        () => PrestadorService.getProvincias(req.params.idPlan, req.params.edit || false),
        Entity.PROVINCIAS
      );

      // Log para consultas de provincias
      await auditLogger.logAction(
        req.user?.id || 0,
        'query',
        'provincias',
        'by_plan',
        {
          id_plan: req.params.idPlan,
          edit_mode: req.params.edit || false,
          endpoint: '/api/cartilla/provincias',
          ip: req.clientIP
        }
      );

      return result;
    } catch (error) {
      console.error('Error en getProvincias:', error);
      throw error;
    }
  },

  /**
   * Obtiene localidades filtradas por plan y provincia
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getLocalidades(req, res) {
    try {
      const result = await handleResponse(
        res,
        () =>
          PrestadorService.getLocalidades(
            req.params.idPlan,
            req.params.idProvincia,
            req.params.edit || false,
          ),
        Entity.LOCALIDADES
      );

      // Log para consultas de localidades
      await auditLogger.logAction(
        req.user?.id || 0,
        'query',
        'localidades',
        'by_plan_provincia',
        {
          id_plan: req.params.idPlan,
          id_provincia: req.params.idProvincia,
          edit_mode: req.params.edit || false,
          endpoint: '/api/cartilla/localidades',
          ip: req.clientIP
        }
      );

      return result;
    } catch (error) {
      console.error('Error en getLocalidades:', error);
      throw error;
    }
  },

  /**
   * Obtiene categorías filtradas por plan y localidad
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getCategorias(req, res) {
    try {
      const result = await handleResponse(
        res,
        () =>
          PrestadorService.getCategorias(
            req.params.idPlan,
            req.params.idLocalidad,
            req.params.edit || false,
          ),
        Entity.CATEGORIAS
      );

      // Log para consultas de categorías
      await auditLogger.logAction(
        req.user?.id || 0,
        'query',
        'categorias',
        'by_plan_localidad',
        {
          id_plan: req.params.idPlan,
          id_localidad: req.params.idLocalidad,
          edit_mode: req.params.edit || false,
          endpoint: '/api/cartilla/categorias',
          ip: req.clientIP
        }
      );

      return result;
    } catch (error) {
      console.error('Error en getCategorias:', error);
      throw error;
    }
  },

  /**
   * Obtiene especialidades filtradas por varios criterios
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getEspecialidades(req, res) {
    try {
      const result = await handleResponse(
        res,
        () =>
          PrestadorService.getEspecialidades(
            req.params.idPlan,
            req.params.idCategoria,
            req.params.idProvincia,
            req.params.idLocalidad,
            req.params.edit || false,
          ),
        Entity.ESPECIALIDADES
      );

      // Log para consultas de especialidades
      await auditLogger.logAction(
        req.user?.id || 0,
        'query',
        'especialidades',
        'by_multiple_criteria',
        {
          id_plan: req.params.idPlan,
          id_categoria: req.params.idCategoria,
          id_provincia: req.params.idProvincia,
          id_localidad: req.params.idLocalidad,
          edit_mode: req.params.edit || false,
          endpoint: '/api/cartilla/especialidades',
          ip: req.clientIP
        }
      );

      return result;
    } catch (error) {
      console.error('Error en getEspecialidades:', error);
      throw error;
    }
  },

  /**
   * Obtiene especialidades por nombre de prestador
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getEspecialesdesByNombrePrestador(req, res) {
    try {
      const result = await handleResponse(
        res,
        () =>
          PrestadorService.getEspecialidadesByNombrePrestador(
            req.params.idPlan,
            req.params.idProvincia,
            req.params.idLocalidad,
            req.params.idCategoria,
            req.params.nombre_prestador,
            req.params.edit || false,
          ),
        Entity.ESPECIALIDADES
      );

      // Log para consultas de especialidades por prestador
      await auditLogger.logAction(
        req.user?.id || 0,
        'query',
        'especialidades',
        'by_prestador_name',
        {
          id_plan: req.params.idPlan,
          id_provincia: req.params.idProvincia,
          id_localidad: req.params.idLocalidad,
          id_categoria: req.params.idCategoria,
          nombre_prestador: req.params.nombre_prestador,
          edit_mode: req.params.edit || false,
          endpoint: '/api/cartilla/especialidadesPrestador',
          ip: req.clientIP
        }
      );

      return result;
    } catch (error) {
      console.error('Error en getEspecialesdesByNombrePrestador:', error);
      throw error;
    }
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

    try {
      const result = await handleResponse(
        res,
        () =>
          PrestadorService.getPrestadores(
            req.params.idPlan,
            req.params.idCategoria,
            req.params.idProvincia,
            req.params.idLocalidad,
            req.params.idEspecialidad,
            req.params.edit || false,
            page,
            limit
          ),
        Entity.PRESTADORES
      );

      // Log para consultas de prestadores
      await auditLogger.logAction(
        req.user?.id || 0,
        'query',
        'prestadores',
        'by_criteria',
        {
          id_plan: req.params.idPlan,
          id_categoria: req.params.idCategoria,
          id_provincia: req.params.idProvincia,
          id_localidad: req.params.idLocalidad,
          id_especialidad: req.params.idEspecialidad,
          page,
          limit,
          edit_mode: req.params.edit || false,
          endpoint: '/api/cartilla/prestadores',
          ip: req.clientIP
        }
      );

      return result;
    } catch (error) {
      console.error('Error en getPrestadores:', error);
      throw error;
    }
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

    try {
      const result = await handleResponse(
        res,
        () =>
          PrestadorService.getPrestadoresByNombre(
            req.params.idPlan,
            req.params.idCategoria,
            req.params.idLocalidad,
            req.params.idEspecialidad,
            req.params.nombre_prestador,
            req.params.edit || false,
            page,
            limit
          ),
        Entity.PRESTADORES
      );

      // Log para consultas de prestadores por nombre
      await auditLogger.logAction(
        req.user?.id || 0,
        'query',
        'prestadores',
        'by_name',
        {
          id_plan: req.params.idPlan,
          id_categoria: req.params.idCategoria,
          id_localidad: req.params.idLocalidad,
          id_especialidad: req.params.idEspecialidad,
          nombre_prestador: req.params.nombre_prestador,
          page,
          limit,
          edit_mode: req.params.edit || false,
          endpoint: '/api/cartilla/prestadoresPorNombre',
          ip: req.clientIP
        }
      );

      return result;
    } catch (error) {
      console.error('Error en getPrestadoresByNombre:', error);
      throw error;
    }
  },

  async getPrestadoresCartilla(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
      const result = await handleResponse(
        res,
        () => PrestadorService.getPrestadoresCartilla(page, limit),
        Entity.PRESTADORES
      );

      // Log para consultas de prestadores de cartilla
      await auditLogger.logAction(
        req.user?.id || 0,
        'query',
        'prestadores',
        'cartilla',
        {
          page,
          limit,
          endpoint: '/api/cartilla/prestadoresCartilla',
          ip: req.clientIP
        }
      );

      return result;
    } catch (error) {
      console.error('Error en getPrestadoresCartilla:', error);
      throw error;
    }
  },

  /**
   * Obtiene nombres de prestadores filtrados por varios criterios
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getNombrePrestadores(req, res) {
    try {
      const result = await handleResponse(
        res,
        () =>
          PrestadorService.getNombrePrestadores(
            req.params.idPlan,
            req.params.idProvincia,
            req.params.idLocalidad,
            req.params.idCategoria,
            req.params.edit || false,
          ),
        Entity.PRESTADORES
      );

      // Log para consultas de nombres de prestadores
      await auditLogger.logAction(
        req.user?.id || 0,
        'query',
        'prestadores',
        'names_only',
        {
          id_plan: req.params.idPlan,
          id_provincia: req.params.idProvincia,
          id_localidad: req.params.idLocalidad,
          id_categoria: req.params.idCategoria,
          edit_mode: req.params.edit || false,
          endpoint: '/api/cartilla/nombrePrestadores',
          ip: req.clientIP
        }
      );

      return result;
    } catch (error) {
      console.error('Error en getNombrePrestadores:', error);
      throw error;
    }
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

        // Log específico para creación individual de prestador
        await auditLogger.logPrestadorCreation(
          req.user?.id || 0,
          result.registros_creados?.[0]?.id_prestador || 'multiple',
          req.body,
          req.clientIP
        );

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
        // Primero obtenemos los datos actuales del prestador
        let previousData = null;
        try {
          // Necesitamos crear un método en el servicio para obtener un prestador por ID
          // O usar los datos del resultado que incluye los datos previos
          const currentPrestador = await PrestadorService.getPrestadorById(req.params.id);
          previousData = currentPrestador;
        } catch (error) {
          console.warn('No se pudieron obtener los datos previos del prestador:', error);
        }

        const result = await PrestadorService.postActualizarPrestador(req.params.id, req.body);

        // Log específico para edición de prestador
        await auditLogger.logPrestadorEdit(
          req.user?.id || 0,
          req.params.id,
          previousData || {},
          req.body,
          req.clientIP
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
        const result = await PrestadorService.postActualizarEstadoPrestadorPorNombre(
          req.body.nombre,
          req.body.estado
        );

        // Log específico para cambio de estado por nombre
        await auditLogger.logAction(
          req.user?.id || 0,
          "update_prestador_status",
          "prestadores",
          `nombre-${req.body.nombre}`,
          {
            actionType: req.body.estado === 'Activo' ? 'habilitacion' : 'deshabilitacion',
            nombre: req.body.nombre,
            estadoAnterior: req.body.estado === 'Activo' ? 'Inactivo' : 'Activo',
            estadoNuevo: req.body.estado,
            result,
            ip: req.clientIP
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

        // Log específico para baja de prestador
        await auditLogger.logAction(
          req.user?.id || 0,
          "baja_prestador",
          "prestadores",
          req.params.id,
          {
            actionType: "baja",
            estadoAnterior: "Activo",
            estadoNuevo: "Inactivo",
            result,
            ip: req.clientIP
          }
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

      // Log específico para descarga de cartilla CSV
      await auditLogger.logCartillaDownload(
        req.user?.id || 0,
        'csv',
        { all: true }, // Sin filtros específicos
        req.clientIP,
        {
          filename: 'cartilla.csv',
          endpoint: '/api/cartilla/descargar-cartilla'
        }
      );
    } catch (error) {
      console.error("Error en exportCartillaToCSV:", error);
      res.status(500).json({
        error: "Error al generar el archivo CSV",
        details: error.message,
      });
    }
  },

  async getCartillaPDF(req, res) {
    try {
      const pdfData = await PrestadorService.getCartillaPDF(
        req.params.idPlan,
        req.params.idProvincia,
      );

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(pdfData.nombreArchivo)}`,
        "Content-Length": pdfData.pdfBytes.length,
        "Access-Control-Expose-Headers": "Content-Disposition",
      });
      res.send(Buffer.from(pdfData.pdfBytes));

      // Log específico para descarga de cartilla PDF
      await auditLogger.logCartillaDownload(
        req.user?.id || 0,
        'pdf',
        {
          id_plan: req.params.idPlan,
          id_provincia: req.params.idProvincia
        },
        req.clientIP,
        {
          filename: pdfData.nombreArchivo,
          endpoint: '/api/cartilla/descargar-cartilla-pdf'
        }
      );
    } catch (error) {
      console.error("Error en exportCartillaToPDF:", error);
      res.status(500).json({
        error: "Error al generar el archivo PDF",
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

          // Log específico para carga masiva
          await auditLogger.logMassiveUpload(
            req.user?.id || 0,
            {
              filename: req.file.originalname,
              fileSize: req.file.size,
              totalProcessed: result.totalProcessed,
              successful: result.successful || 0,
              failed: result.failed || 0
            },
            req.clientIP
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
          // Log de error en la importación masiva
          await auditLogger.logAction(
            req.user?.id || 0,
            "import_error",
            "prestadores",
            "csv-upload",
            {
              actionType: 'masiva',
              filename: req.file?.originalname || 'unknown',
              fileSize: req.file?.size || 0,
              error: error.message,
              endpoint: '/api/cartilla/subir-cartilla',
              ip: req.clientIP
            }
          );
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