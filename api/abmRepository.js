/**
 * @module repositories/abmRepository
 * @description Repositorio para operaciones CRUD genéricas
 */

const { pool } = require("../config/db");

/**
 * Lista de tablas permitidas para prevenir inyección SQL
 * @type {Object}
 */
const ALLOWED_TABLES = {
    'cartilla': 'cartilla',
    'planes': 'planes',
    'categorias_prestador': 'categorias_prestador',
    'especialidades': 'especialidades',
    'provincias': 'provincias',
    'localidades': 'localidades',
    'prestador_plan': 'prestador_plan',
    'prestador_categoria': 'prestador_categoria',
    'prestador_especialidad': 'prestador_especialidad',
    'prestadores': 'prestadores'
};

/**
 * Lista de campos permitidos para prevenir inyección SQL
 * @type {Object}
 */
const ALLOWED_FIELDS = {
    'id_plan': 'id_plan',
    'id_categoria': 'id_categoria',
    'id_especialidad': 'id_especialidad',
    'id_provincia': 'id_provincia',
    'id_localidad': 'id_localidad',
    'id_prestador': 'id_prestador',
    'plan': 'plan',
    'provincia': 'provincia',
    'localidad': 'localidad',
    'especialidad': 'especialidad',
    'nombre': 'nombre',
    'nombre_prestador': 'nombre_prestador',
    'categoria_prestador': 'categoria_prestador',
    'direccion': 'direccion',
    'telefonos': 'telefonos',
    'email': 'email',
    'informacion_adicional': 'informacion_adicional',
    'estado': 'estado'
};

/**
 * Repositorio para operaciones CRUD genéricas
 * @type {Object}
 */
const ABMRepository = {
    /**
     * Valida que una tabla esté en la lista de permitidas
     * @param {string} table - Nombre de la tabla a validar
     * @returns {string} - Nombre seguro de la tabla
     * @throws {Error} - Si la tabla no está permitida
     */
    validateTable(table) {
        if (!ALLOWED_TABLES[table]) {
            throw new Error('Tabla no permitida');
        }
        return ALLOWED_TABLES[table];
    },

    /**
     * Valida que un campo esté en la lista de permitidos
     * @param {string} field - Nombre del campo a validar
     * @returns {string} - Nombre seguro del campo
     * @throws {Error} - Si el campo no está permitido
     */
    validateField(field) {
        if (!ALLOWED_FIELDS[field]) {
            throw new Error('Campo no permitido');
        }
        return ALLOWED_FIELDS[field];
    },

    /**
     * Ejecuta una consulta SQL con parámetros
     * @async
     * @param {string} query - Consulta SQL
     * @param {Array} [params=[]] - Parámetros para la consulta
     * @returns {Promise<Array>} - Promesa que resuelve al resultado de la consulta
     * @throws {Error} - Si hay un error en la consulta
     */
    async execute(query, params = []) {
        try {
            return await pool.query(query, params);
        } catch (error) {
            console.error(`Error en consulta SQL:`, error);
            throw error;
        }
    },

    /**
     * Obtiene todos los registros de una tabla
     * @async
     * @param {string} table - Nombre de la tabla
     * @returns {Promise<Array>} - Promesa que resuelve a un array con los registros
     */
    async getAll(table) {
        const safeTable = this.validateTable(table);
        const [rows] = await this.execute(`SELECT * FROM ??`, [safeTable]);
        return rows;
    },

    /**
     * Obtiene un registro por su ID
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {string} idField - Nombre del campo ID
     * @param {number|string} id - Valor del ID
     * @returns {Promise<Object|null>} - Promesa que resuelve al registro o null si no existe
     */
    async getById(table, idField, id) {
        const safeTable = this.validateTable(table);
        const safeField = this.validateField(idField);
        const [rows] = await this.execute(`SELECT * FROM ?? WHERE ?? = ?`, [safeTable, safeField, id]);
        return rows[0] || null;
    },

    /**
     * Crea un nuevo registro
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {Object} data - Datos del nuevo registro
     * @returns {Promise<Object>} - Promesa que resuelve al registro creado con su ID
     */
    async create(table, data) {
        const safeTable = this.validateTable(table);
        const [result] = await this.execute(`INSERT INTO ?? SET ?`, [safeTable, data]);
        return { id: result.insertId, ...data };
    },

    /**
     * Actualiza un registro existente
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {string} idField - Nombre del campo ID
     * @param {number|string} id - Valor del ID
     * @param {Object} data - Nuevos datos del registro
     * @returns {Promise<Object>} - Promesa que resuelve al registro actualizado
     */
    async update(table, idField, id, data) {
        const safeTable = this.validateTable(table);
        const safeField = this.validateField(idField);
        await this.execute(`UPDATE ?? SET ? WHERE ?? = ?`, [safeTable, data, safeField, id]);
        return { [idField]: id, ...data };
    },

    /**
     * Actualiza las relaciones de un registro
     * @async
     * @param {string} table - Nombre de la tabla de relaciones
     * @param {string} idField - Nombre del campo ID principal
     * @param {number|string} id - Valor del ID principal
     * @param {string} relationField - Nombre del campo de relación
     * @param {Array} values - Valores para las nuevas relaciones
     * @returns {Promise<void>} - Promesa que se resuelve cuando se completa la operación
     */
    async updateRelations(table, idField, id, relationField, values) {
        if (!Array.isArray(values)) return;

        const safeTable = this.validateTable(table);
        const safeIdField = this.validateField(idField);
        const safeRelationField = this.validateField(relationField);

        // Eliminar relaciones existentes
        await this.execute(
            `DELETE FROM ?? WHERE ?? = ?`,
            [safeTable, safeIdField, id]
        );

        // Insertar nuevas relaciones
        if (values.length > 0) {
            const relations = values.map(value => [id, value]);
            await this.execute(
                `INSERT INTO ?? (??, ??) VALUES ?`,
                [safeTable, safeIdField, safeRelationField, relations]
            );
        }
    },

    /**
     * Actualiza un registro por su nombre y opcionalmente actualiza referencias en cartilla
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {string} nameField - Nombre del campo que contiene el nombre
     * @param {string} oldName - Nombre actual
     * @param {Object} data - Nuevos datos del registro
     * @param {string} [cartillaField=null] - Campo correspondiente en cartilla
     * @returns {Promise<Object>} - Promesa que resuelve al resultado de la operación
     */
    async updateByName(table, nameField, oldName, data, cartillaField = null) {
        const safeTable = this.validateTable(table);
        const safeNameField = this.validateField(nameField);

        try {
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // 1. Actualizar el registro principal
                const [result] = await connection.query(
                    `UPDATE ?? SET ? WHERE ?? = ?`,
                    [safeTable, data, safeNameField, oldName]
                );

                // 2. Si hay campo en cartilla y estamos cambiando el nombre, actualizar cartilla
                if (cartillaField && data[nameField] && oldName !== data[nameField]) {
                    await connection.query(
                        `UPDATE cartilla SET ?? = ? WHERE ?? = ?`,
                        [cartillaField, data[nameField], cartillaField, oldName]
                    );
                }

                await connection.commit();
                connection.release();

                return {
                    success: true,
                    affectedRows: result.affectedRows,
                    oldName: oldName,
                    newName: data[nameField],
                    [nameField]: data[nameField],
                    ...data
                };
            } catch (error) {
                await connection.rollback();
                connection.release();
                throw error;
            }
        } catch (error) {
            console.error(`Error en updateByName para ${table}:`, error);
            throw error;
        }
    },

    /**
     * Cambia el estado de un registro y actualiza registros relacionados en cascada
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {string} idField - Nombre del campo ID
     * @param {number|string} id - Valor del ID
     * @returns {Promise<Object>} - Promesa que resuelve al resultado de la operación
     */
    async cascadeToggleStatus(table, idField, id) {
        // Primero obtenemos el estado actual y el nombre del registro (si es necesario)
        let currentState;
        let recordName;

        const [record] = await this.execute(
            `SELECT estado${table === 'planes' || table === 'categorias_prestador' || table === 'especialidades' ? ', nombre' : ''} FROM ?? WHERE ?? = ?`,
            [table, idField, id]
        );

        if (!record) throw new Error('Registro no encontrado');

        currentState = record[0].estado;
        const newState = currentState === 'Activo' ? 'Inactivo' : 'Activo';

        if (table === 'planes' || table === 'categorias_prestador' || table === 'especialidades') {
            recordName = record[0].nombre;
        }

        const cascadeRules = {
            'planes': [
                {
                    table: 'cartilla',
                    condition: 'plan = ?',
                    action: 'UPDATE ?? SET estado = ?',
                    value: recordName,
                    newState: newState
                },
                {
                    table: 'prestadores',
                    condition: 'id_prestador IN (SELECT id_prestador FROM prestador_plan WHERE id_plan = ?)',
                    action: 'UPDATE ?? SET estado = ?',
                    value: id,
                    newState: newState
                }
            ],
            'categorias_prestador': [
                {
                    table: 'cartilla',
                    condition: 'categoria = ?',
                    action: 'UPDATE ?? SET estado = ?',
                    value: recordName,
                    newState: newState
                },
                {
                    table: 'prestadores',
                    condition: 'id_prestador IN (SELECT id_prestador FROM prestador_categoria WHERE id_categoria = ?)',
                    action: 'UPDATE ?? SET estado = ?',
                    value: id,
                    newState: newState
                }
            ],
            'especialidades': [
                {
                    table: 'cartilla',
                    condition: 'especialidad = ?',
                    action: 'UPDATE ?? SET estado = ?',
                    value: recordName,
                    newState: newState
                },
                {
                    table: 'prestadores',
                    condition: 'id_prestador IN (SELECT id_prestador FROM prestador_especialidad WHERE id_especialidad = ?)',
                    action: 'UPDATE ?? SET estado = ?',
                    value: id,
                    newState: newState
                }
            ],
            'provincias': [
                {
                    table: 'cartilla',
                    condition: 'provincia = (SELECT nombre FROM provincias WHERE id_provincia = ?)',
                    action: 'UPDATE ?? SET estado = ?',
                    value: id,
                    newState: newState
                },
                {
                    table: 'prestadores',
                    condition: 'id_localidad IN (SELECT id_localidad FROM localidades WHERE id_provincia = ?)',
                    action: 'UPDATE ?? SET estado = ?',
                    value: id,
                    newState: newState
                }
            ],
            'localidades': [
                {
                    table: 'cartilla',
                    condition: 'localidad = (SELECT nombre FROM localidades WHERE id_localidad = ?)',
                    action: 'UPDATE ?? SET estado = ?',
                    value: id,
                    newState: newState
                },
                {
                    table: 'prestadores',
                    condition: 'id_localidad = ?',
                    action: 'UPDATE ?? SET estado = ?',
                    value: id,
                    newState: newState
                }
            ]
        };

        const safeTable = this.validateTable(table);
        const safeIdField = this.validateField(idField);

        if (!cascadeRules[safeTable]) {
            throw new Error('No hay reglas de cascada definidas para esta tabla');
        }

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // 1. Ejecutar las reglas de cascada
            for (const rule of cascadeRules[safeTable]) {
                // Solo ejecutar si el valor no es null o undefined
                if (rule.value != null) {
                    await connection.query(
                        `${rule.action} WHERE ${rule.condition}`,
                        [rule.table, rule.newState, rule.value]
                    );
                }
            }

            // 2. Actualizar el estado del registro principal
            await connection.query(
                `UPDATE ?? SET estado = ? WHERE ?? = ?`,
                [safeTable, newState, safeIdField, id]
            );

            await connection.commit();
            return { newState, affected: true };
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error en cascadeToggleStatus:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    /**
     * Elimina un registro
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {string} idField - Nombre del campo ID
     * @param {number|string} id - Valor del ID
     * @returns {Promise<boolean>} - Promesa que resuelve a true si se eliminó correctamente
     */
    async delete(table, idField, id) {
        const safeTable = this.validateTable(table);
        const safeField = this.validateField(idField);
        const [result] = await this.execute(`DELETE FROM ?? WHERE ?? = ?`, [safeTable, safeField, id]);
        return result.affectedRows > 0;
    },

    /**
     * Verifica si un valor es único en un campo
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {string} field - Nombre del campo
     * @param {any} value - Valor a verificar
     * @param {string} [idField=null] - Nombre del campo ID para exclusión
     * @param {number|string} [idValue=null] - Valor del ID para exclusión
     * @returns {Promise<boolean>} - Promesa que resuelve a true si el valor es único
     */
    async checkUnique(table, field, value, idField = null, idValue = null) {
        const safeTable = this.validateTable(table);
        const safeField = this.validateField(field);

        let query = `SELECT COUNT(*) as count FROM ?? WHERE ?? = ?`;
        let params = [safeTable, safeField, value];

        if (idField && idValue) {
            const safeIdField = this.validateField(idField);
            query += ` AND ?? != ?`;
            params.push(safeIdField, idValue);
        }

        const [rows] = await this.execute(query, params);
        return rows[0].count === 0;
    },

    /**
     * Verifica si un registro tiene relaciones en otras tablas
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {number|string} id - Valor del ID
     * @param {string} idField - Nombre del campo ID
     * @returns {Promise<boolean>} - Promesa que resuelve a true si tiene relaciones
     */
    async hasRelations(table, id, idField) {
        // Mapa de relaciones
        const relations = {
            'planes': [{ table: 'prestador_plan', field: 'id_plan' }],
            'categorias_prestador': [{ table: 'prestador_categoria', field: 'id_categoria' }],
            'especialidades': [{ table: 'prestador_especialidad', field: 'id_especialidad' }],
            'provincias': [{ table: 'localidades', field: 'id_provincia' }],
            'localidades': [{ table: 'prestadores', field: 'id_localidad' }]
        };

        const safeTable = this.validateTable(table);
        if (!relations[safeTable]) return false;

        for (const rel of relations[safeTable]) {
            const safeRelTable = this.validateTable(rel.table);
            const safeRelField = this.validateField(rel.field);

            const [rows] = await this.execute(
                `SELECT 1 FROM ?? WHERE ?? = ? LIMIT 1`,
                [safeRelTable, safeRelField, id]
            );
            if (rows.length > 0) return true;
        }

        return false;
    },

    /**
     * Obtiene localidades filtradas por provincia
     * @async
     * @param {number|string} id - ID de la provincia
     * @returns {Promise<Array>} - Promesa que resuelve a un array con las localidades
     */
    async getLocalidadesByProvincia(id) {
        const [rows] = await this.execute(`CALL GetLocalidadesByProvincia(?)`, [id]);
        return rows;
    }
};

module.exports = ABMRepository;