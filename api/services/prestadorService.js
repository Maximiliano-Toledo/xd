/**
 * @module services/prestadorService
 * @description Servicios para operaciones relacionadas con prestadores médicos
 */

const fs = require("fs");
const path = require("path");
const PrestadorRepository = require("../repositories/prestadorRepository");
const {
  phoneJsonToCSVFormat,
  csvFormatToPhoneJson,
  normalizeOldPhoneFormat,     // Esta función ahora incluye la lógica avanzada
  isPhoneJsonFormat            // NUEVA FUNCIÓN
} = require("../utils/phoneFormatter");

// Asegurar que la carpeta /data exista
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Servicios para operaciones relacionadas con prestadores médicos
 * @type {Object}
 */
const PrestadorService = {
  /**
   * Obtiene todos los planes disponibles
   * @async
   * @returns {Promise<Array>} - Promesa que resuelve a un array con los planes
   */
  getPlanes: async (edit = false) => {
    try {
      return await PrestadorRepository.getPlanes(edit);
    } catch (error) {
      console.error("Error al obtener planes:", error);
      throw error;
    }
  },

  /**
   * Obtiene provincias filtradas por plan
   * @async
   * @param {number} idPlan - ID del plan
   * @returns {Promise<Array>} - Promesa que resuelve a un array con las provincias
   */
  getProvincias: async (idPlan, edit = false) => {
    try {
      return await PrestadorRepository.getProvincias(idPlan, edit);
    } catch (error) {
      console.error("Error al obtener provincias:", error);
      throw error;
    }
  },

  /**
   * Obtiene localidades filtradas por plan y provincia
   * @async
   * @param {number} idPlan - ID del plan
   * @param {number} idProvincia - ID de la provincia
   * @returns {Promise<Array>} - Promesa que resuelve a un array con las localidades
   */
  getLocalidades: async (idPlan, idProvincia, edit = false) => {
    try {
      return await PrestadorRepository.getLocalidades(idPlan, idProvincia, edit);
    } catch (error) {
      console.error("Error al obtener localidades:", error);
      throw error;
    }
  },

  /**
   * Obtiene categorías filtradas por plan y localidad
   * @async
   * @param {number} idPlan - ID del plan
   * @param {number} idLocalidad - ID de la localidad
   * @returns {Promise<Array>} - Promesa que resuelve a un array con las categorías
   */
  getCategorias: async (idPlan, idLocalidad, edit = false) => {
    try {
      return await PrestadorRepository.getCategorias(idPlan, idLocalidad, edit);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      throw error;
    }
  },

  getCategoriasVirtuales: async (idPlan, edit = false) => {
    try {
      return await PrestadorRepository.getCategoriasVirtuales(idPlan, edit);
    } catch (error) {
      console.error("Error al obtener categorías virtuales:", error);
      throw error;
    }
  },

  /**
   * Obtiene especialidades filtradas por varios criterios
   * @async
   * @param {number} idPlan - ID del plan
   * @param {number} idCategoria - ID de la categoría
   * @param {number} idProvincia - ID de la provincia
   * @param {number} idLocalidad - ID de la localidad
   * @returns {Promise<Array>} - Promesa que resuelve a un array con las especialidades
   */
  getEspecialidades: async (idPlan, idCategoria, idProvincia, idLocalidad, edit = false) => {
    try {
      return await PrestadorRepository.getEspecialidades(
        idPlan,
        idCategoria,
        idProvincia,
        idLocalidad,
        edit,
      );
    } catch (error) {
      console.error("Error al obtener especialidades:", error);
      throw error;
    }
  },

  getNombresPrestadores: async () => {
    try {
      return await PrestadorRepository.getNombresPrestadores();
    } catch (error) {
      console.error("Error al obtener nombres de prestadores:", error);
      throw error;
    }
  },

  /**
   * Obtiene especialidades por nombre de prestador
   * @async
   * @param {number} idPlan - ID del plan
   * @param {number} idProvincia - ID de la provincia
   * @param {number} idLocalidad - ID de la localidad
   * @param {number} idCategoria - ID de la categoría
   * @param {string} nombre_prestador - Nombre del prestador
   * @returns {Promise<Array>} - Promesa que resuelve a un array con las especialidades
   */
  getEspecialidadesByNombrePrestador: async (
    idPlan,
    idProvincia,
    idLocalidad,
    idCategoria,
    nombre_prestador,
    edit = false,
  ) => {
    try {
      return await PrestadorRepository.getEspecialidadesByNombrePrestador(
        idPlan,
        idProvincia,
        idLocalidad,
        idCategoria,
        nombre_prestador,
        edit,
      );
    } catch (error) {
      console.error(
        "Error al obtener especialidades por nombre de prestador:",
        error
      );
      throw error;
    }
  },

  getEspecialidadesVirtuales: async (idPlan, idCategoria, edit = false) => {
    try {
      return await PrestadorRepository.getEspecialidadesVirtuales(idPlan, idCategoria, edit);
    } catch (error) {
      console.error("Error al obtener especialidades:", error);
      throw error;
    }
  },

  /**
   * Obtiene prestadores filtrados por varios criterios con paginación
   * @async
   * @param {number} idPlan - ID del plan
   * @param {number} idCategoria - ID de la categoría
   * @param {number} idProvincia - ID de la provincia
   * @param {number} idLocalidad - ID de la localidad
   * @param {number} idEspecialidad - ID de la especialidad
   * @param {number} [page=1] - Número de página
   * @param {number} [limit=10] - Límite de resultados por página
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con prestadores y metadatos de paginación
   */
  getPrestadores: async (
    idPlan,
    idCategoria,
    idProvincia,
    idLocalidad,
    idEspecialidad,
    edit = false,
    page = 1,
    limit = 10
  ) => {
    try {
      return await PrestadorRepository.getPrestadores(
        idPlan,
        idCategoria,
        idProvincia,
        idLocalidad,
        idEspecialidad,
        edit,
        page,
        limit
      );
    } catch (error) {
      console.error("Error al obtener prestadores:", error);
      throw error;
    }
  },

  /**
 * Obtiene un prestador por su ID
 * @async
 * @param {number} id - ID del prestador a buscar
 * @returns {Promise<Object>} - Promesa que resuelve a un objeto con los datos del prestador
 */
  getPrestadorById: async (id) => {
    try {
      // Validar que el ID sea un número
      const prestadorId = parseInt(id);
      if (isNaN(prestadorId)) {
        throw new Error("ID inválido");
      }

      // Llamar al repositorio para obtener el prestador
      const prestador = await PrestadorRepository.getPrestadorById(prestadorId);

      // Si no se encuentra el prestador, lanzar un error
      if (!prestador) {
        throw new Error(`Prestador con ID ${id} no encontrado`);
      }

      return prestador;
    } catch (error) {
      console.error(`Error al obtener prestador ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene prestadores filtrados por nombre y otros criterios con paginación
   * @async
   * @param {number} idPlan - ID del plan
   * @param {number} idCategoria - ID de la categoría
   * @param {number} idLocalidad - ID de la localidad
   * @param {number} idEspecialidad - ID de la especialidad
   * @param {string} nombre_prestador - Nombre o parte del nombre del prestador para búsqueda
   * @param {number} [page=1] - Número de página (default: 1)
   * @param {number} [limit=10] - Límite de resultados por página (default: 10)
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con items y metadatos de paginación
   */
  getPrestadoresByNombre: async (
    idPlan,
    idCategoria,
    idLocalidad,
    idEspecialidad,
    nombre_prestador,
    edit = false,
    page = 1,
    limit = 10
  ) => {
    try {
      return await PrestadorRepository.getPrestadoresByNombre(
        idPlan,
        idCategoria,
        idLocalidad,
        idEspecialidad,
        nombre_prestador,
        edit,
        page,
        limit
      );
    } catch (error) {
      console.error("Error al obtener prestadores por nombre:", error);
      throw error;
    }
  },

  getPrestadoresVirtuales: async (idPlan, idCategoria, idEspecialidad, edit = false, page = 1, limit = 10) => {
    try {
      return await PrestadorRepository.getPrestadoresVirtuales(idPlan, idCategoria, idEspecialidad, edit, page, limit);
    } catch (error) {
      console.error("Error al obtener prestadores virtuales:", error);
      throw error;
    }
  },

  /**
   * Obtiene nombres de prestadores filtrados por varios criterios
   * @async
   * @param {number} idPlan - ID del plan
   * @param {number} idProvincia - ID de la provincia
   * @param {number} idLocalidad - ID de la localidad
   * @param {number} idCategoria - ID de la categoría
   * @returns {Promise<Array>} - Promesa que resuelve a un array con los nombres de prestadores
   */
  getNombrePrestadores: async (
    idPlan,
    idProvincia,
    idLocalidad,
    idCategoria,
    edit = false,
  ) => {
    try {
      return await PrestadorRepository.getNombrePrestadores(
        idPlan,
        idProvincia,
        idLocalidad,
        idCategoria,
        edit,
      );
    } catch (error) {
      console.error("Error al obtener nombres de prestadores:", error);
      throw error;
    }
  },

  getPrestadoresCartilla: async (page = 1, limit = 10) => {
    try {
      return await PrestadorRepository.getPrestadoresCartilla(page, limit);
    } catch (error) {
      console.error("Error al obtener prestadores de cartilla:", error);
      throw error;
    }
  },

  /**
   * Obtiene el stream de datos de la cartilla en formato CSV
   * @async
   * @returns {Promise<string>} - Promesa que resuelve a un string con el contenido CSV
   */
  getCartillaStream: async () => {
    try {
      return await PrestadorRepository.getCartillaStream();
    } catch (error) {
      console.error("Error en servicio getCartillaStream:", error);
      throw error;
    }
  },

  /**
   * Actualiza/reemplaza la portada PDF para un plan y provincia específicos
   * @async
   * @param {number} id_plan - ID del plan
   * @param {number} id_provincia - ID de la provincia
   * @param {Buffer} pdfFile - Buffer del archivo PDF
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el resultado de la operación
   */
  updatePortadaPDF: async (id_plan, id_provincia, pdfFile) => {
    try {
      // Validar que se proporcionó un archivo PDF
      if (!pdfFile || !Buffer.isBuffer(pdfFile)) {
        throw new Error("Archivo PDF no válido o faltante");
      }

      // Llamar al repositorio para realizar la actualización
      const result = await PrestadorRepository.updatePortadaPDF(
        id_plan,
        id_provincia,
        pdfFile
      );

      return {
        success: true,
        message: "Portada PDF actualizada exitosamente",
        data: result
      };
    } catch (error) {
      console.error("Error en servicio updatePortadaPDF:", error);
      throw new Error(`Error al actualizar portada PDF: ${error.message}`);
    }
  },

  /**
   * Descarga la cartilla en formato PDF
   * @async
   * @param {number} id_plan - ID del plan
   * @param {number} id_provincia - ID de la provincia
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con los bytes del PDF y nombre del archivo
   */
  getCartillaPDF: async (id_plan, id_provincia) => {
    try {
      return await PrestadorRepository.downloadCartillaPDF(id_plan, id_provincia);
    } catch (error) {
      console.error("Error en servicio getCartillaPDF:", error);
      throw error;
    }
  },

  /**
   * Crea un nuevo prestador
   * @async
   * @param {Object} prestador - Datos del prestador
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el ID del prestador creado
   */
  postCrearPrestador: async (prestadorData) => {
    try {
      // Normalizar teléfonos usando la función avanzada
      if (prestadorData.telefonos) {
        if (typeof prestadorData.telefonos === 'string') {
          // Si ya está en formato JSON, no hacer nada
          if (isPhoneJsonFormat(prestadorData.telefonos)) {
            // Ya está en formato correcto
            console.log('Teléfonos ya están en formato JSON correcto');
          } else {
            // Usar la función de normalización (que ahora incluye lógica avanzada)
            console.log('Normalizando teléfonos con función mejorada...');
            prestadorData.telefonos = normalizeOldPhoneFormat(prestadorData.telefonos);
          }
        } else if (Array.isArray(prestadorData.telefonos)) {
          // Si es un array, convertirlo a JSON string
          prestadorData.telefonos = JSON.stringify(prestadorData.telefonos);
        }
      } else {
        // Si no hay teléfonos, establecer array vacío
        prestadorData.telefonos = JSON.stringify([]);
      }

      // Validar que los teléfonos estén en formato JSON válido
      try {
        JSON.parse(prestadorData.telefonos);
      } catch (e) {
        console.warn('Error validando formato JSON de teléfonos, usando formato por defecto');
        prestadorData.telefonos = JSON.stringify([]);
      }

      const result = await PrestadorRepository.createPrestadorCompleto(prestadorData);
      return result;
    } catch (error) {
      console.error("Error en servicio postCrearPrestador:", error);
      throw error;
    }
  },


  /**
   * Actualiza un prestador existente
   * @async
   * @param {number} id - ID del prestador a actualizar
   * @param {Object} prestador - Nuevos datos del prestador
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el ID del prestador actualizado
   */
  postActualizarPrestador: async (id, prestadorData) => {
    try {
      // Normalizar teléfonos usando la función avanzada
      if (prestadorData.telefonos) {
        if (typeof prestadorData.telefonos === 'string') {
          // Si ya está en formato JSON, no hacer nada
          if (isPhoneJsonFormat(prestadorData.telefonos)) {
            console.log('Teléfonos ya están en formato JSON correcto');
          } else {
            // Usar la función de normalización (que ahora incluye lógica avanzada)
            console.log('Normalizando teléfonos con función mejorada...');
            prestadorData.telefonos = normalizeOldPhoneFormat(prestadorData.telefonos);
          }
        } else if (Array.isArray(prestadorData.telefonos)) {
          // Si es un array, convertirlo a JSON string
          prestadorData.telefonos = JSON.stringify(prestadorData.telefonos);
        }
      }

      // Validar que los teléfonos estén en formato JSON válido si se proporcionaron
      if (prestadorData.telefonos) {
        try {
          JSON.parse(prestadorData.telefonos);
        } catch (e) {
          console.warn('Error validando formato JSON de teléfonos en actualización');
          // En caso de error, no actualizar el campo de teléfonos
          delete prestadorData.telefonos;
        }
      }

      return await PrestadorRepository.updatePrestador(id, prestadorData);
    } catch (error) {
      console.error("Error en servicio postActualizarPrestador:", error);
      throw error;
    }
  },

  /**
   * Actualiza el estado de un prestador por nombre
   * @async
   * @param {string} nombre - Nombre del prestador
   * @param {string} estado - Nuevo estado ('Activo' o 'Inactivo')
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el resultado de la operación
   */
  postActualizarEstadoPrestadorPorNombre: async (nombre, estado) => {
    try {
      return await PrestadorRepository.updateEstadoPrestadorPorNombre(
        nombre,
        estado
      );
    } catch (error) {
      console.error(
        "Error en servicio postActualizarEstadoPrestadorPorNombre:",
        error
      );
      throw error;
    }
  },

  /**
   * Da de baja un prestador
   * @async
   * @param {number} id - ID del prestador
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el resultado de la operación
   */
  postBajaPrestador: async (id) => {
    try {
      return await PrestadorRepository.downPrestador(id);
    } catch (error) {
      console.error("Error en servicio postBajaPrestador:", error);
      throw error;
    }
  },

  /**
   * Procesa un archivo CSV subido para actualizar la cartilla
   * @async
   * @param {Object} file - Objeto de archivo subido
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el resultado de la operación
   */
  processUploadedCartilla: async (file) => {
    try {
      if (!file) {
        throw new Error("No se subió ningún archivo");
      }

      // Validar que sea un CSV
      if (!file.originalname.endsWith(".csv")) {
        throw new Error("El archivo debe ser de tipo CSV");
      }

      // Ruta destino
      const destPath = path.join(dataDir, "cartilla.csv");

      // Mover/renombrar el archivo
      await fs.promises.rename(file.path, destPath);

      // Procesar el archivo
      return await PrestadorRepository.loadCartilla();
    } catch (error) {
      console.error("Error procesando cartilla:", error);

      // Limpiar archivo subido si falla
      if (file && fs.existsSync(file.path)) {
        await fs.promises.unlink(file.path);
      }

      throw new Error(`Error al procesar cartilla: ${error.message}`);
    }
  },

  /**
   * Procesa un archivo CSV masivo de prestadores médicos
   * @async
   * @param {string} filePath - Ruta del archivo CSV
   * @param {Object} [options] - Opciones de configuración
   * @param {boolean} [options.enablePhoneParsing=true] - Si aplicar parseo automático de teléfonos
   * @returns {Promise<Object>} - Resultados del proceso
   */
  processMassiveCSV: async (filePath, options = {}) => {
    try {
      // Validar que el archivo existe
      if (!fs.existsSync(filePath)) {
        throw new Error(`El archivo ${filePath} no existe`);
      }

      // NUEVO: Extraer opción de parseo
      const enablePhoneParsing = options.enablePhoneParsing !== false; // Por defecto true

      // Procesar el archivo con el repositorio
      const result = await PrestadorRepository.processMassiveCSVStream(
        filePath,
        {
          ...options,
          enablePhoneParsing: enablePhoneParsing // NUEVO: Pasar al repositorio
        }
      );

      return {
        success: true,
        ...result,
        enablePhoneParsing: enablePhoneParsing, // NUEVO: Incluir en resultado
        message: `Archivo CSV procesado exitosamente. ${result.totalProcessed} registros cargados. Parseo de teléfonos: ${enablePhoneParsing ? 'aplicado' : 'omitido'}.`,
      };
    } catch (error) {
      console.error("Error en servicio processMassiveCSV:", error);

      // Notificar error al callback de progreso si existe
      if (options.progressCallback) {
        options.progressCallback({
          error: error.message,
          status: "failed",
        });
      }

      throw new Error(`Error al procesar CSV: ${error.message}`);
    }
  },

  // 2. MODIFICAR prestadorService.js - Método handleCSVUpload
  /**
   * Maneja la carga y procesamiento de un archivo CSV subido
   * @async
   * @param {Object} file - Objeto de archivo subido (Multer)
   * @param {Function} [progressCallback] - Función para reportar progreso
   * @param {Object} [options] - Opciones adicionales
   * @param {boolean} [options.enablePhoneParsing=true] - Si aplicar parseo automático de teléfonos
   * @returns {Promise<Object>} - Resultado del procesamiento
   */
  handleCSVUpload: async (file, progressCallback, options = {}) => {
    try {
      if (!file) {
        throw new Error("No se subió ningún archivo");
      }

      // Validar extensión
      if (!file.originalname.match(/\.(csv)$/i)) {
        throw new Error("Solo se permiten archivos CSV");
      }

      // Validar tamaño del archivo (máximo 100MB)
      if (file.size > 100 * 1024 * 1024) {
        throw new Error("El archivo es demasiado grande (máximo 100MB)");
      }

      // NUEVO: Extraer opción de parseo
      const enablePhoneParsing = options.enablePhoneParsing !== false; // Por defecto true

      // Mover el archivo a la carpeta de datos
      const destPath = path.join(dataDir, `upload_${Date.now()}.csv`);
      await fs.promises.rename(file.path, destPath);

      console.log(`Iniciando procesamiento de CSV: ${file.originalname}`);
      console.log(`Archivo guardado en: ${destPath}`);
      console.log(`Parseo de teléfonos: ${enablePhoneParsing ? 'HABILITADO' : 'DESHABILITADO'}`);

      // Procesar el archivo con notificación de progreso
      const result = await PrestadorService.processMassiveCSV(destPath, {
        progressCallback: (progress) => {
          // Enriquecer la información de progreso
          const enrichedProgress = {
            ...progress,
            fileName: file.originalname,
            fileSize: file.size,
            enablePhoneParsing: enablePhoneParsing, // NUEVO: Incluir en progreso
            timestamp: new Date().toISOString()
          };

          if (progressCallback) {
            progressCallback(enrichedProgress);
          }

          // Log del progreso
          if (progress.status === 'processing') {
            console.log(`Procesando: ${progress.successful}/${progress.totalProcessed} exitosos, ${progress.failed} fallidos`);
          }
        },
        batchSize: 2000,
        delimiter: ',',
        enablePhoneParsing: enablePhoneParsing // NUEVO: Pasar opción al procesamiento
      });

      // Eliminar el archivo después de procesarlo
      try {
        await fs.promises.unlink(destPath);
        console.log(`Archivo temporal eliminado: ${destPath}`);
      } catch (cleanupError) {
        console.warn("No se pudo eliminar el archivo temporal:", cleanupError);
      }

      console.log(`CSV procesado exitosamente: ${result.successful} registros cargados`);

      return {
        ...result,
        fileName: file.originalname,
        fileSize: file.size,
        enablePhoneParsing: enablePhoneParsing, // NUEVO: Incluir en resultado
        processingTime: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error en handleCSVUpload:", error);

      // Limpiar archivo temporal si existe
      if (file && fs.existsSync(file.path)) {
        try {
          await fs.promises.unlink(file.path);
        } catch (cleanupError) {
          console.warn("Error al limpiar archivo temporal:", cleanupError);
        }
      }

      throw error;
    }
  },
};

module.exports = PrestadorService;
