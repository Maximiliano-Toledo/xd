/**
 * @module repositories/prestadorRepository
 * @description Repositorio para operaciones relacionadas con prestadores médicos
 */

const { pool } = require("../config/db");
const ABMRepository = require('./abmRepository');
const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");

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
 * Obtiene prestadores filtrados por nombre y otros criterios
 * @async
 * @param {number} idPlan - ID del plan
 * @param {number} idCategoria - ID de la categoría
 * @param {number} idLocalidad - ID de la localidad
 * @param {number} idEspecialidad - ID de la especialidad
 * @param {string} nombre_prestador - Nombre o parte del nombre del prestador para búsqueda
 * @returns {Promise<Array>} - Promesa que resuelve a un array con los prestadores que coinciden con el criterio de búsqueda
 */
  getPrestadoresByNombre: async (
    idPlan,
    idCategoria,
    idLocalidad,
    idEspecialidad,
    nombre_prestador
  ) => {
    try {
      return await pool.query("CALL getPrestadoresByNombre(?, ?, ?, ?, ?);", [
        idPlan,
        idCategoria,
        idLocalidad,
        idEspecialidad,
        nombre_prestador,
      ]);
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

      // 1. Insertar el prestador principal
      const [result] = await connection.query(
        `INSERT INTO prestadores SET ?`,
        [{
          nombre: prestadorData.nombre,
          direccion: prestadorData.direccion,
          telefonos: prestadorData.telefonos,
          email: prestadorData.email,
          informacion_adicional: prestadorData.informacion_adicional,
          id_localidad: prestadorData.id_localidad,
          estado: prestadorData.estado || 'Activo' // Valor por defecto si no viene
        }]
      );

      const idPrestador = result.insertId;

      // 2. Obtener nombres para los campos de cartilla
      const [localidad] = await connection.query(
        `SELECT nombre, id_provincia
            FROM localidades 
            WHERE id_localidad = ?`,
        [prestadorData.id_localidad]
      );

      const [provincia] = await connection.query(
        `SELECT nombre
            FROM provincias
            WHERE id_provincia = ?`,
        [localidad[0].id_provincia]
      );

      // Obtener nombres de categorías, especialidades y planes
      let categorias = [], especialidades = [], planes = [];

      if (prestadorData.categorias && prestadorData.categorias.length > 0) {
        [categorias] = await connection.query(
          `SELECT nombre FROM categorias_prestador WHERE id_categoria IN (?)`,
          [prestadorData.categorias]
        );
      }

      if (prestadorData.especialidades && prestadorData.especialidades.length > 0) {
        [especialidades] = await connection.query(
          `SELECT nombre FROM especialidades WHERE id_especialidad IN (?)`,
          [prestadorData.especialidades]
        );
      }

      if (prestadorData.planes && prestadorData.planes.length > 0) {
        [planes] = await connection.query(
          `SELECT nombre FROM planes WHERE id_plan IN (?)`,
          [prestadorData.planes]
        );
      }

      // 3. Crear registro en cartilla
      await connection.query(
        `INSERT INTO cartilla SET ?`,
        {
          id_prestador: idPrestador,
          nombre_prestador: prestadorData.nombre,
          direccion: prestadorData.direccion,
          telefonos: prestadorData.telefonos,
          email: prestadorData.email,
          informacion_adicional: prestadorData.informacion_adicional,
          localidad: localidad[0].nombre,
          provincia: provincia[0].nombre,
          categoria_prestador: categorias.map(c => c.nombre).join(', '),
          especialidad: especialidades.map(e => e.nombre).join(', '),
          plan: planes.map(p => p.nombre).join(', '),
          estado: prestadorData.estado || 'Activo'
        }
      );

      // 4. Insertar relaciones
      const insertRelations = async (table, field, values) => {
        if (!Array.isArray(values) || values.length === 0) return;

        const relations = values.map(id => [idPrestador, id]);
        await connection.query(
          `INSERT INTO ${table} (id_prestador, ${field}) VALUES ?`,
          [relations]
        );
      };

      if (prestadorData.categorias && prestadorData.categorias.length > 0) {
        await insertRelations('prestador_categoria', 'id_categoria', prestadorData.categorias);
      }

      if (prestadorData.especialidades && prestadorData.especialidades.length > 0) {
        await insertRelations('prestador_especialidad', 'id_especialidad', prestadorData.especialidades);
      }

      if (prestadorData.planes && prestadorData.planes.length > 0) {
        await insertRelations('prestador_plan', 'id_plan', prestadorData.planes);
      }

      // 5. Obtener datos completos del prestador creado para la respuesta
      const [prestadorResult] = await connection.query(
        `SELECT * FROM prestadores WHERE id_prestador = ?`,
        [idPrestador]
      );

      const [categoriasResult] = await connection.query(
        `SELECT c.id_categoria, c.nombre 
             FROM categorias_prestador c
             INNER JOIN prestador_categoria pc ON c.id_categoria = pc.id_categoria
             WHERE pc.id_prestador = ?`,
        [idPrestador]
      );

      const [especialidadesResult] = await connection.query(
        `SELECT e.id_especialidad, e.nombre 
             FROM especialidades e
             INNER JOIN prestador_especialidad pe ON e.id_especialidad = pe.id_especialidad
             WHERE pe.id_prestador = ?`,
        [idPrestador]
      );

      const [planesResult] = await connection.query(
        `SELECT p.id_plan, p.nombre 
             FROM planes p
             INNER JOIN prestador_plan pp ON p.id_plan = pp.id_plan
             WHERE pp.id_prestador = ?`,
        [idPrestador]
      );

      await connection.commit();

      // Construir objeto de respuesta completo
      return {
        id: idPrestador,
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
};

module.exports = PrestadorRepository;