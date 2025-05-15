/**
 * @module utils/auditLogger
 * @description Utilidad para registrar eventos de auditoría en la base de datos
 */

const { pool } = require('../config/db');

/**
 * Objeto que proporciona métodos para registrar acciones de auditoría
 * @type {Object}
 */
const auditLogger = {
    /**
     * Registra una acción en el sistema de auditoría
     * @async
     * @param {number} userId - ID del usuario que realizó la acción
     * @param {string} action - Tipo de acción (create, update, delete, toggleStatus, etc.)
     * @param {string} entityType - Tipo de entidad afectada
     * @param {number|string} entityId - ID de la entidad afectada
     * @param {Object} details - Detalles adicionales de la acción
     * @param {string} [details.actionType] - Tipo específico de acción (individual, masiva, etc.)
     * @param {Object} [details.previousData] - Datos previos (para updates)
     * @param {Object} [details.newData] - Datos nuevos
     * @param {Array} [details.changes] - Lista de campos modificados
     * @param {string} [details.format] - Formato de exportación (pdf, csv)
     * @param {Object} [details.filters] - Filtros aplicados en consultas
     * @returns {Promise<void>} - Promesa que se resuelve cuando se completa el registro
     */
    async logAction(userId, action, entityType, entityId, details) {
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

            // Enriquecer los detalles con información adicional
            const enrichedDetails = {
                ...details,
                timestamp: new Date().toISOString(),
                userAgent: details.userAgent || null,
                ip: details.ip || null
            };

            await pool.query(
                'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, timestamp) VALUES (?, ?, ?, ?, ?, NOW())',
                [userId, action, entityType, formattedEntityId, JSON.stringify(enrichedDetails)]
            );

            console.log(`[AUDIT] User ${userId} performed ${action} on ${entityType} ${entityId}${details.actionType ? ` (${details.actionType})` : ''}`);
        } catch (error) {
            console.error('Error logging audit trail:', error);
            // No propagamos el error para no interrumpir la operación principal
        }
    },

    /**
     * Registra una carga individual de prestador
     */
    async logPrestadorCreation(userId, prestadorId, prestadorData, ip) {
        await this.logAction(
            userId,
            'create_prestador',
            'prestadores',
            prestadorId,
            {
                actionType: 'individual',
                prestadorData,
                ip
            }
        );
    },

    /**
     * Registra una carga masiva de prestadores
     */
    async logMassiveUpload(userId, uploadDetails, ip) {
        await this.logAction(
            userId,
            'create_prestador',
            'prestadores',
            'bulk',
            {
                actionType: 'masiva',
                filename: uploadDetails.filename,
                totalRecords: uploadDetails.totalProcessed,
                successful: uploadDetails.successful || 0,
                failed: uploadDetails.failed || 0,
                fileSize: uploadDetails.fileSize,
                ip
            }
        );
    },

    /**
     * Registra edición de prestador con detalles de los cambios
     */
    async logPrestadorEdit(userId, prestadorId, previousData, newData, ip) {
        // Identificar campos modificados
        const changes = [];
        Object.keys(newData).forEach(key => {
            if (previousData[key] !== newData[key]) {
                changes.push({
                    field: key,
                    oldValue: previousData[key],
                    newValue: newData[key]
                });
            }
        });

        await this.logAction(
            userId,
            'update_prestador',
            'prestadores',
            prestadorId,
            {
                actionType: 'individual',
                changes,
                fieldsModified: changes.length,
                previousData,
                newData,
                ip
            }
        );
    },

    /**
     * Registra descarga de cartilla
     */
    async logCartillaDownload(userId, format, filters, ip, additionalInfo = {}) {
        await this.logAction(
            userId,
            'download_cartilla',
            'cartilla',
            'export',
            {
                actionType: 'download',
                format, // 'pdf' o 'csv'
                filters,
                ...additionalInfo,
                ip
            }
        );
    },

    /**
     * Registra cambios en planes con tipo específico de acción
     */
    async logPlanAction(userId, action, planId, planData, ip, previousData = null) {
        const actionTypes = {
            'create': 'creacion',
            'update': 'edicion',
            'delete': 'eliminacion',
            'enable': 'habilitacion',
            'disable': 'deshabilitacion'
        };

        let details = {
            actionType: actionTypes[action] || action,
            planData,
            ip
        };

        // Para ediciones, incluir cambios específicos
        if (action === 'update' && previousData) {
            const changes = [];
            Object.keys(planData).forEach(key => {
                if (previousData[key] !== planData[key]) {
                    changes.push({
                        field: key,
                        oldValue: previousData[key],
                        newValue: planData[key]
                    });
                }
            });
            details.changes = changes;
            details.fieldsModified = changes.length;
        }

        await this.logAction(
            userId,
            `${action}_plan`,
            'planes',
            planId,
            details
        );
    },

    /**
     * Registra cambios en especialidades con tipo específico de acción
     */
    async logEspecialidadAction(userId, action, especialidadId, especialidadData, ip, previousData = null) {
        const actionTypes = {
            'create': 'creacion',
            'update': 'edicion',
            'delete': 'eliminacion',
            'enable': 'habilitacion',
            'disable': 'deshabilitacion'
        };

        let details = {
            actionType: actionTypes[action] || action,
            especialidadData,
            ip
        };

        // Para ediciones, incluir cambios específicos
        if (action === 'update' && previousData) {
            const changes = [];
            Object.keys(especialidadData).forEach(key => {
                if (previousData[key] !== especialidadData[key]) {
                    changes.push({
                        field: key,
                        oldValue: previousData[key],
                        newValue: especialidadData[key]
                    });
                }
            });
            details.changes = changes;
            details.fieldsModified = changes.length;
        }

        await this.logAction(
            userId,
            `${action}_especialidad`,
            'especialidades',
            especialidadId,
            details
        );
    },

    /**
     * Registra cambios en categorías con tipo específico de acción
     */
    async logCategoriaAction(userId, action, categoriaId, categoriaData, ip, previousData = null) {
        const actionTypes = {
            'create': 'creacion',
            'update': 'edicion',
            'delete': 'eliminacion',
            'enable': 'habilitacion',
            'disable': 'deshabilitacion'
        };

        let details = {
            actionType: actionTypes[action] || action,
            categoriaData,
            ip
        };

        // Para ediciones, incluir cambios específicos
        if (action === 'update' && previousData) {
            const changes = [];
            Object.keys(categoriaData).forEach(key => {
                if (previousData[key] !== categoriaData[key]) {
                    changes.push({
                        field: key,
                        oldValue: previousData[key],
                        newValue: categoriaData[key]
                    });
                }
            });
            details.changes = changes;
            details.fieldsModified = changes.length;
        }

        await this.logAction(
            userId,
            `${action}_categoria`,
            'categorias_prestador',
            categoriaId,
            details
        );
    },

    /**
     * Registra cambios de estado (habilitar/deshabilitar)
     */
    async logStatusChange(userId, entityType, entityId, oldStatus, newStatus, entityData, ip) {
        const action = newStatus === 'Activo' ? 'enable' : 'disable';
        const actionType = newStatus === 'Activo' ? 'habilitacion' : 'deshabilitacion';

        await this.logAction(
            userId,
            `${action}_${entityType}`,
            entityType,
            entityId,
            {
                actionType,
                statusChange: {
                    from: oldStatus,
                    to: newStatus
                },
                entityData,
                ip
            }
        );
    }
};

module.exports = auditLogger;