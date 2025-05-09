/**
 * @module services/abmService
 * @description Servicios para operaciones CRUD genéricas
 */

const ABMRepository = require('../repositories/abmRepository');

/**
 * Configuración centralizada de entidades
 * @type {Object}
 */
const entities = {
    planes: {
        table: 'planes',
        idField: 'id_plan',
        nameField: 'nombre', // Campo que contiene el nombre
        cartillaField: 'plan', // Campo correspondiente en cartilla
        requiredFields: ['nombre'],
        uniqueFields: ['nombre'],
        displayName: 'Plan',
        hasCartillaUpdate: true // Indica si requiere actualización en cartilla
    },
    categorias: {
        table: 'categorias_prestador',
        idField: 'id_categoria',
        nameField: 'nombre',
        cartillaField: 'categoria',
        requiredFields: ['nombre'],
        uniqueFields: ['nombre'],
        displayName: 'Categoría',
        hasCartillaUpdate: true
    },
    especialidades: {
        table: 'especialidades',
        idField: 'id_especialidad',
        nameField: 'nombre',
        cartillaField: 'especialidad',
        requiredFields: ['nombre'],
        uniqueFields: ['nombre'],
        displayName: 'Especialidad',
        hasCartillaUpdate: true
    },
    provincias: {
        table: 'provincias',
        idField: 'id_provincia',
        nameField: 'nombre',
        requiredFields: ['nombre'],
        uniqueFields: ['nombre'],
        displayName: 'Provincia'
    },
    localidades: {
        table: 'localidades',
        idField: 'id_localidad',
        nameField: 'nombre',
        requiredFields: ['nombre', 'id_provincia'],
        uniqueFields: [],
        displayName: 'Localidad'
    }
};

/**
 * Servicios para operaciones CRUD genéricas
 * @type {Object}
 */
const ABMService = {
    /**
     * Obtiene la configuración de una entidad
     * @param {string} entityName - Nombre de la entidad
     * @returns {Object} - Configuración de la entidad
     * @throws {Error} - Si la entidad no está configurada
     */
    getEntityConfig(entityName) {
        const config = entities[entityName];
        if (!config) throw new Error(`Entidad ${entityName} no configurada`);
        return config;
    },

    /**
     * Valida los datos de una entidad
     * @param {string} entityName - Nombre de la entidad
     * @param {Object} data - Datos a validar
     * @returns {Object} - Datos sanitizados
     * @throws {Error} - Si los datos no son válidos
     */
    validateData(entityName, data) {
        const { requiredFields } = this.getEntityConfig(entityName);
        const errors = [];

        // Validar campos requeridos
        for (const field of requiredFields) {
            if (!data[field]) {
                errors.push(`El campo ${field} es requerido`);
            }
        }

        // Validar tipos de datos
        if (data.nombre !== undefined) {
            if (typeof data.nombre !== 'string') {
                errors.push('El nombre debe ser un texto');
            } else if (data.nombre.length > 255) {
                errors.push('El nombre debe tener máximo 255 caracteres');
            }
        }

        if (data.id_provincia !== undefined) {
            const id = Number(data.id_provincia);
            if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
                errors.push('El ID de provincia debe ser un número entero positivo');
            }
        }

        // Si hay errores, lanzar excepción
        if (errors.length > 0) {
            throw new Error(errors.join('. '));
        }

        // Sanitizar datos
        const sanitizedData = { ...data };
        if (sanitizedData.nombre) {
            sanitizedData.nombre = sanitizedData.nombre.trim().replace(/[<>]/g, '');
        }

        return sanitizedData;
    },

    /**
     * Obtiene todos los registros de una entidad
     * @async
     * @param {string} entityName - Nombre de la entidad
     * @returns {Promise<Array>} - Promesa que resuelve a un array con los registros
     */
    async getAll(entityName) {
        const { table } = this.getEntityConfig(entityName);
        return await ABMRepository.getAll(table);
    },

    /**
     * Obtiene un registro de una entidad por su ID
     * @async
     * @param {string} entityName - Nombre de la entidad
     * @param {number|string} id - ID del registro
     * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el registro
     * @throws {Error} - Si el ID no es válido o el registro no existe
     */
    async getById(entityName, id) {
        const { table, idField, displayName } = this.getEntityConfig(entityName);

        // Validar que id sea un número
        const numId = Number(id);
        if (isNaN(numId) || !Number.isInteger(numId) || numId <= 0) {
            throw new Error(`ID inválido`);
        }

        const entity = await ABMRepository.getById(table, idField, numId);
        if (!entity) throw new Error(`${displayName} no encontrado`);
        return entity;
    },

    /**
     * Crea un nuevo registro de una entidad
     * @async
     * @param {string} entityName - Nombre de la entidad
     * @param {Object} data - Datos del nuevo registro
     * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el registro creado
     * @throws {Error} - Si los datos no son válidos o hay conflictos de unicidad
     */
    async create(entityName, data) {
        const { table, uniqueFields } = this.getEntityConfig(entityName);

        // Validar y sanitizar datos
        const sanitizedData = this.validateData(entityName, data);

        // Validar campos únicos
        for (const field of uniqueFields) {
            if (sanitizedData[field]) {
                const isUnique = await ABMRepository.checkUnique(table, field, sanitizedData[field]);
                if (!isUnique) throw new Error(`Ya existe un registro con ${field} = ${sanitizedData[field]}`);
            }
        }

        return await ABMRepository.create(table, sanitizedData);
    },

    /**
     * Actualiza un registro existente de una entidad
     * @async
     * @param {string} entityName - Nombre de la entidad
     * @param {number|string} id - ID del registro a actualizar
     * @param {Object} data - Nuevos datos del registro
     * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el registro actualizado
     * @throws {Error} - Si los datos no son válidos, el registro no existe o hay conflictos de unicidad
     */
    async update(entityName, id, data) {
        const { table, idField, uniqueFields, displayName, nameField, cartillaField, hasCartillaUpdate } = this.getEntityConfig(entityName);

        // Validar que id sea un número
        const numId = Number(id);
        if (isNaN(numId) || !Number.isInteger(numId) || numId <= 0) {
            throw new Error(`ID inválido`);
        }

        // Validar y sanitizar datos
        const sanitizedData = this.validateData(entityName, data);

        // Verificar que existe y obtener el nombre actual si es necesario
        const existingRecord = await ABMRepository.getById(table, idField, numId);
        if (!existingRecord) throw new Error(`${displayName} no encontrado`);

        // Validar campos únicos
        for (const field of uniqueFields) {
            if (sanitizedData[field]) {
                const isUnique = await ABMRepository.checkUnique(table, field, sanitizedData[field], idField, numId);
                if (!isUnique) throw new Error(`Ya existe un registro con ${field} = ${sanitizedData[field]}`);
            }
        }

        // Si estamos actualizando el nombre y requiere actualización en cartilla
        if (hasCartillaUpdate && sanitizedData[nameField] && existingRecord[nameField] !== sanitizedData[nameField]) {
            // Actualizar con lógica de cascada
            return await ABMRepository.updateByName(
                table,
                nameField,
                existingRecord[nameField], // Nombre actual
                {
                    ...sanitizedData,
                    // Asegurar que el nombre nuevo se use para actualizar cartilla
                    [nameField]: sanitizedData[nameField]
                },
                cartillaField
            );
        }

        // Actualización normal sin cascada
        return await ABMRepository.update(table, idField, numId, sanitizedData);
    },

    /**
     * Elimina un registro de una entidad
     * @async
     * @param {string} entityName - Nombre de la entidad
     * @param {number|string} id - ID del registro a eliminar
     * @returns {Promise<boolean>} - Promesa que resuelve a true si se eliminó correctamente
     * @throws {Error} - Si el ID no es válido, el registro no existe o tiene relaciones
     */
    async delete(entityName, id) {
        const { table, idField, displayName } = this.getEntityConfig(entityName);

        // Validar que id sea un número
        const numId = Number(id);
        if (isNaN(numId) || !Number.isInteger(numId) || numId <= 0) {
            throw new Error(`ID inválido`);
        }

        // Verificar que existe
        const exists = await ABMRepository.getById(table, idField, numId);
        if (!exists) throw new Error(`${displayName} no encontrado`);

        // Verificar relaciones
        const hasRelations = await ABMRepository.hasRelations(table, numId, idField);
        if (hasRelations) {
            throw new Error(`No se puede eliminar este ${displayName.toLowerCase()} porque está siendo utilizado en otras tablas`);
        }

        return await ABMRepository.delete(table, idField, numId);
    },

    /**
     * Cambia el estado de un registro de una entidad
     * @async
     * @param {string} entityName - Nombre de la entidad
     * @param {number|string} id - ID del registro
     * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el nuevo estado
     * @throws {Error} - Si el ID no es válido o el registro no existe
     */
    async toggleStatus(entityName, id) {
        const { table, idField, displayName } = this.getEntityConfig(entityName);

        // Validar que id sea un número
        const numId = Number(id);
        if (isNaN(numId) || !Number.isInteger(numId) || numId <= 0) {
            throw new Error(`ID inválido`);
        }

        // Verificar que existe
        const exists = await ABMRepository.getById(table, idField, numId);
        if (!exists) throw new Error(`${displayName} no encontrado`);

        return await ABMRepository.cascadeToggleStatus(table, idField, numId);
    },

    /**
     * Obtiene localidades filtradas por provincia
     * @async
     * @param {number|string} id - ID de la provincia
     * @returns {Promise<Array>} - Promesa que resuelve a un array con las localidades
     */
    async getLocalidadesByProvincia(id) {
        return await ABMRepository.getLocalidadesByProvincia(id);
    },
};

module.exports = ABMService;