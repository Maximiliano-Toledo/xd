/**
 * @module utils/auditLogger
 * @description Utilidad mejorada para registrar eventos de auditoría en la base de datos
 * con información detallada sobre tipos de operaciones específicas
 */

const { pool } = require('../config/db');

/**
 * Definición de tipos de operaciones para mejor categorización
 * @type {Object}
 */
const OPERATION_TYPES = {
    // Operaciones generales
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    VIEW: 'view',
    LOGIN: 'login',
    LOGOUT: 'logout',

    // Operaciones específicas
    INDIVIDUAL_UPLOAD: 'individual_upload',
    BULK_UPLOAD: 'bulk_upload',
    DOWNLOAD_CSV: 'download_csv',
    DOWNLOAD_PDF: 'download_pdf',
    EDIT_PROVIDER: 'edit_provider',
    ENABLE_PLAN: 'enable_plan',
    DISABLE_PLAN: 'disable_plan',
    EDIT_PLAN: 'edit_plan',
    CREATE_PLAN: 'create_plan',
    ENABLE_SPECIALTY: 'enable_specialty',
    DISABLE_SPECIALTY: 'disable_specialty',
    EDIT_SPECIALTY: 'edit_specialty',
    CREATE_SPECIALTY: 'create_specialty',
    TOGGLE_STATUS: 'toggle_status'
};

/**
 * Definición de entidades del sistema
 * @type {Object}
 */
const ENTITY_TYPES = {
    USER: 'users',
    PROVIDER: 'prestadores',
    PLAN: 'planes',
    SPECIALTY: 'especialidades',
    CATEGORY: 'categorias',
    LOCATION: 'localidades',
    PROVINCE: 'provincias',
    CARTILLA: 'cartilla'
};

/**
 * Mapeo de nombres de campos a nombres amigables para UI
 * @type {Object}
 */
const FIELD_LABELS = {
    'direccion': 'Dirección',
    'telefonos': 'Teléfonos',
    'email': 'Email',
    'estado': 'Estado',
    'nombre': 'Nombre',
    'informacion_adicional': 'Información adicional',
    'planes': 'Planes',
    'categorias': 'Categorías',
    'especialidades': 'Especialidades',
    'localidad_nombre': 'Localidad',
    'provincia_nombre': 'Provincia'
};

/**
 * Objeto que proporciona métodos para registrar acciones de auditoría
 * @type {Object}
 */
const auditLogger = {
    OPERATION_TYPES,
    ENTITY_TYPES,
    FIELD_LABELS,

    /**
     * Obtiene una descripción amigable para la operación realizada
     * @param {string} action - Tipo de acción
     * @param {string} entityType - Tipo de entidad
     * @param {Object} details - Detalles adicionales
     * @returns {string} - Descripción amigable de la operación
     */
    getOperationDescription(action, entityType, details = {}) {
        const entityNames = {
            [ENTITY_TYPES.USER]: 'Usuario',
            [ENTITY_TYPES.PROVIDER]: 'Prestador',
            [ENTITY_TYPES.PLAN]: 'Plan',
            [ENTITY_TYPES.SPECIALTY]: 'Especialidad',
            [ENTITY_TYPES.CATEGORY]: 'Categoría',
            [ENTITY_TYPES.LOCATION]: 'Localidad',
            [ENTITY_TYPES.PROVINCE]: 'Provincia',
            [ENTITY_TYPES.CARTILLA]: 'Cartilla'
        };

        const actionDescriptions = {
            [OPERATION_TYPES.CREATE]: `Creación de ${entityNames[entityType] || entityType}`,
            [OPERATION_TYPES.UPDATE]: `Actualización de ${entityNames[entityType] || entityType}`,
            [OPERATION_TYPES.DELETE]: `Eliminación de ${entityNames[entityType] || entityType}`,
            [OPERATION_TYPES.VIEW]: `Visualización de ${entityNames[entityType] || entityType}`,
            [OPERATION_TYPES.LOGIN]: 'Inicio de sesión',
            [OPERATION_TYPES.LOGOUT]: 'Cierre de sesión',
            [OPERATION_TYPES.INDIVIDUAL_UPLOAD]: 'Carga individual de prestador',
            [OPERATION_TYPES.BULK_UPLOAD]: 'Carga masiva de prestadores',
            [OPERATION_TYPES.DOWNLOAD_CSV]: 'Descarga de cartilla en formato CSV',
            [OPERATION_TYPES.DOWNLOAD_PDF]: 'Descarga de cartilla en formato PDF',
            [OPERATION_TYPES.EDIT_PROVIDER]: 'Edición de prestador',
            [OPERATION_TYPES.ENABLE_PLAN]: 'Habilitación de plan',
            [OPERATION_TYPES.DISABLE_PLAN]: 'Deshabilitación de plan',
            [OPERATION_TYPES.EDIT_PLAN]: 'Edición de plan',
            [OPERATION_TYPES.CREATE_PLAN]: 'Creación de plan',
            [OPERATION_TYPES.ENABLE_SPECIALTY]: 'Habilitación de especialidad',
            [OPERATION_TYPES.DISABLE_SPECIALTY]: 'Deshabilitación de especialidad',
            [OPERATION_TYPES.EDIT_SPECIALTY]: 'Edición de especialidad',
            [OPERATION_TYPES.CREATE_SPECIALTY]: 'Creación de especialidad',
            [OPERATION_TYPES.TOGGLE_STATUS]: `Cambio de estado de ${entityNames[entityType] || entityType}`
        };

        // Si hay una descripción personalizada en los detalles, usarla
        if (details && details.customDescription) {
            return details.customDescription;
        }

        return actionDescriptions[action] || `Acción ${action} en ${entityNames[entityType] || entityType}`;
    },

    /**
     * Registra una acción en el sistema de auditoría
     * @async
     * @param {number} userId - ID del usuario que realizó la acción
     * @param {string} action - Tipo de acción (create, update, delete, etc.)
     * @param {string} entityType - Tipo de entidad afectada
     * @param {number|string} entityId - ID de la entidad afectada
     * @param {Object} details - Detalles adicionales de la acción
     * @param {string} [ipAddress=null] - Dirección IP del cliente
     * @param {string} [userAgent=null] - Agente de usuario del cliente
     * @returns {Promise<Object>} - Promesa que se resuelve con el registro creado
     */
    async logAction(userId, action, entityType, entityId, details, ipAddress = null, userAgent = null) {
        try {
            // Convertir entityId a un formato adecuado para la base de datos
            let formattedEntityId;

            // Si es un número, usarlo directamente
            if (!isNaN(entityId) && Number.isInteger(Number(entityId))) {
                formattedEntityId = entityId;
            } else {
                // Si no es un número, guardarlo como 0 y añadir el identificador en los detalles
                formattedEntityId = 0;
                details = {
                    ...details,
                    nonNumericId: entityId
                };
            }

            // Generar una descripción amigable de la operación
            const operationDescription = this.getOperationDescription(action, entityType, details);

            // Enriquecer los detalles con información adicional
            const enrichedDetails = {
                ...details,
                description: operationDescription,
                timestamp: new Date().toISOString(),
                ipAddress,
                userAgent
            };

            // Insertar en la base de datos con los campos adicionales
            const [result] = await pool.query(
                `INSERT INTO audit_logs 
         (user_id, action, entity_type, entity_id, details, operation_description, timestamp, ip_address, user_agent) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
                [
                    userId,
                    action,
                    entityType,
                    formattedEntityId,
                    JSON.stringify(enrichedDetails),
                    operationDescription,
                    ipAddress,
                    userAgent
                ]
            );

            console.log(`[AUDIT] User ${userId} performed ${action} on ${entityType} ${entityId}`);

            return {
                id: result.insertId,
                userId,
                action,
                entityType,
                entityId: formattedEntityId,
                description: operationDescription,
                details: enrichedDetails,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Error logging audit trail:', error);
            // No propagamos el error para no interrumpir la operación principal
        }
    },

    /**
     * Registra una carga individual de prestador
     * @async
     * @param {number} userId - ID del usuario
     * @param {number|string} prestadorId - ID del prestador
     * @param {Object} prestadorData - Datos del prestador
     * @param {string} [ipAddress=null] - Dirección IP
     * @param {string} [userAgent=null] - Agente de usuario
     * @returns {Promise<Object>} - Registro de auditoría
     */
    async logIndividualUpload(userId, prestadorId, prestadorData, ipAddress = null, userAgent = null) {
        const details = {
            prestadorData,
            customDescription: 'Carga individual de prestador'
        };

        return this.logAction(
            userId,
            OPERATION_TYPES.INDIVIDUAL_UPLOAD,
            ENTITY_TYPES.PROVIDER,
            prestadorId,
            details,
            ipAddress,
            userAgent
        );
    },

    /**
     * Registra una carga masiva de prestadores
     * @async
     * @param {number} userId - ID del usuario
     * @param {Object} uploadDetails - Detalles de la carga masiva
     * @param {string} [ipAddress=null] - Dirección IP
     * @param {string} [userAgent=null] - Agente de usuario
     * @returns {Promise<Object>} - Registro de auditoría
     */
    async logBulkUpload(userId, uploadDetails, ipAddress = null, userAgent = null) {
        const details = {
            ...uploadDetails,
            customDescription: 'Carga masiva de prestadores'
        };

        return this.logAction(
            userId,
            OPERATION_TYPES.BULK_UPLOAD,
            ENTITY_TYPES.PROVIDER,
            'bulk-upload',
            details,
            ipAddress,
            userAgent
        );
    },

    /**
     * Registra una descarga de cartilla en formato CSV
     * @async
     * @param {number} userId - ID del usuario
     * @param {Object} filters - Filtros aplicados a la descarga
     * @param {string} [ipAddress=null] - Dirección IP
     * @param {string} [userAgent=null] - Agente de usuario
     * @returns {Promise<Object>} - Registro de auditoría
     */
    async logCartillaCSVDownload(userId, filters = {}, ipAddress = null, userAgent = null) {
        const details = {
            filters,
            format: 'CSV',
            customDescription: 'Descarga de cartilla en formato CSV'
        };

        return this.logAction(
            userId,
            OPERATION_TYPES.DOWNLOAD_CSV,
            ENTITY_TYPES.CARTILLA,
            'csv-export',
            details,
            ipAddress,
            userAgent
        );
    },

    /**
     * Registra una descarga de cartilla en formato PDF
     * @async
     * @param {number} userId - ID del usuario
     * @param {Object} filters - Filtros aplicados a la descarga
     * @param {string} [ipAddress=null] - Dirección IP
     * @param {string} [userAgent=null] - Agente de usuario
     * @returns {Promise<Object>} - Registro de auditoría
     */
    async logCartillaPDFDownload(userId, filters = {}, ipAddress = null, userAgent = null) {
        const details = {
            filters,
            format: 'PDF',
            customDescription: 'Descarga de cartilla en formato PDF'
        };

        return this.logAction(
            userId,
            OPERATION_TYPES.DOWNLOAD_PDF,
            ENTITY_TYPES.CARTILLA,
            'pdf-export',
            details,
            ipAddress,
            userAgent
        );
    },

    /**
     * Registra la edición de un prestador
     * @async
     * @param {number} userId - ID del usuario
     * @param {number|string} prestadorId - ID del prestador
     * @param {Object} originalData - Datos originales
     * @param {Object} newData - Nuevos datos
     * @param {string} [ipAddress=null] - Dirección IP
     * @param {string} [userAgent=null] - Agente de usuario
     * @returns {Promise<Object>} - Registro de auditoría
     */
    async logProviderEdit(userId, prestadorId, originalData, newData, ipAddress = null, userAgent = null) {
        // Calcular cambios entre versiones
        const changes = this.calculateChanges(originalData, newData);

        const details = {
            changes,
            original: originalData,
            new: newData,
            customDescription: 'Edición de prestador'
        };

        return this.logAction(
            userId,
            OPERATION_TYPES.EDIT_PROVIDER,
            ENTITY_TYPES.PROVIDER,
            prestadorId,
            details,
            ipAddress,
            userAgent
        );
    },

    /**
     * Registra operaciones en planes (crear, editar, habilitar, deshabilitar)
     * @async
     * @param {number} userId - ID del usuario
     * @param {string} operation - Tipo de operación
     * @param {number|string} planId - ID del plan
     * @param {Object} planData - Datos del plan
     * @param {Object} [originalData=null] - Datos originales (para edición)
     * @param {string} [ipAddress=null] - Dirección IP
     * @param {string} [userAgent=null] - Agente de usuario
     * @returns {Promise<Object>} - Registro de auditoría
     */
    async logPlanOperation(userId, operation, planId, planData, originalData = null, ipAddress = null, userAgent = null) {
        let details = {
            planData,
            customDescription: this.getOperationDescription(operation, ENTITY_TYPES.PLAN)
        };

        // Si es edición, calcular cambios
        if (operation === OPERATION_TYPES.EDIT_PLAN && originalData) {
            details.changes = this.calculateChanges(originalData, planData);
            details.original = originalData;
        }

        return this.logAction(
            userId,
            operation,
            ENTITY_TYPES.PLAN,
            planId,
            details,
            ipAddress,
            userAgent
        );
    },

    /**
     * Registra operaciones en especialidades (crear, editar, habilitar, deshabilitar)
     * @async
     * @param {number} userId - ID del usuario
     * @param {string} operation - Tipo de operación
     * @param {number|string} specialtyId - ID de la especialidad
     * @param {Object} specialtyData - Datos de la especialidad
     * @param {Object} [originalData=null] - Datos originales (para edición)
     * @param {string} [ipAddress=null] - Dirección IP
     * @param {string} [userAgent=null] - Agente de usuario
     * @returns {Promise<Object>} - Registro de auditoría
     */
    async logSpecialtyOperation(userId, operation, specialtyId, specialtyData, originalData = null, ipAddress = null, userAgent = null) {
        let details = {
            specialtyData,
            customDescription: this.getOperationDescription(operation, ENTITY_TYPES.SPECIALTY)
        };

        // Si es edición, calcular cambios
        if (operation === OPERATION_TYPES.EDIT_SPECIALTY && originalData) {
            details.changes = this.calculateChanges(originalData, specialtyData);
            details.original = originalData;
        }

        return this.logAction(
            userId,
            operation,
            ENTITY_TYPES.SPECIALTY,
            specialtyId,
            details,
            ipAddress,
            userAgent
        );
    },

    /**
     * Calcula los cambios entre dos objetos
     * @private
     * @param {Object} original - Datos originales
     * @param {Object} updated - Datos actualizados
     * @returns {Object} - Cambios detectados
     */
    calculateChanges(original, updated) {
        const changes = {};

        // Obtener todas las claves de ambos objetos
        const allKeys = [...new Set([...Object.keys(original || {}), ...Object.keys(updated || {})])];

        for (const key of allKeys) {
            // Verificar si el valor ha cambiado
            if (JSON.stringify(original?.[key]) !== JSON.stringify(updated?.[key])) {
                changes[key] = {
                    from: original?.[key],
                    to: updated?.[key]
                };
            }
        }

        return changes;
    },

    /**
     * Formatea los detalles de un registro de auditoría para mostrar en la API (formato antiguo)
     * @param {Object} auditLog - Registro de auditoría
     * @returns {Object} - Detalles formateados para API
     */
    formatAuditDetails(auditLog) {
        try {
            // Asegurar que tengamos detalles válidos
            const details = typeof auditLog.details === 'string'
                ? JSON.parse(auditLog.details)
                : auditLog.details;

            // Crear una versión simplificada para incluir en respuestas API
            const formattedDetails = {
                description: auditLog.operation_description || details.description || this.getOperationDescription(auditLog.action, auditLog.entity_type),
                timestamp: auditLog.timestamp,
                action: auditLog.action,
                entityType: auditLog.entity_type,
                entityId: auditLog.entity_id,
                // Incluir información contextual relevante
                context: {}
            };

            // Añadir contexto específico según el tipo de operación
            switch (auditLog.action) {
                case OPERATION_TYPES.INDIVIDUAL_UPLOAD:
                    formattedDetails.context.prestadorNombre = details.prestadorData?.nombre || 'No especificado';
                    formattedDetails.context.prestadorTipo = details.prestadorData?.tipo || 'No especificado';
                    break;
                case OPERATION_TYPES.BULK_UPLOAD:
                    formattedDetails.context.registrosProcesados = details.totalProcessed || 0;
                    formattedDetails.context.registrosExitosos = details.successful || 0;
                    formattedDetails.context.registrosFallidos = details.failed || 0;
                    break;
                case OPERATION_TYPES.DOWNLOAD_CSV:
                case OPERATION_TYPES.DOWNLOAD_PDF:
                    formattedDetails.context.formato = details.format || 'No especificado';
                    formattedDetails.context.filtros = details.filters || {};
                    break;
                case OPERATION_TYPES.EDIT_PROVIDER:
                case OPERATION_TYPES.EDIT_PLAN:
                case OPERATION_TYPES.EDIT_SPECIALTY:
                    // Si hay cambios, incluir un resumen de ellos
                    if (details.changes) {
                        formattedDetails.context.cambios = Object.keys(details.changes).map(field => ({
                            campo: field,
                            valorAnterior: this.formatValue(details.changes[field].from),
                            valorNuevo: this.formatValue(details.changes[field].to)
                        }));
                    }
                    break;
                case OPERATION_TYPES.TOGGLE_STATUS:
                    formattedDetails.context.estadoAnterior = details.previousStatus || 'No especificado';
                    formattedDetails.context.estadoNuevo = details.newStatus || 'No especificado';
                    break;
            }

            return formattedDetails;
        } catch (error) {
            console.error('Error formatting audit details:', error);
            return {
                description: 'Error al formatear detalles de auditoría',
                timestamp: auditLog.timestamp,
                action: auditLog.action,
                entityType: auditLog.entity_type
            };
        }
    },

    /**
     * Formatea un valor para mostrarlo de forma amigable
     * @private
     * @param {*} value - Valor a formatear
     * @returns {string} - Valor formateado
     */
    formatValue(value) {
        if (value === undefined || value === null) {
            return 'No especificado';
        }

        if (typeof value === 'object') {
            return JSON.stringify(value);
        }

        return String(value);
    },

    /**
     * Formatea los nombres de campos según la tabla de origen
     * @param {string} field - Nombre del campo
     * @param {string} entityType - Tipo de entidad
     * @returns {string} - Nombre de campo formateado
     */
    getFieldDisplayName(field, entityType) {
        // Mapeo global de campos
        const fieldLabels = {
            'nombre': 'Nombre',
            'estado': 'Estado',
            'email': 'Email',
            'telefonos': 'Teléfonos',
            'direccion': 'Dirección',
            'informacion_adicional': 'Información adicional',
            'id_localidad': 'ID Localidad',
            'localidad': 'Localidad',
            'id_provincia': 'ID Provincia',
            'provincia': 'Provincia',
            'plan': 'Plan',
            'planes': 'Planes',
            'categoria_prestador': 'Categoría',
            'categorias': 'Categorías',
            'especialidad': 'Especialidad',
            'especialidades': 'Especialidades',
            'previousStatus': 'Estado anterior',
            'newStatus': 'Nuevo estado'
        };

        // Mapeos específicos por tipo de entidad
        const entityFieldMappings = {
            'prestadores': {
                'id_prestador': 'ID Prestador',
                // otros campos específicos...
            },
            'planes': {
                'id_plan': 'ID Plan',
                'oldName': 'Nombre anterior',
                'newName': 'Nuevo nombre'
            },
            'especialidades': {
                'id_especialidad': 'ID Especialidad'
            },
            'categorias_prestador': {
                'id_categoria': 'ID Categoría'
            }
        };

        // Primero buscar en el mapeo específico de la entidad
        if (entityType && entityFieldMappings[entityType] && entityFieldMappings[entityType][field]) {
            return entityFieldMappings[entityType][field];
        }

        // Si no se encuentra, usar el mapeo global
        return fieldLabels[field] || field;
    },

    /**
     * Formatea un array de relaciones para mostrar solo los nombres relevantes
     * @param {Array} array - Array de relaciones (planes, especialidades, etc.)
     * @param {string} nameField - Campo que contiene el nombre
     * @returns {string} - Nombres separados por comas
     */
    formatRelationshipArray(array, nameField = 'nombre') {
        if (!Array.isArray(array) || array.length === 0) return null;

        // Intentar obtener el nombre de diferentes posibles campos
        return array.map(item => {
            if (item[nameField]) return item[nameField];
            if (item['plan_nombre']) return item['plan_nombre'];
            if (item['categoria_nombre']) return item['categoria_nombre'];
            if (item['especialidad_nombre']) return item['especialidad_nombre'];
            return item.id || item;
        }).join(', ');
    },

    /**
     * Obtiene el nombre de la entidad para mostrar
     * @param {Object} auditLog - Registro de auditoría
     * @param {Object} details - Detalles del registro
     * @returns {string|null} - Nombre de la entidad o null si no se encuentra
     */
    getEntityName(auditLog, details) {
        // Intentar obtener el nombre de varias posibles fuentes
        if (details?.original?.nombre) {
            return details.original.nombre;
        }

        if (details?.prestadorData?.nombre) {
            return details.prestadorData.nombre;
        }

        if (details?.result?.nombre) {
            return details.result.nombre;
        }

        if (details?.requestData?.nombre) {
            return details.requestData.nombre;
        }

        if (details?.new?.prestador?.nombre) {
            return details.new.prestador.nombre;
        }

        // Si no se encuentra en ningún lugar, devolver null
        return null;
    },

    /**
     * Formatea los detalles de auditoría de manera estandarizada y optimizada para la API
     */
    formatAuditDetailsOptimized(auditLog) {
        try {
            const details = typeof auditLog.details === 'string'
                ? JSON.parse(auditLog.details)
                : auditLog.details;

            // Estructura base estandarizada
            const result = {
                id: auditLog.id,
                timestamp: auditLog.timestamp,
                action: auditLog.action,
                description: auditLog.operation_description || details?.description,

                user: {
                    id: auditLog.user_id,
                    username: auditLog.user?.username || 'Usuario desconocido',
                    role: auditLog.user?.role || 'Usuario'
                },

                entity: {
                    type: auditLog.entity_type,
                    id: auditLog.entity_id,
                    name: this.getEntityName(auditLog, details)
                },

                changes: []
            };

            // Información técnica
            if (details?.ipAddress || details?.userAgent) {
                result.technical = {
                    ipAddress: details.ipAddress || null,
                    userAgent: details.userAgent || null
                };
            }

            // Manejar según tipo de entidad y acción
            if (auditLog.entity_type === 'prestadores') {
                result.changes = this.formatPrestadorChanges(auditLog.action, details);
            }
            else if (auditLog.entity_type === 'planes') {
                result.changes = this.formatPlanChanges(auditLog.action, details);
            }
            else if (auditLog.entity_type === 'especialidades') {
                result.changes = this.formatEspecialidadChanges(auditLog.action, details);
            }
            else if (auditLog.entity_type === 'categorias_prestador') {
                result.changes = this.formatCategoriaChanges(auditLog.action, details);
            }
            else {
                // Formato genérico para otros tipos de entidades
                result.changes = this.formatGenericChanges(auditLog.action, details);
            }

            return result;
        } catch (error) {
            console.error('Error formatting optimized audit details:', error);
            return {
                id: auditLog.id,
                timestamp: auditLog.timestamp,
                description: 'Error al formatear detalles de auditoría',
                action: auditLog.action,
                entity: {
                    type: auditLog.entity_type,
                    id: auditLog.entity_id
                },
                changes: []
            };
        }
    },

    /**
     * Formatea los cambios para un prestador
     */
    formatPrestadorChanges(action, details) {
        const changes = [];

        switch (action) {
            case 'create':
                // Para creación de prestador
                if (details.prestadorData) {
                    // Campos básicos
                    const basicFields = ['nombre', 'direccion', 'telefonos', 'email', 'informacion_adicional', 'estado'];
                    basicFields.forEach(field => {
                        if (details.prestadorData[field]) {
                            changes.push({
                                field,
                                label: this.getFieldDisplayName(field, 'prestadores'),
                                oldValue: null,
                                newValue: details.prestadorData[field]
                            });
                        }
                    });

                    // Relaciones
                    if (details.prestadorData.registros_creados && details.prestadorData.registros_creados.length > 0) {
                        const registro = details.prestadorData.registros_creados[0];

                        if (registro.plan) {
                            changes.push({
                                field: 'planes',
                                label: this.getFieldDisplayName('planes', 'prestadores'),
                                oldValue: null,
                                newValue: registro.plan,
                                isArray: true
                            });
                        }

                        if (registro.especialidad) {
                            changes.push({
                                field: 'especialidades',
                                label: this.getFieldDisplayName('especialidades', 'prestadores'),
                                oldValue: null,
                                newValue: registro.especialidad,
                                isArray: true
                            });
                        }
                    }
                }
                break;

            case 'edit_provider':
                // Para edición de prestador
                if (details.original && details.new && details.new.prestador) {
                    const original = details.original;
                    const newData = details.new.prestador;

                    // Campos básicos
                    const basicFields = ['nombre', 'direccion', 'telefonos', 'email', 'informacion_adicional', 'estado'];
                    basicFields.forEach(field => {
                        if (original[field] !== newData[field] &&
                            !(original[field] === '' && newData[field] === '') &&
                            !(original[field] === null && newData[field] === null)) {
                            changes.push({
                                field,
                                label: this.getFieldDisplayName(field, 'prestadores'),
                                oldValue: original[field],
                                newValue: newData[field]
                            });
                        }
                    });

                    // Relaciones
                    const relationFields = ['planes', 'categorias', 'especialidades'];
                    relationFields.forEach(field => {
                        const oldArray = original[field];
                        const newArray = newData[field];

                        if (!oldArray || !newArray) return;

                        const oldValue = this.formatRelationshipArray(oldArray);
                        const newValue = this.formatRelationshipArray(newArray);

                        if (oldValue !== newValue) {
                            changes.push({
                                field,
                                label: this.getFieldDisplayName(field, 'prestadores'),
                                oldValue,
                                newValue,
                                isArray: true
                            });
                        }
                    });
                }
                break;

            case 'toggleStatus':
                // Para cambio de estado
                if (details.previousStatus !== undefined && details.newStatus !== undefined) {
                    changes.push({
                        field: 'estado',
                        label: this.getFieldDisplayName('estado', 'prestadores'),
                        oldValue: details.previousStatus,
                        newValue: details.newStatus
                    });
                }
                break;
        }

        return changes;
    },

    /**
     * Formatea los cambios para un plan
     */
    formatPlanChanges(action, details) {
        const changes = [];

        switch (action) {
            case 'create':
                // Para creación de plan
                if (details.result) {
                    changes.push({
                        field: 'nombre',
                        label: this.getFieldDisplayName('nombre', 'planes'),
                        oldValue: null,
                        newValue: details.result.nombre || details.requestData?.nombre
                    });

                    if (details.result.estado) {
                        changes.push({
                            field: 'estado',
                            label: this.getFieldDisplayName('estado', 'planes'),
                            oldValue: null,
                            newValue: details.result.estado
                        });
                    }
                }
                break;

            case 'update':
                // Para actualización de plan
                if (details.result && details.result.oldName && details.result.newName) {
                    changes.push({
                        field: 'nombre',
                        label: this.getFieldDisplayName('nombre', 'planes'),
                        oldValue: details.result.oldName,
                        newValue: details.result.newName
                    });
                } else if (details.requestData) {
                    Object.entries(details.requestData).forEach(([field, value]) => {
                        if (field !== 'id') {
                            changes.push({
                                field,
                                label: this.getFieldDisplayName(field, 'planes'),
                                oldValue: null, // No disponible
                                newValue: value
                            });
                        }
                    });
                }
                break;

            case 'toggleStatus':
                // Para cambio de estado
                if (details.previousStatus !== undefined && details.newStatus !== undefined) {
                    changes.push({
                        field: 'estado',
                        label: this.getFieldDisplayName('estado', 'planes'),
                        oldValue: details.previousStatus,
                        newValue: details.newStatus
                    });
                }
                break;
        }

        return changes;
    },

    /**
     * Formatea cambios para especialidades y categorías (similar estructura)
     */
    formatEspecialidadChanges(action, details) {
        return this.formatSimpleEntityChanges(action, details, 'especialidades');
    },

    formatCategoriaChanges(action, details) {
        return this.formatSimpleEntityChanges(action, details, 'categorias_prestador');
    },

    /**
     * Formatea cambios para entidades simples (especialidades, categorías)
     */
    formatSimpleEntityChanges(action, details, entityType) {
        const changes = [];

        switch (action) {
            case 'create':
                if (details.result) {
                    changes.push({
                        field: 'nombre',
                        label: this.getFieldDisplayName('nombre', entityType),
                        oldValue: null,
                        newValue: details.result.nombre || details.requestData?.nombre
                    });

                    if (details.result.estado) {
                        changes.push({
                            field: 'estado',
                            label: this.getFieldDisplayName('estado', entityType),
                            oldValue: null,
                            newValue: details.result.estado
                        });
                    }
                }
                break;

            case 'update':
                if (details.result && details.result.oldName && details.result.newName) {
                    changes.push({
                        field: 'nombre',
                        label: this.getFieldDisplayName('nombre', entityType),
                        oldValue: details.result.oldName,
                        newValue: details.result.newName
                    });
                }
                break;

            case 'toggleStatus':
                if (details.previousStatus !== undefined && details.newStatus !== undefined) {
                    changes.push({
                        field: 'estado',
                        label: this.getFieldDisplayName('estado', entityType),
                        oldValue: details.previousStatus,
                        newValue: details.newStatus
                    });
                }
                break;
        }

        return changes;
    },

    /**
     * Formatea cambios para entidades genéricas
     */
    formatGenericChanges(action, details) {
        // Código genérico similar al anterior para manejar cualquier otro tipo de entidad
        const changes = [];

        // Extraer cambios desde varias fuentes posibles
        if (details.changes) {
            Object.entries(details.changes).forEach(([field, change]) => {
                if (field !== 'id') {
                    changes.push({
                        field,
                        label: this.getFieldDisplayName(field),
                        oldValue: change.from,
                        newValue: change.to
                    });
                }
            });
        }
        else if (details.requestData) {
            Object.entries(details.requestData).forEach(([field, value]) => {
                if (field !== 'id') {
                    changes.push({
                        field,
                        label: this.getFieldDisplayName(field),
                        oldValue: action === 'create' ? null : 'No disponible',
                        newValue: value
                    });
                }
            });
        }

        return changes;
    }
}

module.exports = auditLogger;