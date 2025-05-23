/**
 * @module services/prestadorService
 * @description Servicios para operaciones relacionadas con prestadores médicos
 */

const fs = require("fs");
const path = require("path");
const PrestadorRepository = require("../repositories/prestadorRepository");
const { phoneJsonToCSVFormat, csvFormatToPhoneJson } = require("../utils/phoneFormatter");

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
      // Asegurar que teléfonos esté en formato JSON
      if (prestadorData.telefonos && typeof prestadorData.telefonos === 'string' && !prestadorData.telefonos.startsWith('[')) {
        prestadorData.telefonos = csvFormatToPhoneJson(prestadorData.telefonos);
      }

      // Resto de la función permanece igual
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
      // Asegurar que teléfonos esté en formato JSON
      if (prestadorData.telefonos && typeof prestadorData.telefonos === 'string' && !prestadorData.telefonos.startsWith('[')) {
        prestadorData.telefonos = csvFormatToPhoneJson(prestadorData.telefonos);
      }

      // Resto de la función permanece igual
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
   * @returns {Promise<Object>} - Resultados del proceso
   */
  processMassiveCSV: async (filePath, options = {}) => {
    try {
      // Validar que el archivo existe
      if (!fs.existsSync(filePath)) {
        throw new Error(`El archivo ${filePath} no existe`);
      }

      // Procesar el archivo con el repositorio
      const result = await PrestadorRepository.processMassiveCSVStream(
        filePath,
        options
      );

      return {
        success: true,
        ...result,
        message: `Archivo CSV procesado exitosamente. ${result.totalProcessed} registros cargados.`,
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

  /**
   * Maneja la carga y procesamiento de un archivo CSV subido
   * @async
   * @param {Object} file - Objeto de archivo subido (Multer)
   * @param {Function} [progressCallback] - Función para reportar progreso
   * @returns {Promise<Object>} - Resultado del procesamiento
   */
  handleCSVUpload: async (file, progressCallback) => {
    try {
      if (!file) {
        throw new Error("No se subió ningún archivo");
      }

      // Validar extensión
      if (!file.originalname.match(/\.(csv)$/i)) {
        throw new Error("Solo se permiten archivos CSV");
      }

      // Mover el archivo a la carpeta de datos
      const destPath = path.join(dataDir, `upload_${Date.now()}.csv`);
      await fs.promises.rename(file.path, destPath);

      // Procesar el archivo con notificación de progreso
      const result = await PrestadorService.processMassiveCSV(destPath, {
        progressCallback,
        batchSize: 2000, // Tamaño de lote optimizado
      });

      // Eliminar el archivo después de procesarlo (opcional)
      try {
        await fs.promises.unlink(destPath);
      } catch (cleanupError) {
        console.warn("No se pudo eliminar el archivo temporal:", cleanupError);
      }

      return result;
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
