/**
 * @module repositories/prestadorRepository
 * @description Repositorio para operaciones relacionadas con prestadores médicos
 */

const { pool } = require("../config/db");
const ABMRepository = require("./abmRepository");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const { Parser } = require("json2csv");
const csv = require("csv-parser");
const { Transform } = require("stream");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");

const {
  phoneJsonToCSVFormat,
  formatPhoneForPDF,
  csvFormatToPhoneJson,
  normalizeOldPhoneFormat  // Esta función ahora incluye la lógica avanzada
} = require("../utils/phoneFormatter");



const SupplierProcessor = require("../libs/supplier-processor");
const CSVProcessor = require("../libs/csv-processor");
const PDFGenerator = require("../libs/pdf-generator")
const { PhoneFormatter } = require("../libs/phone-formatter");
const { phoneNumbersData } = require("../utils/phoneNumbersData");

const phoneFormatter = new PhoneFormatter(phoneNumbersData);
const csvProcessor = new CSVProcessor(pool, ABMRepository, phoneFormatter);
const supplierProcessor = new SupplierProcessor(pool, ABMRepository);
const pdfGenerator = new PDFGenerator(pool, phoneFormatter)

/**
 * Carga un archivo de consulta SQL desde el directorio de consultas
 * @param {string} fileName - Nombre del archivo que contiene la consulta SQL
 * @returns {string} - Contenido del archivo
 */
const loadQuery = (fileName) =>
  fs.readFileSync(path.join(__dirname, "../queries", fileName), "utf8");

/**
 * Repositorio para operaciones relacionadas con prestadores médicos
 * @type {Object}
 */
const PrestadorRepository = {
  // /**
  //  * Obtiene todos los planes disponibles
  //  * @async
  //  * @returns {Promise<Array>} - Promesa que resuelve a un array con los planes
  //  */
  // getPlanes: async (edit = false) => {
  //   const estado = edit ? 'Todos' : 'Activo';
  //   try {
  //     if (estado === 'Todos') {
  //       return await pool.query("SELECT * FROM planes;");
  //     }
  //     return await pool.query("SELECT * FROM planes WHERE estado = ?;", [estado]);
  //   } catch (error) {
  //     console.error("Error al obtener planes:", error);
  //     throw error;
  //   }
  // },
  /**
   * Obtiene todos los planes disponibles ordenados
   * @async
   * @returns {Promise<Array>} - Promesa que resuelve a un array con los planes ordenados
   */
  getPlanes: async (edit = false) => {
    const estado = edit ? 'Todos' : 'Activo';
    try {
      let query;
      let params = [];

      if (estado === 'Todos') {
        query = `
        SELECT * FROM planes 
        ORDER BY 
          CASE WHEN orden IS NULL OR orden = 0 THEN 999999 ELSE orden END ASC,
          id_plan ASC
      `;
      } else {
        query = `
        SELECT * FROM planes 
        WHERE estado = ? 
        ORDER BY 
          CASE WHEN orden IS NULL OR orden = 0 THEN 999999 ELSE orden END ASC,
          id_plan ASC
      `;
        params = [estado];
      }

      return await pool.query(query, params);
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
    const estado = edit ? 'Todos' : 'Activo';
    try {
      return await pool.query("CALL getProvinciasByPlan(?, ?);", [idPlan, estado]);
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
    const estado = edit ? 'Todos' : 'Activo';
    try {
      return await pool.query("CALL getLocalidadesByPlanAndProvincia(?, ?, ?);", [
        idPlan,
        idProvincia,
        estado,
      ]);
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
    const estado = edit ? 'Todos' : 'Activo';
    try {
      return await pool.query("CALL getCategoriasByPlanAndLocalidad(?, ?, ?);", [
        idPlan,
        idLocalidad,
        estado,
      ]);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      throw error;
    }
  },

  getCategoriasVirtuales: async (idPlan, edit = false) => {
    const estado = edit ? 'Todos' : 'Activo';
    try {
      return await pool.query("CALL getCategoriasByAtencionVirtual(?, ?);", [
        idPlan,
        estado,
      ]);
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
    const estado = edit ? 'Todos' : 'Activo';
    try {
      return await pool.query(
        "CALL getEspecialidadesByLocalidadAndProvinciaAndCategoriaAndPlan(?, ?, ?, ?, ?);",
        [idPlan, idCategoria, idProvincia, idLocalidad, estado]
      );
    } catch (error) {
      console.error("Error al obtener especialidades:", error);
      throw error;
    }
  },

  getEspecialidadesVirtuales: async (idPlan, idCategoria, edit = false) => {
    const estado = edit ? 'Todos' : 'Activo';
    try {
      return await pool.query(
        "CALL getEspecialidadesVirtualesByCategoriaAndPlan(?, ?, ?);",
        [idPlan, idCategoria, estado]
      );
    } catch (error) {
      console.error("Error al obtener especialidades:", error);
      throw error;
    }
  },

  /**
 * Obtiene un prestador por su ID utilizando el procedimiento almacenado
 * @async
 * @param {number} id - ID del prestador a buscar
 * @returns {Promise<Object>} - Promesa que resuelve a un objeto con los datos del prestador y sus relaciones
 */
  getPrestadorById: async (id) => {
    try {
      // Validar que el ID sea un número
      const prestadorId = parseInt(id);
      if (isNaN(prestadorId)) {
        throw new Error("ID inválido");
      }

      // Llamar al procedimiento almacenado
      const [results] = await pool.query('CALL GetPrestadorById(?)', [prestadorId]);

      // El procedimiento devuelve varios conjuntos de resultados
      // - results[0] contiene los datos básicos del prestador
      // - results[1] contiene los planes asociados
      // - results[2] contiene las especialidades asociadas
      // - results[3] contiene las categorías asociadas

      // Verificar si se encontró el prestador
      if (!results[0] || results[0].length === 0) {
        throw new Error(`Prestador con ID ${id} no encontrado`);
      }

      // Construir el objeto de respuesta
      const prestador = {
        ...results[0][0], // Datos básicos del prestador
        planes: results[1] || [],
        especialidades: results[2] || [],
        categorias: results[3] || []
      };

      return prestador;
    } catch (error) {
      console.error(`Error al obtener prestador ID ${id}:`, error);
      throw error;
    }
  },

  getNombresPrestadores: async () => {
    try {
      return await pool.query("CALL getNombresPrestadores();");
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
    const estado = edit ? 'Todos' : 'Activo';
    try {
      return await pool.query(
        "CALL getEspecialidadesByNombrePrestador(?, ?, ?, ?, ?, ?);",
        [idPlan, idProvincia, idLocalidad, idCategoria, nombre_prestador, estado]
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
   * Obtiene prestadores de cartilla con paginación
   * @async
   * @param {number} [page=1] - Número de página
   * @param {number} [limit=10] - Límite de resultados por página
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con items y metadatos de paginación
   */
  getPrestadoresCartilla: async (page = 1, limit = 10) => {
    try {
      const [results] = await pool.query(
        "CALL GetPrestadoresCartillaPaginados(?, ?)",
        [page, limit]
      );

      const totalItems = results[0][0].total || 0;
      const rows = results[1];

      // Calcular metadatos de paginación
      const totalPages = Math.ceil(totalItems / limit);

      return [
        {
          items: rows,
          pagination: {
            totalItems,
            itemsPerPage: limit,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      ];
    } catch (error) {
      console.error("Error al obtener prestadores de cartilla:", error);
      throw error;
    }
  },

  /**
   * Obtiene prestadores filtrados por varios criterios
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
      // Cálculo del offset para paginación
      const offset = (page - 1) * limit;
      const estado = edit ? 'Todos' : 'Activo';

      // Obtener total de registros
      const [countResult] = await pool.query(
        "CALL getCountPrestadores(?, ?, ?, ?, ?, ?);",
        [idPlan, idCategoria, idProvincia, idLocalidad, idEspecialidad, estado]
      );

      const totalItems = countResult[0][0].total || 0;

      // Obtener prestadores paginados
      const [rows] = await pool.query(
        "CALL getPrestadoresPaginados(?, ?, ?, ?, ?, ?, ?, ?);",
        [
          idPlan,
          idCategoria,
          idProvincia,
          idLocalidad,
          idEspecialidad,
          limit,
          offset,
          estado,
        ]
      );

      // Calcular metadatos de paginación
      const totalPages = Math.ceil(totalItems / limit);

      return [
        {
          items: rows[0],
          pagination: {
            totalItems,
            itemsPerPage: limit,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      ];
    } catch (error) {
      console.error("Error al obtener prestadores:", error);
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
   * @param {number} [page=1] - Número de página
   * @param {number} [limit=10] - Límite de resultados por página
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con prestadores y metadatos de paginación
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
      // Cálculo del offset para paginación
      const offset = (page - 1) * limit;
      const estado = edit ? 'Todos' : 'Activo';

      // Obtener total de registros (necesitarás crear un SP para contar los resultados filtrados por nombre)
      const [countResult] = await pool.query(
        "CALL getCountPrestadoresByNombre(?, ?, ?, ?, ?, ?);",
        [idPlan, idCategoria, idLocalidad, idEspecialidad, nombre_prestador, estado]
      );

      const totalItems = countResult[0][0].total || 0;

      // Obtener prestadores paginados usando el nuevo SP
      const [rows] = await pool.query(
        "CALL GetPrestadoresByNombrePaginados(?, ?, ?, ?, ?, ?, ?, ?);",
        [
          idPlan,
          idCategoria,
          idLocalidad,
          idEspecialidad,
          nombre_prestador,
          limit,
          offset,
          estado,
        ]
      );

      // Calcular metadatos de paginación
      const totalPages = Math.ceil(totalItems / limit);

      return [
        {
          items: rows[0],
          pagination: {
            totalItems,
            itemsPerPage: limit,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      ];
    } catch (error) {
      console.error("Error al obtener prestadores por nombre:", error);
      throw error;
    }
  },

  getPrestadoresVirtuales: async (idPlan, idCategoria, idEspecialidad, edit = false, page = 1, limit = 10) => {

    try {
      const offset = (page - 1) * limit;
      const estado = edit ? 'Todos' : 'Activo';

      const [countResult] = await pool.query(
        "CALL getCountPrestadoresVirtuales(?, ?, ?, ?);",
        [idPlan, idCategoria, idEspecialidad, estado]
      );
      const totalItems = countResult[0][0].total || 0;

      const [rows] = await pool.query(
        "CALL GetPrestadoresVirtualesPaginados(?, ?, ?, ?, ?, ?);",
        [idPlan, idCategoria, idEspecialidad, estado, limit, offset]
      );

      const totalPages = Math.ceil(totalItems / limit);

      return [
        {
          items: rows[0],
          pagination: {
            totalItems,
            itemsPerPage: limit,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      ]
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
    edit = false
  ) => {
    const estado = edit ? 'Todos' : 'Activo';
    try {
      return await pool.query(
        "CALL GetPrestadoresByPlanAndProvinciaAndLocalidadAndCategoria(?, ?, ?, ?, ?);",
        [idPlan, idProvincia, idLocalidad, idCategoria, estado]
      );
    } catch (error) {
      console.error("Error al obtener nombres de prestadores:", error);
      throw error;
    }
  },

  /**
   * Obtiene el stream de datos de la cartilla en formato CSV
   * @async
   * @returns {Promise<string>} - Promesa que resuelve a un string con el contenido CSV
   */
  async getCartillaStream() {
    try {
      // 1. Obtener datos de la tabla cartilla
      const [results] = await pool.query(
        "SELECT plan, categoria_prestador, especialidad, provincia, localidad, nombre_prestador, direccion, telefonos, email, atencion_virtual, informacion_adicional, estado FROM cartilla;"
      );

      if (!results || results.length === 0) {
        throw new Error("No se encontraron datos en la tabla cartilla");
      }

      // 2. Generar CSV sin modificar los teléfonos primero
      const parser = new Parser();
      let csv = parser.parse(results);

      // 3. Procesar manualmente las líneas del CSV para sustituir los teléfonos en formato JSON
      const lines = csv.split('\n');
      const header = lines[0]; // Guardar el encabezado

      // Índice de la columna de teléfonos
      const columns = header.split(',');
      const telefonosIndex = columns.findIndex(column =>
        column.replace(/"/g, '').toLowerCase() === 'telefonos'
      );

      if (telefonosIndex === -1) {
        throw new Error("No se pudo encontrar la columna de teléfonos en el CSV");
      }

      // Procesar cada línea de datos (excepto el encabezado)
      const processedLines = [header];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Saltar líneas vacías

        // Dividir la línea respetando comillas
        const pattern = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
        const fields = lines[i].split(pattern);

        // Validar que tenemos suficientes campos
        if (fields.length <= telefonosIndex) {
          processedLines.push(lines[i]); // Mantener la línea igual si no tiene suficientes campos
          continue;
        }

        // Procesar el campo de teléfonos
        let telefonosField = fields[telefonosIndex].trim();

        // Si parece ser un JSON (empieza con " seguido de [)
        if (telefonosField.startsWith('"[') && telefonosField.endsWith(']"')) {
          // Quitar comillas externas y parsear como JSON
          const jsonStr = telefonosField.substring(1, telefonosField.length - 1).replace(/""/g, '"');

          try {
            // Convertir a formato estructurado
            const formattedPhones = phoneJsonToCSVFormat(jsonStr);

            // Reemplazar en la línea, escapeando adecuadamente para CSV
            fields[telefonosIndex] = `"${formattedPhones.replace(/"/g, '""')}"`;

            console.log(`Teléfono original: ${jsonStr}`);
            console.log(`Teléfono formateado: ${formattedPhones}`);
          } catch (e) {
            console.warn(`Error procesando teléfono en línea ${i}:`, e);
            // Mantener el campo original si hay error
          }
        }

        // Reconstituir la línea
        processedLines.push(fields.join(','));
      }

      // Unir todas las líneas
      return processedLines.join('\n');
    } catch (error) {
      console.error("Error al exportar cartilla a CSV:", error);
      throw error;
    }
  },

  /**
   * Crea un prestador completo con todas sus relaciones
   * @async
   * @param {Object} prestadorData - Datos del prestador
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con los datos completos del prestador creado
   */
  createPrestadorCompleto: async (prestadorData) => {
    return await supplierProcessor.processCompleteEntityCreation(prestadorData);
  },

  /**
   * Actualiza un prestador existente y devuelve los datos completos actualizados
   * @async
   * @param {number} id - ID del prestador a actualizar
   * @param {Object} prestadorData - Nuevos datos del prestador
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con los datos completos del prestador actualizado
   */
  updatePrestador: async (id, prestadorData) => {
    return await supplierProcessor.executeCompleteEntityUpdate(id, prestadorData);
  },

  /**
   * Actualiza el estado de un prestador por nombre
   * @async
   * @param {string} nombre - Nombre del prestador
   * @param {string} estado - Nuevo estado ('Activo' o 'Inactivo')
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el resultado de la operación
   */
  updateEstadoPrestadorPorNombre: async (nombre, estado) => {
    return await supplierProcessor.modifyEntityStatusByName(nombre, estado);
  },

  /**
   * Da de baja un prestador cambiando su estado a 'Inactivo'
   * @async
   * @param {number} id - ID del prestador
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el resultado de la operación
   */
  downPrestador: async (id) => {
    return await supplierProcessor.deactivateEntityById(id);
  },

  /**
   * Procesa un archivo CSV masivo de prestadores médicos con streams
   * @async
   * @param {string} filePath - Ruta del archivo CSV
   * @param {Object} [options] - Opciones de configuración
   * @param {string} [options.delimiter=','] - Delimitador de campos
   * @param {number} [options.batchSize=1000] - Tamaño del lote para inserción
   * @param {Function} [options.progressCallback] - Callback para notificar progreso
   * @param {boolean} [options.enablePhoneParsing=true] - Si aplicar parseo automático de teléfonos
   * @returns {Promise<Object>} - Resultados del proceso
   */
  processMassiveCSVStream: async (filePath, options = {}) => {
    return await csvProcessor.processMassiveCSVStream(filePath, options);
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
    return await pdfGenerator.updateTemplateAsset(id_plan, id_provincia, pdfFile);
  },

  /**
   * Descarga la cartilla en formato PDF
   * @async
   * @param {number} id_plan - ID del plan
   * @param {number} id_provincia - ID de la provincia
   * @returns {Promise<Object>} - Objeto con los bytes del PDF y nombre del archivo
   */
  downloadCartillaPDF: async (id_plan, id_provincia) => {
    return await pdfGenerator.generateDocumentOutput(id_plan, id_provincia);
  },
};

module.exports = PrestadorRepository;
