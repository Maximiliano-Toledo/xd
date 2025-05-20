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

const PLAN_MAPPING = {
  "Plan Clásico": "clasico",
  "Plan Social": "social",
  "Plan Total": "total",
  "Plan Total Profesional": "total-profesional",
};

const PROVINCIA_MAPPING = {
  "C.A.B.A.": "CABA",
};

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
  getPlanes: async (edit = false) => {
    const estado = edit ? 'Todos' : 'Activo';
    try {
      if (estado === 'Todos') {
        return await pool.query("SELECT * FROM planes;");
      }
      return await pool.query("SELECT * FROM planes WHERE estado = ?;", [estado]);
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
  getCartillaStream: async () => {
    try {
      // 1. Obtener datos de la tabla cartilla
      const [results] = await pool.query("SELECT plan, categoria_prestador, especialidad, provincia, localidad, nombre_prestador, direccion, telefonos, email, informacion_adicional, estado FROM cartilla;");

      if (!results || results.length === 0) {
        throw new Error("No se encontraron datos en la tabla cartilla");
      }

      // 2. Convertir a CSV
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(results);

      return csv;
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

      const categoriasStr = categorias.map((c) => c.nombre).join(", ");
      const resultados = [];

      // 2. Procesar cada combinación plan × especialidad
      for (const plan of planes) {
        for (const especialidad of especialidades) {
          // Crear nuevo prestador PARA CADA COMBINACIÓN
          const newPrestador = await ABMRepository.create("prestadores", {
            nombre: prestadorData.nombre,
            direccion: prestadorData.direccion,
            telefonos: prestadorData.telefonos,
            email: prestadorData.email,
            informacion_adicional: prestadorData.informacion_adicional,
            id_localidad: prestadorData.id_localidad,
            estado: prestadorData.estado || "Activo",
          });

          const idPrestador = newPrestador.id;

          // Crear registro en cartilla
          await ABMRepository.create("cartilla", {
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
            estado: prestadorData.estado || "Activo",
          });

          // Insertar relaciones (categorías, especialidades, planes)
          const insertRelations = async (table, field, values) => {
            if (!Array.isArray(values) || values.length === 0) return;

            const relations = values.map((id) => [idPrestador, id]);
            await connection.query(
              `INSERT INTO ${table} (id_prestador, ${field}) VALUES ?`,
              [relations]
            );
          };

          // Para este prestador específico:
          await insertRelations(
            "prestador_categoria",
            "id_categoria",
            prestadorData.categorias
          );
          await insertRelations("prestador_especialidad", "id_especialidad", [
            especialidad.id_especialidad,
          ]); // Solo la especialidad actual
          await insertRelations("prestador_plan", "id_plan", [plan.id_plan]); // Solo el plan actual

          resultados.push({
            id_prestador: idPrestador,
            plan: plan.nombre,
            especialidad: especialidad.nombre,
          });
        }
      }

      await connection.commit();
      return {
        success: true,
        registros_creados: resultados,
        total: resultados.length,
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
        planes: prestadorData.planes,
      };

      Object.entries(prestadorData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (
            key === "categorias" ||
            key === "especialidades" ||
            key === "planes"
          )
            return;
          prestadorDataFiltered[key] = value;
        }
      });

      // 1. Actualizar el prestador
      if (Object.keys(prestadorDataFiltered).length > 0) {
        await ABMRepository.update(
          "prestadores",
          "id_prestador",
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
          nombre: "nombre_prestador",
          direccion: "direccion",
          telefonos: "telefonos",
          email: "email",
          informacion_adicional: "informacion_adicional",
          estado: "estado",
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
            "cartilla",
            "id_prestador",
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

        if (
          relationsToUpdate.categorias &&
          relationsToUpdate.categorias.length > 0
        ) {
          const categoriasValues = relationsToUpdate.categorias.map((catId) => [
            id,
            catId,
          ]);
          await connection.query(
            `INSERT INTO prestador_categoria (id_prestador, id_categoria) VALUES ?`,
            [categoriasValues]
          );
        }
      }

      if (relationsToUpdate.especialidades !== undefined) {
        console.log(
          "Actualizando especialidades:",
          relationsToUpdate.especialidades
        );
        await connection.query(
          `DELETE FROM prestador_especialidad WHERE id_prestador = ?`,
          [id]
        );

        if (
          relationsToUpdate.especialidades &&
          relationsToUpdate.especialidades.length > 0
        ) {
          const especialidadesValues = relationsToUpdate.especialidades.map(
            (espId) => [id, espId]
          );
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
          const planesValues = relationsToUpdate.planes.map((planId) => [
            id,
            planId,
          ]);
          await connection.query(
            `INSERT INTO prestador_plan (id_prestador, id_plan) VALUES ?`,
            [planesValues]
          );
        }
      }

      // 4. Actualizar la información en cartilla para las relaciones
      if (
        relationsToUpdate.categorias !== undefined ||
        relationsToUpdate.especialidades !== undefined ||
        relationsToUpdate.planes !== undefined
      ) {
        // Obtener los nombres actualizados para cartilla
        let categoriaNames = [],
          especialidadNames = [],
          planNames = [];

        if (
          relationsToUpdate.categorias !== undefined &&
          relationsToUpdate.categorias.length > 0
        ) {
          const [categoriasResult] = await connection.query(
            `SELECT nombre FROM categorias_prestador WHERE id_categoria IN (?)`,
            [relationsToUpdate.categorias]
          );
          categoriaNames = categoriasResult.map((c) => c.nombre);
        }

        if (
          relationsToUpdate.especialidades !== undefined &&
          relationsToUpdate.especialidades.length > 0
        ) {
          const [especialidadesResult] = await connection.query(
            `SELECT nombre FROM especialidades WHERE id_especialidad IN (?)`,
            [relationsToUpdate.especialidades]
          );
          especialidadNames = especialidadesResult.map((e) => e.nombre);
        }

        if (
          relationsToUpdate.planes !== undefined &&
          relationsToUpdate.planes.length > 0
        ) {
          const [planesResult] = await connection.query(
            `SELECT nombre FROM planes WHERE id_plan IN (?)`,
            [relationsToUpdate.planes]
          );
          planNames = planesResult.map((p) => p.nombre);
        }

        // Actualizar cartilla con los nombres concatenados
        const cartillaRelationsUpdate = {};

        if (relationsToUpdate.categorias !== undefined) {
          cartillaRelationsUpdate.categoria_prestador =
            categoriaNames.join(", ");
        }

        if (relationsToUpdate.especialidades !== undefined) {
          cartillaRelationsUpdate.especialidad = especialidadNames.join(", ");
        }

        if (relationsToUpdate.planes !== undefined) {
          cartillaRelationsUpdate.plan = planNames.join(", ");
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
          planes: planesResult,
        },
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

      if (estado !== "Activo" && estado !== "Inactivo") {
        throw new Error('Estado inválido. Debe ser "Activo" o "Inactivo"');
      }

      // Actualizar en prestadores
      await ABMRepository.updateByName("prestadores", "nombre", nombre, {
        estado,
      });

      // Actualizar en cartilla (ajusta el campo nombre según tu esquema)
      await ABMRepository.updateByName("cartilla", "nombre_prestador", nombre, {
        estado,
      });

      await connection.commit();
      return { success: true, nombre, estado };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error("Error al cambiar estado del prestador:", error);
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
      await ABMRepository.update("prestadores", "id_prestador", id, {
        estado: "Inactivo",
      });

      await ABMRepository.update("cartilla", "id_prestador", id, {
        estado: "Inactivo",
      });
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
    const { delimiter = ",", batchSize = 1000, progressCallback } = options;

    let processedCount = 0;
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // 1. Limpiar cartilla inicialmente
      await connection.query("CALL LimpiarCartilla()");

      let batchValues = [];
      let batchNumber = 0;

      // Transform stream para procesar cada línea
      const csvTransformer = new Transform({
        objectMode: true,
        transform(row, encoding, callback) {
          try {
            // Validación básica de campos requeridos
            if (!row.nombre_prestador || !row.plan || !row.especialidad) {
              return callback(
                new Error(
                  `Fila ${processedCount + 1}: Faltan campos requeridos`
                )
              );
            }

            // Preparar valores para la inserción
            const values = [
              row.plan || "",
              row.categoria_prestador || "",
              row.especialidad || "",
              row.provincia || "",
              row.localidad || "",
              row.nombre_prestador || "",
              row.direccion || "",
              row.telefonos || "",
              row.email || "",
              row.informacion_adicional || "",
              row.estado || "Activo",
            ];

            batchValues.push(values);
            processedCount++;

            // Notificar progreso cada 1000 registros
            if (progressCallback && processedCount % 1000 === 0) {
              progressCallback({
                totalProcessed: processedCount,
                batchNumber: Math.floor(processedCount / batchSize),
                status: "processing",
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
        },
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
        },
      });

      // Pipeline completo
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(
            csv({
              separator: delimiter,
              mapValues: ({ value }) => value.trim(),
              skipLines: 0, // Asumiendo que no hay encabezados
            })
          )
          .on("error", reject)
          .pipe(csvTransformer)
          .on("error", reject)
          .pipe(dbInserter)
          .on("error", reject)
          .on("finish", resolve);
      });

      // 3. Limpiar tablas de cartilla
      await connection.query("CALL LimpiarTablasCartilla()");

      // 4. Procesar la cartilla para poblar las tablas relacionadas
      await connection.query("CALL ProcesarCartilla()");

      await connection.commit();

      if (progressCallback) {
        progressCallback({
          totalProcessed: processedCount,
          status: "completed",
        });
      }

      return {
        success: true,
        totalProcessed: processedCount,
        message: `CSV procesado exitosamente. ${processedCount} registros cargados.`,
      };
    } catch (error) {
      if (connection) await connection.rollback();

      if (progressCallback) {
        progressCallback({
          error: error.message,
          status: "failed",
          totalProcessed: processedCount || 0,
        });
      }

      console.error("Error al procesar CSV:", error);
      throw new Error(`Error al procesar CSV: ${error.message}`);
    } finally {
      if (connection) connection.release();
    }
  },

  /**
   * Descarga la cartilla en formato PDF
   * @async
   * @param {number} id_plan - ID del plan
   * @param {number} id_provincia - ID de la provincia
   * @returns {Promise<Object>} - Objeto con los bytes del PDF y nombre del archivo
   */
  downloadCartillaPDF: async (id_plan, id_provincia) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // 1. Obtener nombres de plan y provincia
      const [planResult] = await connection.query(
        "SELECT nombre FROM planes WHERE id_plan = ?",
        [id_plan]
      );
      const [provinciaResult] = await connection.query(
        "SELECT nombre FROM provincias WHERE id_provincia = ?",
        [id_provincia]
      );

      if (!planResult.length || !provinciaResult.length) {
        throw new Error("Plan o provincia no encontrados");
      }

      const planNombre = planResult[0].nombre;
      const provinciaNombre = provinciaResult[0].nombre;

      // 2. Normalizar nombres para rutas de archivos
      const planFolder =
        PLAN_MAPPING[planNombre] ||
        planNombre.toLowerCase().replace(/\s+/g, "-");
      const provinciaArchivo =
        PROVINCIA_MAPPING[provinciaNombre] || provinciaNombre;

      // 3. Obtener prestadores desde el stored procedure
      const [prestadores] = await connection.query(
        "CALL getCartillaPDF(?, ?)",
        [planNombre, provinciaNombre]
      );

      if (!prestadores[0].length) {
        throw new Error(
          "No se encontraron prestadores para la combinación especificada"
        );
      }

      // 4. Organizar prestadores por especialidad
      const prestadoresPorEspecialidad = prestadores[0].reduce(
        (acc, prestador) => {
          if (!acc[prestador.especialidad]) {
            acc[prestador.especialidad] = [];
          }
          acc[prestador.especialidad].push(prestador);
          return acc;
        },
        {}
      );

      // Ordenar especialidades alfabéticamente
      const especialidadesOrdenadas = Object.keys(
        prestadoresPorEspecialidad
      ).sort();

      // Ordenar prestadores por localidad dentro de cada especialidad
      for (const especialidad of especialidadesOrdenadas) {
        prestadoresPorEspecialidad[especialidad].sort((a, b) => {
          return a.localidad.localeCompare(b.localidad);
        });
      }

      // 5. Cargar la portada del PDF
      const portadaPath = path.join(
        __dirname,
        "..",
        "templates",
        planFolder,
        `${provinciaArchivo}.pdf`
      );

      const portadaExists = await fsPromises
        .access(portadaPath)
        .then(() => true)
        .catch(() => false);
      if (!portadaExists) {
        throw new Error(
          `No se encontró la portada para ${planNombre} - ${provinciaNombre}`
        );
      }

      const portadaBytes = await fsPromises.readFile(portadaPath);
      const pdfDoc = await PDFDocument.load(portadaBytes);

      // Registrar el plugin de fuentes
      pdfDoc.registerFontkit(fontkit);

      // Cargar una fuente estándar (opcional, mejora la compatibilidad)
      let font;
      try {
        const fontBytes = await fsPromises.readFile(
          path.join(__dirname, "..", "/fonts", "WorkSans-Regular.ttf")
        );
        font = await pdfDoc.embedFont(fontBytes);
      } catch (e) {
        console.warn(
          "No se pudo cargar fuente personalizada, usando fuentes estándar"
        );
        font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }

      // 6. Crear página de índice de especialidades (segunda página)
      const pageWidth = 595; // Ancho A4 en puntos
      const pageHeight = 842; // Alto A4 en puntos
      const margin = {
        top: 70,
        bottom: 70,
        left: 50,
        right: 50,
      };

      let currentIndexPage = pdfDoc.insertPage(1, [pageWidth, pageHeight]);
      let yPosition = pageHeight - margin.top;
      let pageCount = 2; // Empezamos después de la portada (0) e índice (1)
      const indexEntries = [];

      // Título del índice centrado
      const indexTitle = "Índice de Especialidades";
      const indexTitleWidth = font.widthOfTextAtSize(indexTitle, 20);
      currentIndexPage.drawText(indexTitle, {
        x: (pageWidth - indexTitleWidth) / 2,
        y: yPosition,
        size: 20,
        font,
        color: rgb(0, 0, 0),
      });

      yPosition -= 40; // Espacio después del título

      // Función para agregar nueva página de índice si es necesario
      const addNewIndexPage = () => {
        currentIndexPage = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin.top;
      };

      // Crear un mapa de especialidad -> número
      const especialidadNumeros = {};
      especialidadesOrdenadas.forEach((especialidad, index) => {
        especialidadNumeros[especialidad] = index + 1;
      });

      for (const especialidad of especialidadesOrdenadas) {
        // Verificar si necesitamos nueva página de índice
        if (yPosition < margin.bottom + 30) {
          // 30 es espacio mínimo para nueva entrada
          addNewIndexPage();
        }

        // Número de especialidad y texto completo
        const especialidadNum = especialidadNumeros[especialidad];
        const numeradaEspecialidad = `${especialidadNum}. ${especialidad}`;
        const especialidadWidth = font.widthOfTextAtSize(numeradaEspecialidad, 12);
        
        // Dibujar texto alineado a la izquierda (usando margin.left)
        currentIndexPage.drawText(numeradaEspecialidad, {
          x: margin.left,
          y: yPosition,
          size: 12,
          font,
        });

        // Guardar posición y destino del enlace
        const entryWidth = font.widthOfTextAtSize(numeradaEspecialidad, 12);
        indexEntries.push({
          bounds: {
            x: margin.left,
            y: yPosition - 10,
            width: entryWidth,
            height: 15,
          },
          pageIndex: pageCount - 1, // Ajustar porque insertPage cuenta diferente
        });

        // Calcular cuántas páginas ocupará esta especialidad
        const prestadoresCount =
          prestadoresPorEspecialidad[especialidad].length;
        const pagesNeeded = Math.ceil(prestadoresCount / 15);
        pageCount += pagesNeeded;

        yPosition -= 25;
      }

      // 7. Crear páginas para cada especialidad
      const pageRefs = {};
      const columnWidth = 120;
      const maxTextWidth = columnWidth - 10;
      const lineHeight = 12;
      const rowSpacing = 5; // Espacio adicional entre filas

      // Función para dividir texto con espaciado (la movemos fuera del loop)
      const splitTextToFit = (text, maxWidth, fontSize, font) => {
        if (!text) return [""];
        const words = text.split(" ");
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const testLine = currentLine + " " + word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (testWidth <= maxWidth) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        lines.push(currentLine);
        return lines;
      };

      for (const especialidad of especialidadesOrdenadas) {
        const prestadores = prestadoresPorEspecialidad[especialidad];
        let currentPage;
        let prestadoresInPage = 0;
        let currentY = pageHeight - margin.top;
        const tableWidth = columnWidth * 4;
        const tableStartX = (pageWidth - tableWidth) / 2; // Declarado una sola vez aquí

        for (let i = 0; i < prestadores.length; i++) {
          if (prestadoresInPage === 0 || currentY <= margin.bottom) {
            // Crear nueva página si no hay espacio suficiente
            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            const pageIndex = pdfDoc.getPageCount() - 1;
            pageRefs[especialidad] = pageRefs[especialidad] || [];
            pageRefs[especialidad].push(pageIndex);

            // Obtener el número de la especialidad
            const especialidadNum = especialidadNumeros[especialidad];
            // Título de la especialidad centrado con número
            const tituloNumerado = `${especialidadNum}. ${especialidad}`;
            const titleWidth = font.widthOfTextAtSize(tituloNumerado, 18);
            currentPage.drawText(tituloNumerado, {
              x: (pageWidth - titleWidth) / 2,
              y: currentY,
              size: 18,
              font,
              color: rgb(0, 0, 0),
            });

            currentY -= 30;

            // Encabezados de columna
            currentPage.drawText("PRESTADOR", {
              x: tableStartX,
              y: currentY,
              size: 10,
              font,
              color: rgb(0.3, 0.3, 0.3),
            });
            currentPage.drawText("LOCALIDAD", {
              x: tableStartX + columnWidth,
              y: currentY,
              size: 10,
              font,
              color: rgb(0.3, 0.3, 0.3),
            });
            currentPage.drawText("DIRECCIÓN", {
              x: tableStartX + columnWidth * 2,
              y: currentY,
              size: 10,
              font,
              color: rgb(0.3, 0.3, 0.3),
            });
            currentPage.drawText("TELÉFONO", {
              x: tableStartX + columnWidth * 3,
              y: currentY,
              size: 10,
              font,
              color: rgb(0.3, 0.3, 0.3),
            });

            // Línea divisoria
            currentPage.drawLine({
              start: { x: tableStartX, y: currentY - 5 },
              end: { x: tableStartX + tableWidth, y: currentY - 5 },
              thickness: 0.5,
              color: rgb(0.8, 0.8, 0.8),
            });

            currentY -= 20;
            prestadoresInPage = 0;
          }

          const prestador = prestadores[i];

          // Calcular altura necesaria para esta fila
          const nombreLines = splitTextToFit(
            prestador.nombre,
            maxTextWidth,
            9,
            font
          );
          const localidadLines = splitTextToFit(
            prestador.localidad,
            maxTextWidth,
            9,
            font
          );
          const direccionLines = splitTextToFit(
            prestador.direccion,
            maxTextWidth,
            9,
            font
          );
          const telefonoLines = splitTextToFit(
            prestador.telefonos,
            maxTextWidth,
            9,
            font
          );
          const maxLines = Math.max(
            nombreLines.length,
            direccionLines.length,
            localidadLines.length,
            telefonoLines.length,
            1
          );
          const rowNeededHeight = maxLines * lineHeight + rowSpacing;

          // Verificar espacio en página
          if (currentY - rowNeededHeight < margin.bottom) {
            // Crear nueva página (código similar al anterior)
            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            const pageIndex = pdfDoc.getPageCount() - 1;
            pageRefs[especialidad].push(pageIndex);

            currentY = pageHeight - margin.top;
            prestadoresInPage = 0;

            // Título de la especialidad en la nueva página con número
            // const especialidadNum = especialidadNumeros[especialidad];
            // const tituloNumerado = `${especialidadNum}. ${especialidad}`;
            // const titleWidth = font.widthOfTextAtSize(tituloNumerado, 18);
            // currentPage.drawText(tituloNumerado, {
            //   x: (pageWidth - titleWidth) / 2,
            //   y: currentY,
            //   size: 18,
            //   font,
            //   color: rgb(0, 0, 0),
            // });

            currentY -= 30;

            // Encabezados de columna
            currentPage.drawText("PRESTADOR", {
              x: tableStartX,
              y: currentY,
              size: 10,
              font,
              color: rgb(0.3, 0.3, 0.3),
            });
            currentPage.drawText("LOCALIDAD", {
              x: tableStartX + columnWidth,
              y: currentY,
              size: 10,
              font,
              color: rgb(0.3, 0.3, 0.3),
            });
            currentPage.drawText("DIRECCIÓN", {
              x: tableStartX + columnWidth * 2,
              y: currentY,
              size: 10,
              font,
              color: rgb(0.3, 0.3, 0.3),
            });
            currentPage.drawText("TELÉFONO", {
              x: tableStartX + columnWidth * 3,
              y: currentY,
              size: 10,
              font,
              color: rgb(0.3, 0.3, 0.3),
            });

            // Línea divisoria
            currentPage.drawLine({
              start: { x: tableStartX, y: currentY - 5 },
              end: { x: tableStartX + tableWidth, y: currentY - 5 },
              thickness: 0.5,
              color: rgb(0.8, 0.8, 0.8),
            });

            currentY -= 20;
          }

          // Dibujar contenido de la fila
          nombreLines.forEach((line, idx) => {
            currentPage.drawText(line, {
              x: tableStartX,
              y: currentY - idx * lineHeight,
              size: 9,
              font,
              maxWidth: maxTextWidth,
            });
          });

          localidadLines.forEach((line, idx) => {
            currentPage.drawText(line, {
              x: tableStartX + columnWidth,
              y: currentY - idx * lineHeight,
              size: 9,
              font,
              maxWidth: maxTextWidth,
            });
          });

          direccionLines.forEach((line, idx) => {
            currentPage.drawText(line, {
              x: tableStartX + columnWidth * 2,
              y: currentY - idx * lineHeight,
              size: 9,
              font,
              maxWidth: maxTextWidth,
            });
          });

          telefonoLines.forEach((line, idx) => {
            currentPage.drawText(line, {
              x: tableStartX + columnWidth * 3,
              y: currentY - idx * lineHeight,
              size: 9,
              font,
              maxWidth: maxTextWidth,
            });
          });

          currentY -= rowNeededHeight;
          prestadoresInPage++;
        }
      }

      // 8. Guardar el PDF final
      const pdfBytes = await pdfDoc.save();
      await connection.commit();

      const nombreArchivo = `${planNombre} - ${provinciaArchivo}.pdf`;

      // 9. Devolver el PDF y el nombre del archivo
      return {
        pdfBytes,
        nombreArchivo,
      };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error("Error en downloadCartillaPDF:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  },
};

module.exports = PrestadorRepository;
