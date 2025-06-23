/**
 * @module repositories/abmRepository
 * @description Repositorio para operaciones CRUD genéricas
 */

const { pool } = require('../config/db');

const DataOperationsManager = require("../libs/data-operations-manager");

const dataOpsManager = new DataOperationsManager(pool);

// Lista de tablas permitidas para validación
const ALLOWED_TABLES = {
    'planes': 'planes',
    'especialidades': 'especialidades',
    'categorias_prestador': 'categorias_prestador',
    'categorias': 'categorias_prestador', // Alias
    'provincias': 'provincias',
    'localidades': 'localidades',
    'prestadores': 'prestadores',
    'cartilla': 'cartilla',
    'prestador_categoria': 'prestador_categoria',
    'prestador_especialidad': 'prestador_especialidad',
    'prestador_plan': 'prestador_plan',
    'users': 'users'
};

// Lista de campos permitidos para validación
const ALLOWED_FIELDS = {
    'id_plan': 'id_plan',
    'id_especialidad': 'id_especialidad',
    'id_categoria': 'id_categoria',
    'id_provincia': 'id_provincia',
    'id_localidad': 'id_localidad',
    'id_prestador': 'id_prestador',
    'id_user': 'id_user',
    'nombre': 'nombre',
    'nombre_prestador': 'nombre_prestador',
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

const ABMRepository = {

    // ============================================================================
    // VALIDACIÓN Y SEGURIDAD
    // ============================================================================

    /**
     * Valida que una tabla sea permitida
     * @param {string} table - Nombre de la tabla
     * @returns {string} - Nombre de tabla validado
     * @throws {Error} - Si la tabla no está permitida
     */
    validateTable(table) {
        if (!ALLOWED_TABLES[table]) {
            throw new Error('Tabla no permitida');
        }
        return ALLOWED_TABLES[table];
    },

    /**
     * Valida que un campo sea permitido
     * @param {string} field - Nombre del campo
     * @returns {string} - Nombre de campo validado
     * @throws {Error} - Si el campo no está permitido
     */
    validateField(field) {
        if (!ALLOWED_FIELDS[field]) {
            throw new Error('Campo no permitido');
        }
        return ALLOWED_FIELDS[field];
    },

    // ============================================================================
    // OPERACIONES BÁSICAS CRUD (delegadas a DataOperationsManager)
    // ============================================================================

    /**
     * Ejecuta una consulta SQL con parámetros
     * @async
     * @param {string} query - Consulta SQL
     * @param {Array} [params=[]] - Parámetros para la consulta
     * @returns {Promise<Array>} - Resultado de la consulta
     */
    async execute(query, params = []) {
        return await dataOpsManager.executeCustomQuery(query, params);
    },

    /**
     * Obtiene todos los registros de una tabla
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {string} [idField] - Campo ID (opcional)
     * @param {number} [page] - Página (opcional)
     * @param {number} [limit] - Límite (opcional)
     * @param {string} [orderBy] - Campo orden (opcional)
     * @param {string} [orderDirection] - Dirección orden (opcional)
     * @returns {Promise<Array|Object>} - Registros o resultado paginado
     */
    async getAll(table, idField, page, limit, orderBy, orderDirection) {
        // Validar tabla
        this.validateTable(table);

        // Delegar a DataOperationsManager
        return await dataOpsManager.retrieveAllRecords(table, idField, page, limit, orderBy, orderDirection);
    },

    /**
     * Obtiene un registro por su ID
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {string} idField - Nombre del campo ID
     * @param {number|string} id - Valor del ID
     * @returns {Promise<Object|null>} - Registro encontrado o null
     */
    async getById(table, idField, id) {
        // Validar tabla y campo
        this.validateTable(table);
        this.validateField(idField);

        // Delegar a DataOperationsManager
        return await dataOpsManager.retrieveRecordById(table, idField, id);
    },

    /**
     * Obtiene registros por nombre
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {string} nameField - Campo nombre
     * @param {string} name - Nombre a buscar
     * @returns {Promise<Array>} - Registros encontrados
     */
    async getByName(table, nameField, name) {
        // Validar tabla y campo
        this.validateTable(table);
        this.validateField(nameField);

        // Delegar a DataOperationsManager
        return await dataOpsManager.retrieveRecordsByName(table, nameField, name);
    },

    /**
     * Crea un nuevo registro
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {Object} data - Datos del nuevo registro
     * @returns {Promise<Object>} - Registro creado con su ID
     */
    async create(table, data) {
        // Validar tabla
        this.validateTable(table);

        // Delegar a DataOperationsManager
        return await dataOpsManager.createNewRecord(table, data);
    },

    /**
     * Actualiza un registro existente
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {string} idField - Nombre del campo ID
     * @param {number|string} id - Valor del ID
     * @param {Object} data - Nuevos datos del registro
     * @returns {Promise<Object>} - Resultado de la actualización
     */
    async update(table, idField, id, data) {
        // Validar tabla y campo
        this.validateTable(table);
        this.validateField(idField);

        // Delegar a DataOperationsManager
        return await dataOpsManager.updateRecordById(table, idField, id, data);
    },

    /**
     * Actualiza las relaciones de un registro
     * @async
     * @param {string} table - Nombre de la tabla de relaciones
     * @param {string} idField - Nombre del campo ID principal
     * @param {number|string} id - Valor del ID principal
     * @param {string} relationField - Nombre del campo de relación
     * @param {Array} values - Valores para las nuevas relaciones
     * @returns {Promise<void>}
     */
    async updateRelations(table, idField, id, relationField, values) {
        // Validar tabla y campos
        this.validateTable(table);
        this.validateField(idField);
        this.validateField(relationField);

        // Delegar a DataOperationsManager
        return await dataOpsManager.updateRecordRelations(table, idField, id, relationField, values);
    },

    /**
     * Actualiza un registro por su nombre y opcionalmente actualiza referencias en cartilla
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {string} nameField - Nombre del campo que contiene el nombre
     * @param {string} oldName - Nombre actual
     * @param {Object} data - Nuevos datos del registro
     * @param {string} [cartillaField=null] - Campo correspondiente en cartilla
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async updateByName(table, nameField, oldName, data, cartillaField = null) {
        // Validar tabla y campo
        this.validateTable(table);
        this.validateField(nameField);

        // Delegar a DataOperationsManager
        return await dataOpsManager.updateRecordsByName(table, nameField, oldName, data, cartillaField);
    },

    /**
     * Elimina un registro por su ID
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {string} idField - Nombre del campo ID
     * @param {number|string} id - Valor del ID
     * @returns {Promise<Object>} - Resultado de la eliminación
     */
    async delete(table, idField, id) {
        // Validar tabla y campo
        this.validateTable(table);
        this.validateField(idField);

        // Delegar a DataOperationsManager
        return await dataOpsManager.deleteRecordById(table, idField, id);
    },

    /**
     * Verifica si un registro tiene relaciones en otras tablas
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {number|string} id - Valor del ID
     * @param {string} idField - Nombre del campo ID
     * @returns {Promise<boolean>} - true si tiene relaciones, false si no
     */
    async hasRelations(table, id, idField) {
        // Validar tabla y campo
        this.validateTable(table);
        this.validateField(idField);

        // Delegar a DataOperationsManager
        return await dataOpsManager.checkRecordRelations(table, id, idField);
    },

    // ============================================================================
    // OPERACIONES AVANZADAS (delegadas a DataOperationsManager)
    // ============================================================================

    /**
     * Cambia el estado de un registro con efectos en cascada
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {string} idField - Nombre del campo ID
     * @param {number|string} id - Valor del ID
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async cascadeToggleStatus(table, idField, id) {
        // Validar tabla y campo
        this.validateTable(table);
        this.validateField(idField);

        // Delegar a DataOperationsManager
        return await dataOpsManager.toggleRecordStatusWithCascade(table, idField, id);
    },

    /**
     * Obtiene localidades filtradas por provincia
     * @async
     * @param {number|string} provinciaId - ID de la provincia
     * @returns {Promise<Array>} - Array de localidades
     */
    async getLocalidadesByProvincia(provinciaId) {
        // Delegar a DataOperationsManager
        return await dataOpsManager.retrieveLocalitiesByProvince(provinciaId);
    },

    /**
     * Actualiza el orden de múltiples registros
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {string} idField - Nombre del campo ID
     * @param {Array} orders - Array con los nuevos órdenes
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async updateBulkOrder(table, idField, orders) {
        // Validar tabla y campo
        this.validateTable(table);
        this.validateField(idField);

        // Delegar a DataOperationsManager
        return await dataOpsManager.updateBulkRecordOrder(table, idField, orders);
    },

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
    async getFiltered(table, filters = {}, page = 1, limit = 10, orderBy = null, orderDirection = 'ASC') {
        // Validar tabla
        this.validateTable(table);

        // Delegar a DataOperationsManager
        return await dataOpsManager.retrieveFilteredRecords(table, filters, page, limit, orderBy, orderDirection);
    },

    /**
     * Realiza operaciones en lote (insert, update, delete)
     * @async
     * @param {string} operation - Tipo de operación ('insert', 'update', 'delete')
     * @param {string} table - Nombre de la tabla
     * @param {Array} data - Array de datos para la operación
     * @param {string} [idField] - Campo ID (para update/delete)
     * @returns {Promise<Object>} - Resultado de la operación en lote
     */
    async batchOperation(operation, table, data, idField = null) {
        // Validar tabla
        this.validateTable(table);

        if (idField) {
            this.validateField(idField);
        }

        // Delegar a DataOperationsManager
        return await dataOpsManager.executeBatchOperation(operation, table, data, idField);
    },

    /**
     * Ejecuta una consulta SQL personalizada
     * @async
     * @param {string} query - Consulta SQL
     * @param {Array} [params=[]] - Parámetros de la consulta
     * @returns {Promise<Array>} - Resultados de la consulta
     */
    async customQuery(query, params = []) {
        // Delegar a DataOperationsManager
        return await dataOpsManager.executeCustomQuery(query, params);
    },

    /**
     * Obtiene estadísticas de una tabla
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {string} [groupBy] - Campo para agrupar
     * @returns {Promise<Object>} - Estadísticas de la tabla
     */
    async getTableStats(table, groupBy = null) {
        // Validar tabla
        this.validateTable(table);

        if (groupBy) {
            this.validateField(groupBy);
        }

        // Delegar a DataOperationsManager
        return await dataOpsManager.retrieveTableStatistics(table, groupBy);
    },

    // ============================================================================
    // FUNCIONES ADICIONALES PROPORCIONADAS POR DataOperationsManager
    // ============================================================================

    /**
     * Valida la integridad de datos antes de operaciones críticas
     * @async
     * @param {string} table - Nombre de la tabla
     * @param {Object} data - Datos a validar
     * @returns {Promise<Object>} - Resultado de la validación
     */
    async validateDataIntegrity(table, data) {
        // Validar tabla
        this.validateTable(table);

        // Delegar a DataOperationsManager
        return await dataOpsManager.validateDataIntegrity(table, data);
    },

    /**
     * Obtiene el siguiente valor para campos de orden
     * @async
     * @param {string} table - Nombre de la tabla
     * @returns {Promise<number>} - Siguiente valor de orden
     */
    async getNextOrderValue(table) {
        // Validar tabla
        this.validateTable(table);

        // Delegar a DataOperationsManager
        return await dataOpsManager.getNextOrderValue(table);
    },

    /**
     * Limpia y optimiza una tabla (elimina registros huérfanos, etc.)
     * @async
     * @param {string} table - Nombre de la tabla
     * @returns {Promise<Object>} - Resultado de la limpieza
     */
    async cleanupTableData(table) {
        // Validar tabla
        this.validateTable(table);

        // Delegar a DataOperationsManager
        return await dataOpsManager.cleanupTableData(table);
    },

    // ============================================================================
    // MÉTODOS DE UTILIDAD Y COMPATIBILIDAD
    // ============================================================================

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
        return rows.count === 0;
    },

    /**
     * Obtiene la lista de tablas permitidas
     * @returns {Object} - Objeto con tablas permitidas
     */
    getAllowedTables() {
        return { ...ALLOWED_TABLES };
    },

    /**
     * Obtiene la lista de campos permitidos
     * @returns {Object} - Objeto con campos permitidos
     */
    getAllowedFields() {
        return { ...ALLOWED_FIELDS };
    },

    /**
     * Verifica si una tabla está permitida
     * @param {string} table - Nombre de la tabla
     * @returns {boolean} - true si está permitida
     */
    isTableAllowed(table) {
        return !!ALLOWED_TABLES[table];
    },

    /**
     * Verifica si un campo está permitido
     * @param {string} field - Nombre del campo
     * @returns {boolean} - true si está permitido
     */
    isFieldAllowed(field) {
        return !!ALLOWED_FIELDS[field];
    },

    /**
     * Obtiene información sobre la instancia de DataOperationsManager
     * @returns {Object} - Información de la instancia
     */
    getManagerInfo() {
        return {
            managerClass: 'DataOperationsManager',
            isObfuscated: process.env.NODE_ENV === 'production',
            tablesAllowed: Object.keys(ALLOWED_TABLES).length,
            fieldsAllowed: Object.keys(ALLOWED_FIELDS).length,
            version: '1.0.0'
        };
    }
};

module.exports = ABMRepository;

/*


*/