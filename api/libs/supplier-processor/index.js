// libs/prestador-manager/index.js
/**
 * Prestador Manager Library
 * Maneja operaciones complejas de entidades médicas
 */

class SupplierProcessor {
  constructor(pool, abmRepository) {
    this.pool = pool;
    this.abmRepository = abmRepository;
  }

  /**
   * Crea una entidad completa con todas sus relaciones (createPrestadorCompleto)
   * @async
   * @param {Object} entityData - Datos de la entidad
   * @returns {Promise<Object>} - Resultado de la creación
   */
  async processCompleteEntityCreation(entityData) {
    let connection;
    try {
      connection = await this.pool.getConnection();
      await connection.beginTransaction();

      console.log("🔄 Procesando creación completa de entidad:", entityData);

      // Validaciones iniciales
      if (!entityData.nombre) {
        throw new Error("El nombre de la entidad es requerido");
      }

      if (!entityData.planes || !Array.isArray(entityData.planes) || entityData.planes.length === 0) {
        throw new Error("Debe especificar al menos un plan");
      }

      if (!entityData.especialidades || !Array.isArray(entityData.especialidades) || entityData.especialidades.length === 0) {
        throw new Error("Debe especificar al menos una especialidad");
      }

      console.log(`📋 Validaciones superadas para: ${entityData.nombre}`);

      // 1. Obtener datos comunes (localidad, provincia, categorías, etc.)
      const [localidad] = await connection.query(
        `SELECT nombre, id_provincia FROM localidades WHERE id_localidad = ?`,
        [entityData.id_localidad]
      );

      const [provincia] = await connection.query(
        `SELECT nombre FROM provincias WHERE id_provincia = ?`,
        [localidad[0].id_provincia]
      );

      const [categorias] = await connection.query(
        `SELECT nombre FROM categorias_prestador WHERE id_categoria IN (?)`,
        [entityData.categorias]
      );

      const [especialidades] = await connection.query(
        `SELECT id_especialidad, nombre FROM especialidades WHERE id_especialidad IN (?)`,
        [entityData.especialidades]
      );

      const [planes] = await connection.query(
        `SELECT id_plan, nombre FROM planes WHERE id_plan IN (?)`,
        [entityData.planes]
      );

      console.log(`🏥 Datos obtenidos: ${especialidades.length} especialidades, ${planes.length} planes`);

      const categoriasStr = categorias.map((c) => c.nombre).join(", ");
      const resultados = [];

      // 2. Procesar cada combinación plan × especialidad
      for (const plan of planes) {
        for (const especialidad of especialidades) {
          console.log(`   📝 Procesando: ${plan.nombre} x ${especialidad.nombre}`);

          // Crear nueva entidad PARA CADA COMBINACIÓN
          const newEntity = await this.abmRepository.create("prestadores", {
            nombre: entityData.nombre,
            direccion: entityData.direccion,
            telefonos: entityData.telefonos,
            email: entityData.email,
            atencion_virtual: entityData.atencion_virtual,
            informacion_adicional: entityData.informacion_adicional,
            id_localidad: entityData.id_localidad,
            estado: entityData.estado || "Activo",
          });

          const idEntity = newEntity.insertId;
          console.log(`      ✅ Entidad creada con ID: ${idEntity}`);

          // Crear registro en cartilla
          await this.abmRepository.create("cartilla", {
            id_prestador: idEntity,
            nombre_prestador: entityData.nombre,
            direccion: entityData.direccion,
            telefonos: entityData.telefonos,
            email: entityData.email,
            atencion_virtual: entityData.atencion_virtual,
            informacion_adicional: entityData.informacion_adicional,
            localidad: localidad[0].nombre,
            provincia: provincia[0].nombre,
            categoria_prestador: categoriasStr,
            especialidad: especialidad.nombre,
            plan: plan.nombre,
            estado: entityData.estado || "Activo",
          });

          // Insertar relaciones (categorías, especialidades, planes)
          const insertRelations = async (table, field, values) => {
            if (!Array.isArray(values) || values.length === 0) return;

            const relations = values.map((id) => [idEntity, id]);
            await connection.query(
              `INSERT INTO ${table} (id_prestador, ${field}) VALUES ?`,
              [relations]
            );
          };

          // Para esta entidad específica:
          await insertRelations(
            "prestador_categoria",
            "id_categoria",
            entityData.categorias
          );
          await insertRelations("prestador_especialidad", "id_especialidad", [
            especialidad.id_especialidad,
          ]); // Solo la especialidad actual
          await insertRelations("prestador_plan", "id_plan", [plan.id_plan]); // Solo el plan actual

          resultados.push({
            id_prestador: idEntity,
            plan: plan.nombre,
            especialidad: especialidad.nombre,
          });
        }
      }

      await connection.commit();

      console.log(`🎉 Proceso completado: ${resultados.length} registros creados`);

      return {
        success: true,
        registros_creados: resultados,
        total: resultados.length,
      };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error("❌ Error en processCompleteEntityCreation:", error);
      throw new Error("Error creating complete entity");
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Actualiza una entidad existente con datos completos (updatePrestador)
   * @async
   * @param {number} id - ID de la entidad a actualizar
   * @param {Object} entityData - Nuevos datos de la entidad
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con los datos completos actualizados
   */
  async executeCompleteEntityUpdate(id, entityData) {
    let connection;
    try {
      connection = await this.pool.getConnection();
      await connection.beginTransaction();

      console.log(`🔄 Ejecutando actualización completa para entidad ID: ${id}`);

      // Filtrar datos de la entidad
      const entityDataFiltered = {};
      const relationsToUpdate = {
        categorias: entityData.categorias,
        especialidades: entityData.especialidades,
        planes: entityData.planes,
      };

      Object.entries(entityData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (
            key === "categorias" ||
            key === "especialidades" ||
            key === "planes"
          )
            return;
          entityDataFiltered[key] = value;
        }
      });

      console.log(`📝 Campos a actualizar: ${Object.keys(entityDataFiltered).join(', ')}`);

      // 1. Actualizar la entidad principal
      if (Object.keys(entityDataFiltered).length > 0) {
        await this.abmRepository.update(
          "prestadores",
          "id_prestador",
          id,
          entityDataFiltered
        );
        console.log(`   ✅ Entidad principal actualizada`);
      }

      // 2. Actualizar la cartilla - Mapear los campos correctamente
      if (Object.keys(entityDataFiltered).length > 0) {
        // Crear un objeto con los campos mapeados para la tabla cartilla
        const cartillaDataFiltered = {};

        // Mapeo de campos entre prestadores y cartilla
        const fieldMapping = {
          nombre: "nombre_prestador",
          direccion: "direccion",
          telefonos: "telefonos",
          email: "email",
          atencion_virtual: "atencion_virtual",
          informacion_adicional: "informacion_adicional",
          estado: "estado",
        };

        // Crear objeto con campos mapeados correctamente
        Object.entries(entityDataFiltered).forEach(([key, value]) => {
          if (fieldMapping[key]) {
            cartillaDataFiltered[fieldMapping[key]] = value;
          }
        });

        // Solo actualizar si hay campos para actualizar
        if (Object.keys(cartillaDataFiltered).length > 0) {
          await this.abmRepository.update(
            "cartilla",
            "id_prestador",
            id,
            cartillaDataFiltered
          );
          console.log(`   ✅ Cartilla actualizada`);
        }
      }

      // 3. Actualizar relaciones
      await this._updateEntityRelations(connection, id, relationsToUpdate);

      // 4. Obtener datos completos de la entidad actualizada para la respuesta
      const updatedEntity = await this._getCompleteEntityData(connection, id);

      await connection.commit();

      console.log(`🎉 Actualización completa finalizada para entidad ID: ${id}`);

      return {
        id,
        success: true,
        prestador: updatedEntity,
      };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error("❌ Error en executeCompleteEntityUpdate:", error);
      throw new Error("Error al actualizar entidad completa");
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Actualiza las relaciones de una entidad
   * @private
   */
  async _updateEntityRelations(connection, id, relationsToUpdate) {
    // Para cada tipo de relación, verificar si se proporcionaron datos nuevos
    if (relationsToUpdate.categorias !== undefined) {
      console.log(`   🔗 Actualizando categorías: ${relationsToUpdate.categorias?.length || 0} elementos`);
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
      console.log(`   🔗 Actualizando especialidades: ${relationsToUpdate.especialidades?.length || 0} elementos`);
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
      console.log(`   🔗 Actualizando planes: ${relationsToUpdate.planes?.length || 0} elementos`);
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
    await this._updateCartillaRelations(connection, id, relationsToUpdate);
  }

  /**
   * Actualiza las relaciones en la tabla cartilla
   * @private
   */
  async _updateCartillaRelations(connection, id, relationsToUpdate) {
    if (
      relationsToUpdate.categorias !== undefined ||
      relationsToUpdate.especialidades !== undefined ||
      relationsToUpdate.planes !== undefined
    ) {
      console.log(`   📋 Actualizando información de cartilla`);

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
        console.log(`      ✅ Cartilla actualizada con nuevas relaciones`);
      }
    }
  }

  /**
   * Obtiene datos completos de una entidad para la respuesta
   * @private
   */
  async _getCompleteEntityData(connection, id) {
    console.log(`   📊 Obteniendo datos completos de entidad ID: ${id}`);

    const [entityResult] = await connection.query(
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

    return {
      ...entityResult[0],
      categorias: categoriasResult,
      especialidades: especialidadesResult,
      planes: planesResult,
    };
  }

  /**
   * Cambia el estado de una entidad por nombre
   * @async
   * @param {string} nombre - Nombre de la entidad
   * @param {string} estado - Nuevo estado
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async modifyEntityStatusByName(nombre, estado) {
    let connection;
    try {
      connection = await this.pool.getConnection();
      await connection.beginTransaction();

      console.log(`🔄 Modificando estado de entidad: ${nombre} → ${estado}`);

      // Validar estado
      if (!["Activo", "Inactivo"].includes(estado)) {
        throw new Error('El estado debe ser "Activo" o "Inactivo"');
      }

      // Actualizar en prestadores
      await this.abmRepository.updateByName("prestadores", "nombre", nombre, {
        estado,
      });

      // Actualizar en cartilla (ajusta el campo nombre según tu esquema)
      await this.abmRepository.updateByName("cartilla", "nombre_prestador", nombre, {
        estado,
      });

      await connection.commit();

      console.log(`✅ Estado modificado exitosamente: ${nombre} → ${estado}`);

      return { success: true, nombre, estado };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error("❌ Error al cambiar estado de la entidad:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Da de baja una entidad cambiando su estado a 'Inactivo'
   * @async
   * @param {number} id - ID de la entidad
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el resultado de la operación
   */
  async deactivateEntityById(id) {
    try {
      console.log(`🔄 Desactivando entidad ID: ${id}`);

      await this.abmRepository.update("prestadores", "id_prestador", id, {
        estado: "Inactivo",
      });

      await this.abmRepository.update("cartilla", "id_prestador", id, {
        estado: "Inactivo",
      });

      console.log(`✅ Entidad desactivada exitosamente: ID ${id}`);

      return { id, success: true };
    } catch (error) {
      console.error("❌ Error en desactivación de entidad:", error);
      throw new Error("Error en desactivación de entidad");
    }
  }
}

module.exports = SupplierProcessor;