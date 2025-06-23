// libs/abm-operations/index.js
/**
 * ABM Operations Library
 * Maneja todas las operaciones CRUD genéricas y avanzadas
 */

class DataOperationsManager {
  constructor(pool) {
    this.pool = pool;

    // Tablas permitidas para seguridad
    this.ALLOWED_TABLES = {
      'planes': 'planes',
      'especialidades': 'especialidades',
      'categorias_prestador': 'categorias_prestador',
      'categorias': 'categorias_prestador',
      'provincias': 'provincias',
      'localidades': 'localidades',
      'prestadores': 'prestadores',
      'cartilla': 'cartilla',
      'prestador_categoria': 'prestador_categoria',
      'prestador_especialidad': 'prestador_especialidad',
      'prestador_plan': 'prestador_plan',
      'users': 'users'
    };

    // Campos permitidos para seguridad
    this.ALLOWED_FIELDS = {
      'id_plan': 'id_plan',
      'id_especialidad': 'id_especialidad',
      'id_categoria': 'id_categoria',
      'id_provincia': 'id_provincia',
      'id_localidad': 'id_localidad',
      'id_prestador': 'id_prestador',
      'id_user': 'id_user',
      'nombre': 'nombre',
      'estado': 'estado',
      'orden': 'orden',
      'descripcion': 'descripcion',
      'email': 'email',
      'telefono': 'telefono',
      'direccion': 'direccion',
      'telefonos': 'telefonos',
      'informacion_adicional': 'informacion_adicional',
      'atencion_virtual': 'atencion_virtual'
    };
  }

  /**
   * Valida que una tabla sea permitida
   * @private
   */
  validateTable(table) {
    if (!this.ALLOWED_TABLES[table]) {
      throw new Error('Tabla no permitida');
    }
    return this.ALLOWED_TABLES[table];
  }

  /**
   * Valida que un campo sea permitido
   * @private
   */
  validateField(field) {
    if (!this.ALLOWED_FIELDS[field]) {
      throw new Error('Campo no permitido');
    }
    return this.ALLOWED_FIELDS[field];
  }

  /**
   * Ejecuta una consulta SQL con parámetros de forma segura
   * @async
   * @param {string} query - Consulta SQL
   * @param {Array} [params=[]] - Parámetros para la consulta
   * @returns {Promise<Array>} - Resultado de la consulta
   */
  async executeSecureQuery(query, params = []) {
    try {
      console.log(`🔍 Ejecutando consulta: ${query.substring(0, 100)}...`);
      return await this.pool.query(query, params);
    } catch (error) {
      console.error(`❌ Error en consulta SQL:`, error);
      throw error;
    }
  }

  /**
   * Obtiene todos los registros de una tabla con paginación opcional
   * @async
   * @param {string} table - Nombre de la tabla
   * @param {string} [idField] - Campo ID (opcional)
   * @param {number} [page] - Página actual (opcional)
   * @param {number} [limit] - Registros por página (opcional)
   * @param {string} [orderBy] - Campo para ordenamiento (opcional)
   * @param {string} [orderDirection='ASC'] - Dirección del ordenamiento
   * @returns {Promise<Array|Object>} - Array de registros o objeto con paginación
   */
  async retrieveAllRecords(table, idField = null, page = null, limit = null, orderBy = null, orderDirection = 'ASC') {
    const safeTable = this.validateTable(table);

    console.log(`📋 Obteniendo todos los registros de: ${safeTable}`);

    // Si no hay paginación, devolver todos los registros
    if (!page || !limit) {
      let query = `SELECT * FROM ${safeTable}`;

      if (orderBy) {
        const safeOrderBy = this.validateField(orderBy);
        query += ` ORDER BY ${safeOrderBy} ${orderDirection}`;
      } else if (idField) {
        const safeIdField = this.validateField(idField);
        query += ` ORDER BY ${safeIdField} ASC`;
      }

      const [rows] = await this.executeSecureQuery(query);
      console.log(`   ✅ Obtenidos ${rows.length} registros`);
      return rows;
    }

    // Con paginación
    const offset = (page - 1) * limit;

    // Contar total de registros
    const [countResult] = await this.executeSecureQuery(`SELECT COUNT(*) as total FROM ${safeTable}`);
    const totalItems = countResult[0].total || 0;

    // Obtener registros paginados
    let query = `SELECT * FROM ${safeTable}`;

    if (orderBy) {
      const safeOrderBy = this.validateField(orderBy);
      query += ` ORDER BY ${safeOrderBy} ${orderDirection}`;
    } else if (idField) {
      const safeIdField = this.validateField(idField);
      query += ` ORDER BY ${safeIdField} ASC`;
    }

    query += ` LIMIT ? OFFSET ?`;

    const [rows] = await this.executeSecureQuery(query, [limit, offset]);

    const totalPages = Math.ceil(totalItems / limit);

    console.log(`   ✅ Página ${page}/${totalPages}: ${rows.length} registros`);

    return {
      items: rows,
      pagination: {
        totalItems,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Obtiene un registro por su ID
   * @async
   * @param {string} table - Nombre de la tabla
   * @param {string} idField - Nombre del campo ID
   * @param {number|string} id - Valor del ID
   * @returns {Promise<Object|null>} - Registro encontrado o null
   */
  async retrieveRecordById(table, idField, id) {
    const safeTable = this.validateTable(table);
    const safeField = this.validateField(idField);

    console.log(`🔍 Buscando registro en ${safeTable} con ${safeField} = ${id}`);

    const [rows] = await this.executeSecureQuery(`SELECT * FROM ${safeTable} WHERE ${safeField} = ?`, [id]);
    const record = rows[0] || null;

    console.log(`   ${record ? '✅ Registro encontrado' : '❌ Registro no encontrado'}`);

    return record;
  }

  /**
   * Obtiene registros por nombre
   * @async
   * @param {string} table - Nombre de la tabla
   * @param {string} nameField - Campo nombre
   * @param {string} name - Nombre a buscar
   * @returns {Promise<Array>} - Registros encontrados
   */
  async retrieveRecordsByName(table, nameField, name) {
    const safeTable = this.validateTable(table);
    const safeField = this.validateField(nameField);

    console.log(`🔍 Buscando registros en ${safeTable} con ${safeField} = "${name}"`);

    const [rows] = await this.executeSecureQuery(`SELECT * FROM ${safeTable} WHERE ${safeField} = ?`, [name]);

    console.log(`   ✅ Encontrados ${rows.length} registros`);

    return rows;
  }

  /**
   * Crea un nuevo registro
   * @async
   * @param {string} table - Nombre de la tabla
   * @param {Object} data - Datos del nuevo registro
   * @returns {Promise<Object>} - Registro creado con su ID
   */
  async createNewRecord(table, data) {
    const safeTable = this.validateTable(table);

    console.log(`📝 Creando nuevo registro en ${safeTable}:`, data);

    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => '?').join(', ');

    const query = `INSERT INTO ${safeTable} (${fields.join(', ')}) VALUES (${placeholders})`;

    const [result] = await this.executeSecureQuery(query, values);

    console.log(`   ✅ Registro creado con ID: ${result.insertId}`);

    return {
      insertId: result.insertId,
      affectedRows: result.affectedRows,
      ...data
    };
  }

  /**
   * Actualiza un registro por ID
   * @async
   * @param {string} table - Nombre de la tabla
   * @param {string} idField - Campo ID
   * @param {number|string} id - ID del registro
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} - Resultado de la actualización
   */
  async updateRecordById(table, idField, id, data) {
    const safeTable = this.validateTable(table);
    const safeField = this.validateField(idField);

    console.log(`✏️ Actualizando registro en ${safeTable} con ${safeField} = ${id}:`, data);

    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map(field => `${field} = ?`).join(', ');

    const query = `UPDATE ${safeTable} SET ${setClause} WHERE ${safeField} = ?`;

    const [result] = await this.executeSecureQuery(query, [...values, id]);

    if (result.affectedRows === 0) {
      throw new Error('No se encontró el registro para actualizar');
    }

    console.log(`   ✅ Registro actualizado (${result.affectedRows} filas afectadas)`);

    return {
      affectedRows: result.affectedRows,
      ...data
    };
  }

  /**
   * Actualiza registros por nombre con cascada opcional
   * @async
   * @param {string} table - Nombre de la tabla
   * @param {string} nameField - Campo nombre
   * @param {string} name - Nombre del registro
   * @param {Object} data - Datos a actualizar
   * @param {string} [cartillaField] - Campo en cartilla para cascada
   * @returns {Promise<Object>} - Resultado de la actualización
   */
  async updateRecordsByName(table, nameField, name, data, cartillaField = null) {
    let connection;
    try {
      connection = await this.pool.getConnection();
      await connection.beginTransaction();

      const safeTable = this.validateTable(table);
      const safeField = this.validateField(nameField);

      console.log(`✏️ Actualizando por nombre en ${safeTable}: "${name}" → cascada: ${cartillaField ? 'SÍ' : 'NO'}`);

      const fields = Object.keys(data);
      const values = Object.values(data);
      const setClause = fields.map(field => `${field} = ?`).join(', ');

      const query = `UPDATE ${safeTable} SET ${setClause} WHERE ${safeField} = ?`;

      const [result] = await connection.query(query, [...values, name]);

      if (result.affectedRows === 0) {
        throw new Error('No se encontró el registro para actualizar');
      }

      // Actualización en cascada a cartilla si se especifica
      if (cartillaField && data[nameField]) {
        console.log(`   🔗 Actualizando cascada en cartilla: ${cartillaField}`);
        const cartillaQuery = `UPDATE cartilla SET ${cartillaField} = ? WHERE ${cartillaField} = ?`;
        await connection.query(cartillaQuery, [data[nameField], name]);
      }

      await connection.commit();

      console.log(`   ✅ Actualización completada (${result.affectedRows} filas afectadas)`);

      return {
        affectedRows: result.affectedRows,
        oldName: name,
        newName: data[nameField] || name,
        ...data
      };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error(`❌ Error en actualización por nombre:`, error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Elimina un registro por ID
   * @async
   * @param {string} table - Nombre de la tabla
   * @param {string} idField - Campo ID
   * @param {number|string} id - ID del registro
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async deleteRecordById(table, idField, id) {
    const safeTable = this.validateTable(table);
    const safeField = this.validateField(idField);

    console.log(`🗑️ Eliminando registro de ${safeTable} con ${safeField} = ${id}`);

    const query = `DELETE FROM ${safeTable} WHERE ${safeField} = ?`;

    const [result] = await this.executeSecureQuery(query, [id]);

    if (result.affectedRows === 0) {
      throw new Error('No se encontró el registro para eliminar');
    }

    console.log(`   ✅ Registro eliminado (${result.affectedRows} filas afectadas)`);

    return {
      affectedRows: result.affectedRows,
      deletedId: id
    };
  }

  /**
   * Verifica si un registro tiene relaciones en otras tablas
   * @async
   * @param {string} table - Nombre de la tabla
   * @param {number|string} id - ID del registro
   * @param {string} idField - Campo ID
   * @returns {Promise<boolean>} - true si tiene relaciones
   */
  async checkRecordRelations(table, id, idField) {
    console.log(`🔍 Verificando relaciones para ${table} ID: ${id}`);

    // Mapeo de tablas y sus relaciones
    const relationMaps = {
      'planes': [
        { table: 'cartilla', field: 'id_plan' },
        { table: 'prestador_plan', field: 'id_plan' }
      ],
      'especialidades': [
        { table: 'cartilla', field: 'id_especialidad' },
        { table: 'prestador_especialidad', field: 'id_especialidad' }
      ],
      'categorias_prestador': [
        { table: 'cartilla', field: 'id_categoria' },
        { table: 'prestador_categoria', field: 'id_categoria' }
      ],
      'provincias': [
        { table: 'cartilla', field: 'id_provincia' },
        { table: 'prestadores', field: 'id_provincia' }
      ],
      'localidades': [
        { table: 'cartilla', field: 'id_localidad' },
        { table: 'prestadores', field: 'id_localidad' }
      ],
      'prestadores': [
        { table: 'cartilla', field: 'id_prestador' },
        { table: 'prestador_plan', field: 'id_prestador' },
        { table: 'prestador_especialidad', field: 'id_prestador' },
        { table: 'prestador_categoria', field: 'id_prestador' }
      ]
    };

    const relations = relationMaps[table] || [];

    for (const relation of relations) {
      const [rows] = await this.executeSecureQuery(
        `SELECT COUNT(*) as count FROM ${relation.table} WHERE ${relation.field} = ?`,
        [id]
      );

      if (rows[0].count > 0) {
        console.log(`   ❗ Encontradas ${rows[0].count} relaciones en ${relation.table}`);
        return true;
      }
    }

    console.log(`   ✅ No se encontraron relaciones`);
    return false;
  }

  /**
   * Actualiza relaciones de un registro
   * @async
   * @param {string} table - Tabla de relaciones
   * @param {string} idField - Campo ID principal
   * @param {number|string} id - ID principal
   * @param {string} relationField - Campo de relación
   * @param {Array} values - Nuevos valores de relación
   * @returns {Promise<void>}
   */
  async updateRecordRelations(table, idField, id, relationField, values) {
    if (!Array.isArray(values)) return;

    const safeTable = this.validateTable(table);
    const safeIdField = this.validateField(idField);
    const safeRelationField = this.validateField(relationField);

    console.log(`🔗 Actualizando relaciones en ${safeTable}: ${values.length} elementos`);

    // Eliminar relaciones existentes
    await this.executeSecureQuery(
      `DELETE FROM ${safeTable} WHERE ${safeIdField} = ?`,
      [id]
    );

    // Insertar nuevas relaciones
    if (values.length > 0) {
      const relations = values.map(value => [id, value]);
      await this.executeSecureQuery(
        `INSERT INTO ${safeTable} (${safeIdField}, ${safeRelationField}) VALUES ?`,
        [relations]
      );
    }

    console.log(`   ✅ Relaciones actualizadas`);
  }

  /**
   * Alterna el estado de un registro con cascada
   * @async
   * @param {string} table - Nombre de la tabla
   * @param {string} idField - Campo ID
   * @param {number|string} id - ID del registro
   * @returns {Promise<Object>} - Resultado del cambio
   */
  async toggleRecordStatusWithCascade(table, idField, id) {
    let connection;
    try {
      connection = await this.pool.getConnection();
      await connection.beginTransaction();

      const safeTable = this.validateTable(table);
      const safeIdField = this.validateField(idField);

      console.log(`🔄 Alternando estado con cascada en ${safeTable} ID: ${id}`);

      // 1. Obtener el registro actual
      const [currentRecord] = await connection.query(
        `SELECT *, nombre FROM ${safeTable} WHERE ${safeIdField} = ?`,
        [id]
      );

      if (!currentRecord.length) {
        throw new Error('Registro no encontrado');
      }

      const record = currentRecord[0];
      const currentState = record.estado;
      const newState = currentState === 'Activo' ? 'Inactivo' : 'Activo';
      const recordName = record.nombre;

      console.log(`   Estado actual: ${currentState} → ${newState}`);

      // 2. Actualizar el registro principal
      await connection.query(
        `UPDATE ${safeTable} SET estado = ? WHERE ${safeIdField} = ?`,
        [newState, id]
      );

      // 3. Actualizar registros relacionados según la tabla
      await this._applyCascadeStatusUpdate(connection, table, id, recordName, newState);

      await connection.commit();

      console.log(`   ✅ Estado alternado exitosamente con cascada`);

      return {
        success: true,
        [idField]: id,
        previousStatus: currentState,
        newStatus: newState,
        affectedRecord: recordName
      };

    } catch (error) {
      if (connection) await connection.rollback();
      console.error(`❌ Error alternando estado:`, error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Aplica actualizaciones de estado en cascada
   * @private
   */
  async _applyCascadeStatusUpdate(connection, table, id, recordName, newState) {
    const cascadeRules = {
      'planes': [
        {
          table: 'cartilla',
          condition: 'plan = ?',
          action: 'UPDATE cartilla SET estado = ? WHERE plan = ?',
          value: recordName,
          newState: newState
        },
        {
          table: 'prestadores',
          condition: 'id_prestador IN (SELECT id_prestador FROM prestador_plan WHERE id_plan = ?)',
          action: 'UPDATE prestadores SET estado = ? WHERE id_prestador IN (SELECT id_prestador FROM prestador_plan WHERE id_plan = ?)',
          value: id,
          newState: newState
        }
      ],
      'categorias_prestador': [
        {
          table: 'cartilla',
          condition: 'categoria = ?',
          action: 'UPDATE cartilla SET estado = ? WHERE categoria_prestador = ?',
          value: recordName,
          newState: newState
        }
      ],
      'especialidades': [
        {
          table: 'cartilla',
          condition: 'especialidad = ?',
          action: 'UPDATE cartilla SET estado = ? WHERE especialidad = ?',
          value: recordName,
          newState: newState
        }
      ],
      'provincias': [
        {
          table: 'cartilla',
          condition: 'provincia = (SELECT nombre FROM provincias WHERE id_provincia = ?)',
          action: 'UPDATE cartilla SET estado = ? WHERE provincia = (SELECT nombre FROM provincias WHERE id_provincia = ?)',
          value: id,
          newState: newState
        }
      ],
      'localidades': [
        {
          table: 'cartilla',
          condition: 'localidad = (SELECT nombre FROM localidades WHERE id_localidad = ?)',
          action: 'UPDATE cartilla SET estado = ? WHERE localidad = (SELECT nombre FROM localidades WHERE id_localidad = ?)',
          value: id,
          newState: newState
        }
      ]
    };

    const rules = cascadeRules[table] || [];

    for (const rule of rules) {
      console.log(`   🔗 Aplicando cascada en ${rule.table}`);
      await connection.query(rule.action, [newState, rule.value]);
    }
  }

  /**
   * Obtiene localidades por provincia
   * @async
   * @param {number|string} provinciaId - ID de la provincia
   * @returns {Promise<Array>} - Array de localidades
   */
  async retrieveLocalitiesByProvince(provinciaId) {
    console.log(`🏘️ Obteniendo localidades para provincia ID: ${provinciaId}`);

    const [rows] = await this.executeSecureQuery(
      `SELECT id_localidad, nombre, estado FROM localidades WHERE id_provincia = ? ORDER BY nombre ASC`,
      [provinciaId]
    );

    console.log(`   ✅ Encontradas ${rows.length} localidades`);

    return rows;
  }

  /**
   * Actualiza el orden de registros en lote
   * @async
   * @param {string} table - Nombre de la tabla
   * @param {string} idField - Campo ID
   * @param {Array} orders - Array con [{id: 1, orden: 1}, ...]
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async updateBulkRecordOrder(table, idField, orders) {
    let connection;
    try {
      connection = await this.pool.getConnection();
      await connection.beginTransaction();

      const safeTable = this.validateTable(table);
      const safeIdField = this.validateField(idField);

      console.log(`📊 Actualizando orden en lote para ${safeTable}: ${orders.length} registros`);

      for (const order of orders) {
        const id = order[idField];
        const newOrder = order.orden;

        await connection.query(
          `UPDATE ${safeTable} SET orden = ? WHERE ${safeIdField} = ?`,
          [newOrder, id]
        );
      }

      await connection.commit();

      console.log(`   ✅ Orden actualizado exitosamente`);

      return {
        success: true,
        updated: orders.length,
        table: safeTable
      };

    } catch (error) {
      if (connection) await connection.rollback();
      console.error(`❌ Error actualizando orden en lote:`, error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Obtiene registros filtrados con paginación
   * @async
   * @param {string} table - Nombre de la tabla
   * @param {Object} filters - Filtros a aplicar
   * @param {number} [page=1] - Página actual
   * @param {number} [limit=10] - Registros por página
   * @param {string} [orderBy] - Campo para ordenamiento
   * @param {string} [orderDirection='ASC'] - Dirección del ordenamiento
   * @returns {Promise<Object>} - Resultado con paginación
   */
  async retrieveFilteredRecords(table, filters = {}, page = 1, limit = 10, orderBy = null, orderDirection = 'ASC') {
    const safeTable = this.validateTable(table);
    const offset = (page - 1) * limit;

    console.log(`🔍 Obteniendo registros filtrados de ${safeTable}:`, filters);

    // Construir WHERE clause
    const filterKeys = Object.keys(filters);
    let whereClause = '';
    let filterValues = [];

    if (filterKeys.length > 0) {
      const conditions = filterKeys.map(key => {
        if (filters[key] === null) {
          return `${key} IS NULL`;
        } else if (typeof filters[key] === 'string' && filters[key].includes('%')) {
          return `${key} LIKE ?`;
        } else {
          return `${key} = ?`;
        }
      });

      whereClause = ` WHERE ${conditions.join(' AND ')}`;
      filterValues = filterKeys.map(key => filters[key]).filter(val => val !== null);
    }

    // Contar total de registros filtrados
    const countQuery = `SELECT COUNT(*) as total FROM ${safeTable}${whereClause}`;
    const [countResult] = await this.executeSecureQuery(countQuery, filterValues);
    const totalItems = countResult[0].total || 0;

    // Obtener registros filtrados
    let query = `SELECT * FROM ${safeTable}${whereClause}`;

    if (orderBy) {
      const safeOrderBy = this.validateField(orderBy);
      query += ` ORDER BY ${safeOrderBy} ${orderDirection}`;
    }

    query += ` LIMIT ? OFFSET ?`;

    const [rows] = await this.executeSecureQuery(query, [...filterValues, limit, offset]);

    const totalPages = Math.ceil(totalItems / limit);

    console.log(`   ✅ Filtrados: ${rows.length}/${totalItems} registros`);

    return {
      items: rows,
      pagination: {
        totalItems,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      appliedFilters: filters
    };
  }

  /**
   * Ejecuta operaciones en lote (insert, update, delete)
   * @async
   * @param {string} operation - Tipo de operación
   * @param {string} table - Nombre de la tabla
   * @param {Array} data - Array de datos
   * @param {string} [idField] - Campo ID (para update/delete)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async executeBatchOperation(operation, table, data, idField = null) {
    let connection;
    try {
      connection = await this.pool.getConnection();
      await connection.beginTransaction();

      const safeTable = this.validateTable(table);

      console.log(`📦 Ejecutando operación en lote: ${operation} en ${safeTable} (${data.length} elementos)`);

      let results = [];
      let successCount = 0;
      let errorCount = 0;

      for (const item of data) {
        try {
          let result;

          switch (operation) {
            case 'insert':
              const fields = Object.keys(item);
              const values = Object.values(item);
              const placeholders = fields.map(() => '?').join(', ');
              const insertQuery = `INSERT INTO ${safeTable} (${fields.join(', ')}) VALUES (${placeholders})`;

              [result] = await connection.query(insertQuery, values);
              results.push({ success: true, insertId: result.insertId, data: item });
              successCount++;
              break;

            case 'update':
              if (!idField || !item[idField]) {
                throw new Error('Campo ID requerido para operación de actualización');
              }

              const updateData = { ...item };
              delete updateData[idField];

              const updateFields = Object.keys(updateData);
              const updateValues = Object.values(updateData);
              const setClause = updateFields.map(field => `${field} = ?`).join(', ');
              const updateQuery = `UPDATE ${safeTable} SET ${setClause} WHERE ${idField} = ?`;

              [result] = await connection.query(updateQuery, [...updateValues, item[idField]]);
              results.push({ success: true, affectedRows: result.affectedRows, data: item });
              successCount++;
              break;

            case 'delete':
              if (!idField || !item[idField]) {
                throw new Error('Campo ID requerido para operación de eliminación');
              }

              const deleteQuery = `DELETE FROM ${safeTable} WHERE ${idField} = ?`;
              [result] = await connection.query(deleteQuery, [item[idField]]);
              results.push({ success: true, affectedRows: result.affectedRows, data: item });
              successCount++;
              break;

            default:
              throw new Error(`Operación en lote no soportada: ${operation}`);
          }
        } catch (itemError) {
          results.push({ success: false, error: itemError.message, data: item });
          errorCount++;
        }
      }

      await connection.commit();

      console.log(`   ✅ Operación en lote completada: ${successCount} exitosas, ${errorCount} fallidas`);

      return {
        totalProcessed: data.length,
        successful: successCount,
        failed: errorCount,
        results
      };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error(`❌ Error en operación en lote:`, error);
      throw new Error(`Error en operación ${operation}: ${error.message}`);
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Ejecuta una consulta SQL personalizada
   * @async
   * @param {string} query - Consulta SQL
   * @param {Array} [params=[]] - Parámetros de la consulta
   * @returns {Promise<Array>} - Resultados de la consulta
   */
  async executeCustomQuery(query, params = []) {
    console.log(`⚙️ Ejecutando consulta personalizada`);

    try {
      const [rows] = await this.executeSecureQuery(query, params);

      console.log(`   ✅ Consulta ejecutada: ${rows.length} resultados`);

      return rows;
    } catch (error) {
      console.error('❌ Error en consulta personalizada:', error);
      throw new Error(`Error ejecutando consulta personalizada: ${error.message}`);
    }
  }

  /**
   * Obtiene estadísticas de una tabla
   * @async
   * @param {string} table - Nombre de la tabla
   * @param {string} [groupBy] - Campo para agrupar
   * @returns {Promise<Object>} - Estadísticas de la tabla
   */
  async retrieveTableStatistics(table, groupBy = null) {
    const safeTable = this.validateTable(table);

    console.log(`📈 Obteniendo estadísticas de ${safeTable}`);

    try {
      // Contar total de registros
      const [totalCount] = await this.executeSecureQuery(`SELECT COUNT(*) as total FROM ${safeTable}`);

      let stats = {
        totalRecords: totalCount[0].total,
        tableName: safeTable
      };

      // Si hay campo para agrupar
      if (groupBy) {
        const safeGroupBy = this.validateField(groupBy);
        const [groupedResults] = await this.executeSecureQuery(
          `SELECT ${safeGroupBy}, COUNT(*) as count FROM ${safeTable} GROUP BY ${safeGroupBy} ORDER BY count DESC`
        );
        stats.groupedBy = groupBy;
        stats.groups = groupedResults;
      }

      // Obtener información de estado si existe la columna
      try {
        const [statusCount] = await this.executeSecureQuery(
          `SELECT estado, COUNT(*) as count FROM ${safeTable} GROUP BY estado`
        );
        stats.byStatus = statusCount;
      } catch (statusError) {
        // La tabla no tiene columna estado
      }

      console.log(`   ✅ Estadísticas obtenidas: ${stats.totalRecords} registros totales`);

      return stats;
    } catch (error) {
      console.error(`❌ Error obteniendo estadísticas:`, error);
      throw new Error(`Error obteniendo estadísticas para ${safeTable}`);
    }
  }

  /**
   * Valida la integridad de datos antes de operaciones críticas
   * @async
   * @param {string} table - Nombre de la tabla
   * @param {Object} data - Datos a validar
   * @returns {Promise<Object>} - Resultado de la validación
   */
  async validateDataIntegrity(table, data) {
    const safeTable = this.validateTable(table);

    console.log(`✅ Validando integridad de datos para ${safeTable}`);

    const validationResults = {
      isValid: true,
      warnings: [],
      errors: []
    };

    // Validaciones específicas por tabla
    switch (safeTable) {
      case 'planes':
        if (!data.nombre || data.nombre.trim().length < 2) {
          validationResults.errors.push('El nombre del plan debe tener al menos 2 caracteres');
          validationResults.isValid = false;
        }
        break;

      case 'especialidades':
        if (!data.nombre || data.nombre.trim().length < 3) {
          validationResults.errors.push('El nombre de la especialidad debe tener al menos 3 caracteres');
          validationResults.isValid = false;
        }
        break;

      case 'prestadores':
        if (!data.nombre || data.nombre.trim().length < 2) {
          validationResults.errors.push('El nombre del prestador debe tener al menos 2 caracteres');
          validationResults.isValid = false;
        }
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          validationResults.warnings.push('El formato del email podría no ser válido');
        }
        break;
    }

    // Validación de estado si existe
    if (data.estado && !['Activo', 'Inactivo'].includes(data.estado)) {
      validationResults.errors.push('El estado debe ser "Activo" o "Inactivo"');
      validationResults.isValid = false;
    }

    console.log(`   ${validationResults.isValid ? '✅' : '❌'} Validación completada: ${validationResults.errors.length} errores, ${validationResults.warnings.length} advertencias`);

    return validationResults;
  }

  /**
   * Obtiene el siguiente valor para campos de orden
   * @async
   * @param {string} table - Nombre de la tabla
   * @returns {Promise<number>} - Siguiente valor de orden
   */
  async getNextOrderValue(table) {
    const safeTable = this.validateTable(table);

    const [result] = await this.executeSecureQuery(
      `SELECT COALESCE(MAX(orden), 0) + 1 as nextOrder FROM ${safeTable}`
    );

    const nextOrder = result[0].nextOrder;

    console.log(`📊 Siguiente valor de orden para ${safeTable}: ${nextOrder}`);

    return nextOrder;
  }

  /**
   * Limpia y optimiza una tabla (elimina registros huérfanos, etc.)
   * @async
   * @param {string} table - Nombre de la tabla
   * @returns {Promise<Object>} - Resultado de la limpieza
   */
  async cleanupTableData(table) {
    let connection;
    try {
      connection = await this.pool.getConnection();
      await connection.beginTransaction();

      const safeTable = this.validateTable(table);

      console.log(`🧹 Limpiando datos de ${safeTable}`);

      let cleanupResults = {
        table: safeTable,
        actions: [],
        totalCleaned: 0
      };

      // Limpiezas específicas por tabla
      switch (safeTable) {
        case 'cartilla':
          // Eliminar registros de cartilla sin prestador asociado
          const [orphanCartilla] = await connection.query(
            `DELETE c FROM cartilla c 
             LEFT JOIN prestadores p ON c.id_prestador = p.id_prestador 
             WHERE p.id_prestador IS NULL`
          );

          cleanupResults.actions.push({
            action: 'Eliminados registros huérfanos de cartilla',
            affected: orphanCartilla.affectedRows
          });
          cleanupResults.totalCleaned += orphanCartilla.affectedRows;
          break;

        case 'prestador_plan':
          // Eliminar relaciones con prestadores inexistentes
          const [orphanPrestadorPlan] = await connection.query(
            `DELETE pp FROM prestador_plan pp
             LEFT JOIN prestadores p ON pp.id_prestador = p.id_prestador
             WHERE p.id_prestador IS NULL`
          );

          cleanupResults.actions.push({
            action: 'Eliminadas relaciones prestador-plan huérfanas',
            affected: orphanPrestadorPlan.affectedRows
          });
          cleanupResults.totalCleaned += orphanPrestadorPlan.affectedRows;
          break;
      }

      await connection.commit();

      console.log(`   ✅ Limpieza completada: ${cleanupResults.totalCleaned} registros procesados`);

      return cleanupResults;

    } catch (error) {
      if (connection) await connection.rollback();
      console.error(`❌ Error en limpieza de datos:`, error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = DataOperationsManager;