/**
 * @module services/prestadorService
 * @description Servicios para operaciones relacionadas con prestadores médicos
 */

const fs = require('fs');
const path = require('path');
const PrestadorRepository = require('../repositories/prestadorRepository');

// Asegurar que la carpeta /data exista
const dataDir = path.join(__dirname, '../data');
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
  getPlanes: async () => {
    try {
      return await PrestadorRepository.getPlanes();
    } catch (error) {
      console.error('Error al obtener planes:', error);
      throw error;
    }
  },

  /**
   * Obtiene provincias filtradas por plan
   * @async
   * @param {number} idPlan - ID del plan
   * @returns {Promise<Array>} - Promesa que resuelve a un array con las provincias
   */
  getProvincias: async (idPlan) => {
    try {
      return await PrestadorRepository.getProvincias(idPlan);
    } catch (error) {
      console.error('Error al obtener provincias:', error);
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
  getLocalidades: async (idPlan, idProvincia) => {
    try {
      return await PrestadorRepository.getLocalidades(idPlan, idProvincia);
    } catch (error) {
      console.error('Error al obtener localidades:', error);
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
  getCategorias: async (idPlan, idLocalidad) => {
    try {
      return await PrestadorRepository.getCategorias(idPlan, idLocalidad);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
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
  getEspecialidades: async (idPlan, idCategoria, idProvincia, idLocalidad) => {
    try {
      return await PrestadorRepository.getEspecialidades(idPlan, idCategoria, idProvincia, idLocalidad);
    } catch (error) {
      console.error('Error al obtener especialidades:', error);
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
  getEspecialidadesByNombrePrestador: async (idPlan, idProvincia, idLocalidad, idCategoria, nombre_prestador) => {
    try {
      return await PrestadorRepository.getEspecialidadesByNombrePrestador(idPlan, idProvincia, idLocalidad, idCategoria, nombre_prestador);
    } catch (error) {
      console.error('Error al obtener especialidades por nombre de prestador:', error);
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
  getPrestadores: async (idPlan, idCategoria, idProvincia, idLocalidad, idEspecialidad, page = 1, limit = 10) => {
    try {
      return await PrestadorRepository.getPrestadores(
        idPlan,
        idCategoria,
        idProvincia,
        idLocalidad,
        idEspecialidad,
        page,
        limit
      );
    } catch (error) {
      console.error('Error al obtener prestadores:', error);
      throw error;
    }
  },

  /**
 * Obtiene prestadores filtrados por nombre y otros criterios
 * @async
 * @param {number} idPlan - ID del plan
 * @param {number} idCategoria - ID de la categoría
 * @param {number} idLocalidad - ID de la localidad
 * @param {number} idEspecialidad - ID de la especialidad
 * @param {string} nombre_prestador - Nombre o parte del nombre del prestador para búsqueda
 * @returns {Promise<Array>} - Promesa que resuelve a un array con los prestadores que coinciden con el criterio de búsqueda
 */
  getPrestadoresByNombre: async (idPlan, idCategoria, idLocalidad, idEspecialidad, nombre_prestador) => {
    try {
      return await PrestadorRepository.getPrestadoresByNombre(idPlan, idCategoria, idLocalidad, idEspecialidad, nombre_prestador);
    } catch (error) {
      console.error('Error al obtener prestadores por nombre:', error);
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
  getNombrePrestadores: async (idPlan, idProvincia, idLocalidad, idCategoria) => {
    try {
      return await PrestadorRepository.getNombrePrestadores(idPlan, idProvincia, idLocalidad, idCategoria);
    } catch (error) {
      console.error('Error al obtener nombres de prestadores:', error);
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
      console.error('Error en servicio getCartillaStream:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo prestador
   * @async
   * @param {Object} prestador - Datos del prestador
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el ID del prestador creado
   */
  postCrearPrestador: async (prestador) => {
    try {
      return await PrestadorRepository.createPrestadorCompleto(prestador);
    } catch (error) {
      console.error('Error en servicio postCrearPrestador:', error);
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
  postActualizarPrestador: async (id, prestador) => {
    try {
      return await PrestadorRepository.updatePrestador(id, prestador);
    } catch (error) {
      console.error('Error en servicio postActualizarPrestador:', error);
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
      return await PrestadorRepository.updateEstadoPrestadorPorNombre(nombre, estado);
    } catch (error) {
      console.error('Error en servicio postActualizarEstadoPrestadorPorNombre:', error);
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
      console.error('Error en servicio postBajaPrestador:', error);
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
        throw new Error('No se subió ningún archivo');
      }

      // Validar que sea un CSV
      if (!file.originalname.endsWith('.csv')) {
        throw new Error('El archivo debe ser de tipo CSV');
      }

      // Ruta destino
      const destPath = path.join(dataDir, 'cartilla.csv');

      // Mover/renombrar el archivo
      await fs.promises.rename(file.path, destPath);

      // Procesar el archivo
      return await PrestadorRepository.loadCartilla();
    } catch (error) {
      console.error('Error procesando cartilla:', error);

      // Limpiar archivo subido si falla
      if (file && fs.existsSync(file.path)) {
        await fs.promises.unlink(file.path);
      }

      throw new Error(`Error al procesar cartilla: ${error.message}`);
    }
  }
};

module.exports = PrestadorService;