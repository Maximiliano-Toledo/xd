/**
 * @module repositories/prestadorRepository
 * @description Repositorio para operaciones relacionadas con prestadores médicos
 */

const { pool } = require("../config/db");
const ABMRepository = require('./abmRepository');
const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");
const csv = require('csv-parser');
const { Transform } = require('stream');

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
  /**
   * Obtiene todos los planes disponibles
   * @async
   * @returns {Promise<Array>} - Promesa que resuelve a un array con los planes
   */
  getPlanes: async () => {
    try {
      return await pool.query("SELECT * FROM planes;");
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
  getProvincias: async (idPlan) => {
    try {
      return await pool.query("CALL getProvinciasByPlan(?);", [idPlan]);
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
  getLocalidades: async (idPlan, idProvincia) => {
    try {
      return await pool.query("CALL getLocalidadesByPlanAndProvincia(?, ?);", [idPlan, idProvincia]);
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
  getCategorias: async (idPlan, idLocalidad) => {
    try {
      return await pool.query("CALL getCategoriasByPlanAndLocalidad(?, ?);", [idPlan, idLocalidad]);
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
  getEspecialidades: async (idPlan, idCategoria, idProvincia, idLocalidad) => {
    try {
      return await pool.query(
        "CALL getEspecialidadesByLocalidadAndProvinciaAndCategoriaAndPlan(?, ?, ?, ?);",
        [idPlan, idCategoria, idProvincia, idLocalidad]
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
  getEspecialidadesByNombrePrestador: async (idPlan, idProvincia, idLocalidad, idCategoria, nombre_prestador) => {
    try {
      return await pool.query(
        "CALL getEspecialidadesByNombrePrestador(?, ?, ?, ?, ?);",
        [idPlan, idProvincia, idLocalidad, idCategoria, nombre_prestador]
      );
    } catch (error) {
      console.error("Error al obtener especialidades por nombre de prestador:", error);
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

      return [{
        items: rows,
        pagination: {
          totalItems,
          itemsPerPage: limit,
          currentPage: page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }];
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
    page = 1,
    limit = 10
  ) => {
    try {
      // Cálculo del offset para paginación
      const offset = (page - 1) * limit;

      // Obtener total de registros
      const [countResult] = await pool.query(
        "CALL getCountPrestadores(?, ?, ?, ?, ?);",
        [idPlan, idCategoria, idProvincia, idLocalidad, idEspecialidad]
      );

      const totalItems = countResult[0][0].total || 0;

      // Obtener prestadores paginados
      const [rows] = await pool.query(
        "CALL getPrestadoresPaginados(?, ?, ?, ?, ?, ?, ?);",
        [idPlan, idCategoria, idProvincia, idLocalidad, idEspecialidad, limit, offset]
      );

      // Calcular metadatos de paginación
      const totalPages = Math.ceil(totalItems / limit);

      return [{
        items: rows[0],
        pagination: {
          totalItems,
          itemsPerPage: limit,
          currentPage: page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }];
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
  page = 1,
  limit = 10
) => {
  try {
    // Cálculo del offset para paginación
    const offset = (page - 1) * limit;

    // Obtener total de registros (necesitarás crear un SP para contar los resultados filtrados por nombre)
    const [countResult] = await pool.query(
      "CALL getCountPrestadoresByNombre(?, ?, ?, ?, ?);",
      [idPlan, idCategoria, idLocalidad, idEspecialidad, nombre_prestador]
    );

    const totalItems = countResult[0][0].total || 0;

    // Obtener prestadores paginados usando el nuevo SP
    const [rows] = await pool.query(
      "CALL GetPrestadoresByNombrePaginados(?, ?, ?, ?, ?, ?, ?);",
      [idPlan, idCategoria, idLocalidad, idEspecialidad, nombre_prestador, limit, offset]
    );

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalItems / limit);

    return [{
      items: rows[0],
      pagination: {
        totalItems,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }];
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
  ) => {
    try {
      return await pool.query("CALL GetPrestadoresByPlanAndProvinciaAndLocalidadAndCategoria(?, ?, ?, ?);", [
        idPlan,
        idProvincia,
        idLocalidad,
        idCategoria,
      ]);
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
  getCartillaStream: async () => {
    try {
      // 1. Obtener datos de la tabla cartilla
      const [results] = await pool.query('SELECT * FROM cartilla');

      if (!results || results.length === 0) {
        throw new Error('No se encontraron datos en la tabla cartilla');
      }

      // 2. Convertir a CSV
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(results);

      return csv;
    } catch (error) {
      console.error('Error al exportar cartilla a CSV:', error);
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
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Obtener datos comunes (localidad, provincia, categorías, etc.)
        const [localidad] = await connection.query(
            `SELECT nombre, id_provincia FROM localidades WHERE id_localidad = ?`,
            [prestadorData.id_localidad]
        );

        const [provincia] = await connection.query(
            `SELECT nombre FROM provincias WHERE id_provincia = ?`,
            [localidad[0].id_provincia]
        );

        const [categorias] = await connection.query(
            `SELECT nombre FROM categorias_prestador WHERE id_categoria IN (?)`,
            [prestadorData.categorias]
        );

        const [especialidades] = await connection.query(
            `SELECT id_especialidad, nombre FROM especialidades WHERE id_especialidad IN (?)`,
            [prestadorData.especialidades]
        );

        const [planes] = await connection.query(
            `SELECT id_plan, nombre FROM planes WHERE id_plan IN (?)`,
            [prestadorData.planes]
        );

        const categoriasStr = categorias.map(c => c.nombre).join(', ');
        const resultados = [];

        // 2. Procesar cada combinación plan × especialidad
        for (const plan of planes) {
            for (const especialidad of especialidades) {
                // Crear nuevo prestador PARA CADA COMBINACIÓN
                const newPrestador = await ABMRepository.create('prestadores', {
                    nombre: prestadorData.nombre,
                    direccion: prestadorData.direccion,
                    telefonos: prestadorData.telefonos,
                    email: prestadorData.email,
                    informacion_adicional: prestadorData.informacion_adicional,
                    id_localidad: prestadorData.id_localidad,
                    estado: prestadorData.estado || 'Activo'
                });

                const idPrestador = newPrestador.id;

                // Crear registro en cartilla
                await ABMRepository.create('cartilla', {
                    id_prestador: idPrestador,
                    nombre_prestador: prestadorData.nombre,
                    direccion: prestadorData.direccion,
                    telefonos: prestadorData.telefonos,
                    email: prestadorData.email,
                    informacion_adicional: prestadorData.informacion_adicional,
                    localidad: localidad[0].nombre,
                    provincia: provincia[0].nombre,
                    categoria_prestador: categoriasStr,
                    especialidad: especialidad.nombre,
                    plan: plan.nombre,
                    estado: prestadorData.estado || 'Activo'
                });

                // Insertar relaciones (categorías, especialidades, planes)
                const insertRelations = async (table, field, values) => {
                    if (!Array.isArray(values) || values.length === 0) return;
                    
                    const relations = values.map(id => [idPrestador, id]);
                    await connection.query(
                        `INSERT INTO ${table} (id_prestador, ${field}) VALUES ?`,
                        [relations]
                    );
                };

                // Para este prestador específico:
                await insertRelations('prestador_categoria', 'id_categoria', prestadorData.categorias);
                await insertRelations('prestador_especialidad', 'id_especialidad', [especialidad.id_especialidad]); // Solo la especialidad actual
                await insertRelations('prestador_plan', 'id_plan', [plan.id_plan]); // Solo el plan actual

                resultados.push({
                    id_prestador: idPrestador,
                    plan: plan.nombre,
                    especialidad: especialidad.nombre
                });
            }
        }

        await connection.commit();
        return {
            success: true,
            registros_creados: resultados,
            total: resultados.length
        };

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error in createPrestadorCompleto:", error);
        throw new Error("Error creating prestador completo");
    } finally {
        if (connection) connection.release();
    }
},

  /**
 * Actualiza un prestador existente y devuelve los datos completos actualizados
 * @async
 * @param {number} id - ID del prestador a actualizar
 * @param {Object} prestadorData - Nuevos datos del prestador
 * @returns {Promise<Object>} - Promesa que resuelve a un objeto con los datos completos del prestador actualizado
 */
  updatePrestador: async (id, prestadorData) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // Filtrar datos del prestador
      const prestadorDataFiltered = {};
      const relationsToUpdate = {
        categorias: prestadorData.categorias,
        especialidades: prestadorData.especialidades,
        planes: prestadorData.planes
      };

      Object.entries(prestadorData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'categorias' || key === 'especialidades' || key === 'planes') return;
          prestadorDataFiltered[key] = value;
        }
      });

      // 1. Actualizar el prestador
      if (Object.keys(prestadorDataFiltered).length > 0) {
        await ABMRepository.update(
          'prestadores',
          'id_prestador',
          id,
          prestadorDataFiltered
        );
      }

      // 2. Actualizar la cartilla - Mapear los campos correctamente
      if (Object.keys(prestadorDataFiltered).length > 0) {
        // Crear un objeto con los campos mapeados para la tabla cartilla
        const cartillaDataFiltered = {};

        // Mapeo de campos entre prestadores y cartilla
        const fieldMapping = {
          'nombre': 'nombre_prestador',
          'direccion': 'direccion',
          'telefonos': 'telefonos',
          'email': 'email',
          'informacion_adicional': 'informacion_adicional',
          'estado': 'estado'
        };

        // Crear objeto con campos mapeados correctamente
        Object.entries(prestadorDataFiltered).forEach(([key, value]) => {
          if (fieldMapping[key]) {
            cartillaDataFiltered[fieldMapping[key]] = value;
          }
        });

        // Solo actualizar si hay campos para actualizar
        if (Object.keys(cartillaDataFiltered).length > 0) {
          await ABMRepository.update(
            'cartilla',
            'id_prestador',
            id,
            cartillaDataFiltered
          );
        }
      }

      // 3. Actualizar relaciones
      // Para cada tipo de relación, verificar si se proporcionaron datos nuevos
      if (relationsToUpdate.categorias !== undefined) {
        console.log("Actualizando categorías:", relationsToUpdate.categorias);
        await connection.query(
          `DELETE FROM prestador_categoria WHERE id_prestador = ?`,
          [id]
        );

        if (relationsToUpdate.categorias && relationsToUpdate.categorias.length > 0) {
          const categoriasValues = relationsToUpdate.categorias.map(catId => [id, catId]);
          await connection.query(
            `INSERT INTO prestador_categoria (id_prestador, id_categoria) VALUES ?`,
            [categoriasValues]
          );
        }
      }

      if (relationsToUpdate.especialidades !== undefined) {
        console.log("Actualizando especialidades:", relationsToUpdate.especialidades);
        await connection.query(
          `DELETE FROM prestador_especialidad WHERE id_prestador = ?`,
          [id]
        );

        if (relationsToUpdate.especialidades && relationsToUpdate.especialidades.length > 0) {
          const especialidadesValues = relationsToUpdate.especialidades.map(espId => [id, espId]);
          await connection.query(
            `INSERT INTO prestador_especialidad (id_prestador, id_especialidad) VALUES ?`,
            [especialidadesValues]
          );
        }
      }

      if (relationsToUpdate.planes !== undefined) {
        console.log("Actualizando planes:", relationsToUpdate.planes);
        await connection.query(
          `DELETE FROM prestador_plan WHERE id_prestador = ?`,
          [id]
        );

        if (relationsToUpdate.planes && relationsToUpdate.planes.length > 0) {
          const planesValues = relationsToUpdate.planes.map(planId => [id, planId]);
          await connection.query(
            `INSERT INTO prestador_plan (id_prestador, id_plan) VALUES ?`,
            [planesValues]
          );
        }
      }

      // 4. Actualizar la información en cartilla para las relaciones
      if (relationsToUpdate.categorias !== undefined ||
        relationsToUpdate.especialidades !== undefined ||
        relationsToUpdate.planes !== undefined) {

        // Obtener los nombres actualizados para cartilla
        let categoriaNames = [], especialidadNames = [], planNames = [];

        if (relationsToUpdate.categorias !== undefined && relationsToUpdate.categorias.length > 0) {
          const [categoriasResult] = await connection.query(
            `SELECT nombre FROM categorias_prestador WHERE id_categoria IN (?)`,
            [relationsToUpdate.categorias]
          );
          categoriaNames = categoriasResult.map(c => c.nombre);
        }

        if (relationsToUpdate.especialidades !== undefined && relationsToUpdate.especialidades.length > 0) {
          const [especialidadesResult] = await connection.query(
            `SELECT nombre FROM especialidades WHERE id_especialidad IN (?)`,
            [relationsToUpdate.especialidades]
          );
          especialidadNames = especialidadesResult.map(e => e.nombre);
        }

        if (relationsToUpdate.planes !== undefined && relationsToUpdate.planes.length > 0) {
          const [planesResult] = await connection.query(
            `SELECT nombre FROM planes WHERE id_plan IN (?)`,
            [relationsToUpdate.planes]
          );
          planNames = planesResult.map(p => p.nombre);
        }

        // Actualizar cartilla con los nombres concatenados
        const cartillaRelationsUpdate = {};

        if (relationsToUpdate.categorias !== undefined) {
          cartillaRelationsUpdate.categoria_prestador = categoriaNames.join(', ');
        }

        if (relationsToUpdate.especialidades !== undefined) {
          cartillaRelationsUpdate.especialidad = especialidadNames.join(', ');
        }

        if (relationsToUpdate.planes !== undefined) {
          cartillaRelationsUpdate.plan = planNames.join(', ');
        }

        if (Object.keys(cartillaRelationsUpdate).length > 0) {
          await connection.query(
            `UPDATE cartilla SET ? WHERE id_prestador = ?`,
            [cartillaRelationsUpdate, id]
          );
        }
      }

      // 5. Obtener datos completos del prestador actualizado para la respuesta
      const [prestadorResult] = await connection.query(
        `SELECT * FROM prestadores WHERE id_prestador = ?`,
        [id]
      );

      const [categoriasResult] = await connection.query(
        `SELECT c.id_categoria, c.nombre 
             FROM categorias_prestador c
             INNER JOIN prestador_categoria pc ON c.id_categoria = pc.id_categoria
             WHERE pc.id_prestador = ?`,
        [id]
      );

      const [especialidadesResult] = await connection.query(
        `SELECT e.id_especialidad, e.nombre 
             FROM especialidades e
             INNER JOIN prestador_especialidad pe ON e.id_especialidad = pe.id_especialidad
             WHERE pe.id_prestador = ?`,
        [id]
      );

      const [planesResult] = await connection.query(
        `SELECT p.id_plan, p.nombre 
             FROM planes p
             INNER JOIN prestador_plan pp ON p.id_plan = pp.id_plan
             WHERE pp.id_prestador = ?`,
        [id]
      );

      await connection.commit();

      // Construir objeto de respuesta completo
      return {
        id,
        success: true,
        prestador: {
          ...prestadorResult[0],
          categorias: categoriasResult,
          especialidades: especialidadesResult,
          planes: planesResult
        }
      };

    } catch (error) {
      if (connection) await connection.rollback();
      console.error("Error al Actualizar Prestador:", error);
      throw new Error("Error al Actualizar Prestador");
    } finally {
      if (connection) connection.release();
    }
  },

  /**
   * Actualiza el estado de un prestador por nombre
   * @async
   * @param {string} nombre - Nombre del prestador
   * @param {string} estado - Nuevo estado ('Activo' o 'Inactivo')
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el resultado de la operación
   */
  updateEstadoPrestadorPorNombre: async (nombre, estado) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      if (estado !== 'Activo' && estado !== 'Inactivo') {
        throw new Error('Estado inválido. Debe ser "Activo" o "Inactivo"');
      }

      // Actualizar en prestadores
      await ABMRepository.updateByName(
        'prestadores',
        'nombre',
        nombre,
        { estado }
      );

      // Actualizar en cartilla (ajusta el campo nombre según tu esquema)
      await ABMRepository.updateByName(
        'cartilla',
        'nombre_prestador',
        nombre,
        { estado }
      );

      await connection.commit();
      return { success: true, nombre, estado };

    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error al cambiar estado del prestador:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  },

  /**
   * Da de baja un prestador cambiando su estado a 'Inactivo'
   * @async
   * @param {number} id - ID del prestador
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el resultado de la operación
   */
  downPrestador: async (id) => {
    try {
      await ABMRepository.update(
        'prestadores',
        'id_prestador',
        id,
        { estado: 'Inactivo' }
      );

      await ABMRepository.update(
        'cartilla',
        'id_prestador',
        id,
        { estado: 'Inactivo' }
      );
      return { id, success: true };
    } catch (error) {
      console.error("Error en baja de prestador:", error);
      throw new Error("Error en baja de prestador");
    }
  },


  /**
   * Procesa un archivo CSV masivo de prestadores médicos con streams
   * @async
   * @param {string} filePath - Ruta del archivo CSV
   * @param {Object} [options] - Opciones de configuración
   * @param {string} [options.delimiter=','] - Delimitador de campos
   * @param {number} [options.batchSize=1000] - Tamaño del lote para inserción
   * @param {Function} [options.progressCallback] - Callback para notificar progreso
   * @returns {Promise<Object>} - Resultados del proceso
   */
  processMassiveCSVStream: async (filePath, options = {}) => {
    const {
      delimiter = ',',
      batchSize = 1000,
      progressCallback
    } = options;

    let processedCount = 0;
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // 1. Limpiar cartilla inicialmente
      await connection.query('CALL LimpiarCartilla()');
      
      let batchValues = [];
      let batchNumber = 0;

      // Transform stream para procesar cada línea
      const csvTransformer = new Transform({
        objectMode: true,
        transform(row, encoding, callback) {
          try {
            // Validación básica de campos requeridos
            if (!row.nombre_prestador || !row.plan || !row.especialidad) {
              return callback(new Error(`Fila ${processedCount + 1}: Faltan campos requeridos`));
            }

            // Preparar valores para la inserción
            const values = [
              row.plan || '',
              row.categoria || '',
              row.especialidad || '',
              row.provincia || '',
              row.localidad || '',
              row.nombre_prestador || '',
              row.direccion || '',
              row.telefonos || '',
              row.email || '',
              row.informacion_adicional || '',
              row.estado || 'Activo'
            ];

            batchValues.push(values);
            processedCount++;

            // Notificar progreso cada 1000 registros
            if (progressCallback && processedCount % 1000 === 0) {
              progressCallback({
                totalProcessed: processedCount,
                batchNumber: Math.floor(processedCount / batchSize),
                status: 'processing'
              });
            }

            // Si el batch está lleno, insertar
            if (batchValues.length >= batchSize) {
              this.push(batchValues);
              batchValues = [];
              batchNumber++;
            }

            callback();
          } catch (error) {
            callback(error);
          }
        },
        flush(callback) {
          // Insertar los registros restantes en el último batch
          if (batchValues.length > 0) {
            this.push(batchValues);
          }
          callback();
        }
      });

      // Stream para insertar los batches en la base de datos
      const dbInserter = new Transform({
        objectMode: true,
        async transform(batch, encoding, callback) {
          try {
            await connection.query(
              `INSERT INTO cartilla 
              (plan, categoria_prestador, especialidad, provincia, localidad, 
                nombre_prestador, direccion, telefonos, email, informacion_adicional, estado) 
              VALUES ?`,
              [batch]
            );
            callback();
          } catch (error) {
            callback(error);
          }
        }
      });

      // Pipeline completo
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv({
            separator: delimiter,
            mapValues: ({ value }) => value.trim(),
            skipLines: 0 // Asumiendo que no hay encabezados
          }))
          .on('error', reject)
          .pipe(csvTransformer)
          .on('error', reject)
          .pipe(dbInserter)
          .on('error', reject)
          .on('finish', resolve);
      });

      // 3. Limpiar tablas de cartilla
      await connection.query('CALL LimpiarTablasCartilla()');

      // 4. Procesar la cartilla para poblar las tablas relacionadas
      await connection.query('CALL ProcesarCartilla()');

      await connection.commit();

      if (progressCallback) {
        progressCallback({
          totalProcessed: processedCount,
          status: 'completed'
        });
      }

      return {
        success: true,
        totalProcessed: processedCount,
        message: `CSV procesado exitosamente. ${processedCount} registros cargados.`
      };

    } catch (error) {
      if (connection) await connection.rollback();
      
      if (progressCallback) {
        progressCallback({
          error: error.message,
          status: 'failed',
          totalProcessed: processedCount || 0
        });
      }

      console.error('Error al procesar CSV:', error);
      throw new Error(`Error al procesar CSV: ${error.message}`);
    } finally {
      if (connection) connection.release();
    }
  },
};

module.exports = PrestadorRepository;