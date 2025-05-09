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
     * @param {string} action - Tipo de acción (create, update, delete, toggleStatus)
     * @param {string} entityType - Tipo de entidad afectada
     * @param {number|string} entityId - ID de la entidad afectada
     * @param {Object} details - Detalles adicionales de la acción
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

            await pool.query(
                'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, timestamp) VALUES (?, ?, ?, ?, ?, NOW())',
                [userId, action, entityType, formattedEntityId, JSON.stringify(details)]
            );

            console.log(`[AUDIT] User ${userId} performed ${action} on ${entityType} ${entityId}`);
        } catch (error) {
            console.error('Error logging audit trail:', error);
            // No propagamos el error para no interrumpir la operación principal
        }
    }
};

module.exports = auditLogger;