const AuditRepository = require('../repositories/auditRepository');
const userRepository = require('../repositories/userRepository');
const auditLogger = require('../utils/auditLogger');

const AuditController = {
    async getLogs(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;

            // Obtener filtros de la consulta
            const { startDate, endDate, action, entityType } = req.query;

            // Determinar qué método de repositorio usar según los filtros
            let logs;
            let totalCount;

            if (startDate && endDate) {
                logs = await AuditRepository.getLogsByDateRange(startDate, endDate, limit, offset);
                // Falta implementar conteo para filtro de fecha
                totalCount = logs.length; // Temporal
            } else if (action) {
                logs = await AuditRepository.getLogsByAction(action, limit, offset);
                totalCount = await AuditRepository.getLogCountByAction(action);
            } else if (entityType) {
                logs = await AuditRepository.getLogsByEntity(entityType, limit, offset);
                totalCount = await AuditRepository.getLogCountByEntity(entityType);
            } else {
                logs = await AuditRepository.getLogs(limit, offset);
                totalCount = await AuditRepository.getLogCount();
            }

            // Enriquecer los datos con información de usuario si es posible
            const enrichedLogs = await enrichLogsWithUserInfo(logs);

            // Formatear los detalles para respuesta API - USANDO EL NUEVO FORMATO OPTIMIZADO
            const formattedLogs = enrichedLogs.map(log =>
                auditLogger.formatAuditDetailsOptimized(log)
            );

            res.status(200).json({
                success: true,
                data: formattedLogs,
                pagination: {
                    total: totalCount,
                    limit,
                    offset,
                    hasMore: offset + limit < totalCount
                }
            });
        } catch (error) {
            console.error('Error al obtener logs de auditoría:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener registros de auditoría'
            });
        }
    },

    async getLogsByEntity(req, res) {
        try {
            const { entityType } = req.params;
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;

            const logs = await AuditRepository.getLogsByEntity(entityType, limit, offset);
            const totalCount = await AuditRepository.getLogCountByEntity(entityType);

            // Enriquecer los datos con información de usuario si es posible
            const enrichedLogs = await enrichLogsWithUserInfo(logs);

            // Formatear los detalles para respuesta API - USANDO EL NUEVO FORMATO OPTIMIZADO
            const formattedLogs = enrichedLogs.map(log =>
                auditLogger.formatAuditDetailsOptimized(log)
            );

            res.status(200).json({
                success: true,
                data: formattedLogs,
                pagination: {
                    total: totalCount,
                    limit,
                    offset,
                    hasMore: offset + limit < totalCount
                }
            });
        } catch (error) {
            console.error('Error al obtener logs por entidad:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener registros de auditoría'
            });
        }
    },

    async getLogsByAction(req, res) {
        try {
            const { action } = req.params;
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;

            // Validar que la acción sea válida
            const validActions = Object.values(auditLogger.OPERATION_TYPES);

            if (!validActions.includes(action)) {
                return res.status(400).json({
                    success: false,
                    error: `Acción no válida. Las acciones permitidas son: ${validActions.join(', ')}`
                });
            }

            const logs = await AuditRepository.getLogsByAction(action, limit, offset);
            const totalCount = await AuditRepository.getLogCountByAction(action);

            // Enriquecer los datos con información de usuario si es posible
            const enrichedLogs = await enrichLogsWithUserInfo(logs);

            // Formatear los detalles para respuesta API - USANDO EL NUEVO FORMATO OPTIMIZADO
            const formattedLogs = enrichedLogs.map(log =>
                auditLogger.formatAuditDetailsOptimized(log)
            );

            res.status(200).json({
                success: true,
                data: formattedLogs,
                pagination: {
                    total: totalCount,
                    limit,
                    offset,
                    hasMore: offset + limit < totalCount
                }
            });
        } catch (error) {
            console.error('Error al obtener logs por acción:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener registros de auditoría'
            });
        }
    },

    async getLogsByUser(req, res) {
        try {
            const { userId } = req.params;
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;

            // Validar que el ID de usuario sea un número
            const userIdNum = parseInt(userId);
            if (isNaN(userIdNum)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de usuario no válido'
                });
            }

            const logs = await AuditRepository.getLogsByUser(userIdNum, limit, offset);

            // Obtener información del usuario
            let userInfo = null;
            try {
                const user = await require('../repositories/userRepository').userRepository.getUserById(userIdNum);
                if (user) {
                    userInfo = {
                        id: user.id,
                        username: user.username,
                        role: user.role
                    };
                }
            } catch (error) {
                console.error('Error al obtener información del usuario:', error);
            }

            // Formatear los detalles para respuesta API - USANDO EL NUEVO FORMATO OPTIMIZADO
            const formattedLogs = logs.map(log =>
                auditLogger.formatAuditDetailsOptimized(log)
            );

            res.status(200).json({
                success: true,
                data: formattedLogs,
                user: userInfo,
                pagination: {
                    limit,
                    offset,
                    count: logs.length
                }
            });
        } catch (error) {
            console.error('Error al obtener logs por usuario:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener registros de auditoría'
            });
        }
    },

    async getLogsByEntityId(req, res) {
        try {
            const { entityType, entityId } = req.params;
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;

            // Validar que el ID de entidad sea un número
            const entityIdNum = parseInt(entityId);
            if (isNaN(entityIdNum)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de entidad no válido'
                });
            }

            const logs = await AuditRepository.getLogsByEntityId(entityType, entityIdNum, limit, offset);

            // Enriquecer los datos con información de usuario si es posible
            const enrichedLogs = await enrichLogsWithUserInfo(logs);

            // Formatear los detalles para respuesta API - USANDO EL NUEVO FORMATO OPTIMIZADO
            const formattedLogs = enrichedLogs.map(log =>
                auditLogger.formatAuditDetailsOptimized(log)
            );

            res.status(200).json({
                success: true,
                data: formattedLogs,
                pagination: {
                    limit,
                    offset,
                    count: logs.length
                }
            });
        } catch (error) {
            console.error('Error al obtener logs por ID de entidad:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener registros de auditoría'
            });
        }
    },

    async getLogsByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;

            // Validar que las fechas sean válidas
            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    error: 'Se requieren fechas de inicio y fin'
                });
            }

            // Validar formato de fechas
            const startDateObj = new Date(startDate);
            const endDateObj = new Date(endDate);

            if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: 'Formato de fecha no válido. Use ISO 8601 (YYYY-MM-DD)'
                });
            }

            // Asegurar que la fecha de fin sea el final del día
            endDateObj.setHours(23, 59, 59, 999);

            const logs = await AuditRepository.getLogsByDateRange(
                startDateObj.toISOString(),
                endDateObj.toISOString(),
                limit,
                offset
            );

            // Enriquecer los datos con información de usuario si es posible
            const enrichedLogs = await enrichLogsWithUserInfo(logs);

            // Formatear los detalles para respuesta API - USANDO EL NUEVO FORMATO OPTIMIZADO
            const formattedLogs = enrichedLogs.map(log =>
                auditLogger.formatAuditDetailsOptimized(log)
            );

            res.status(200).json({
                success: true,
                data: formattedLogs,
                pagination: {
                    limit,
                    offset,
                    count: logs.length
                },
                dateRange: {
                    startDate: startDateObj.toISOString(),
                    endDate: endDateObj.toISOString()
                }
            });
        } catch (error) {
            console.error('Error al obtener logs por rango de fechas:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener registros de auditoría'
            });
        }
    },

    async getAuditSummary(req, res) {
        try {
            // Obtener conteos generales
            const totalLogs = await AuditRepository.getLogCount();

            // Obtener conteos por tipo de operación
            const createCount = await AuditRepository.getLogCountByAction(auditLogger.OPERATION_TYPES.CREATE);
            const updateCount = await AuditRepository.getLogCountByAction(auditLogger.OPERATION_TYPES.UPDATE);
            const deleteCount = await AuditRepository.getLogCountByAction(auditLogger.OPERATION_TYPES.DELETE);
            const individualUploadCount = await AuditRepository.getLogCountByAction(auditLogger.OPERATION_TYPES.INDIVIDUAL_UPLOAD);
            const bulkUploadCount = await AuditRepository.getLogCountByAction(auditLogger.OPERATION_TYPES.BULK_UPLOAD);
            const downloadCsvCount = await AuditRepository.getLogCountByAction(auditLogger.OPERATION_TYPES.DOWNLOAD_CSV);
            const downloadPdfCount = await AuditRepository.getLogCountByAction(auditLogger.OPERATION_TYPES.DOWNLOAD_PDF);

            // Obtener los últimos 5 registros
            const recentLogs = await AuditRepository.getLogs(5, 0);
            const enrichedRecentLogs = await enrichLogsWithUserInfo(recentLogs);

            // Formatear los detalles para respuesta API - USANDO EL NUEVO FORMATO OPTIMIZADO
            const formattedRecentLogs = enrichedRecentLogs.map(log =>
                auditLogger.formatAuditDetailsOptimized(log)
            );

            res.status(200).json({
                success: true,
                data: {
                    totalLogs,
                    actionCounts: {
                        create: createCount,
                        update: updateCount,
                        delete: deleteCount,
                        individualUpload: individualUploadCount,
                        bulkUpload: bulkUploadCount,
                        downloadCsv: downloadCsvCount,
                        downloadPdf: downloadPdfCount
                    },
                    recentLogs: formattedRecentLogs
                }
            });
        } catch (error) {
            console.error('Error al obtener resumen de auditoría:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener resumen de auditoría'
            });
        }
    },

    /**
     * Exporta registros de auditoría a un archivo CSV
     * @async
     * @param {Object} req - Objeto de solicitud Express
     * @param {Object} res - Objeto de respuesta Express
     */
    async exportLogsToCSV(req, res) {
        try {
            // Obtener filtros
            const { startDate, endDate, action, entityType } = req.query;
            const limit = parseInt(req.query.limit) || 1000; // Permitir exportar más registros

            // Determinar qué registros exportar
            let logs;
            if (startDate && endDate) {
                const startDateObj = new Date(startDate);
                const endDateObj = new Date(endDate);
                endDateObj.setHours(23, 59, 59, 999);

                logs = await AuditRepository.getLogsByDateRange(
                    startDateObj.toISOString(),
                    endDateObj.toISOString(),
                    limit,
                    0
                );
            } else if (action) {
                logs = await AuditRepository.getLogsByAction(action, limit, 0);
            } else if (entityType) {
                logs = await AuditRepository.getLogsByEntity(entityType, limit, 0);
            } else {
                logs = await AuditRepository.getLogs(limit, 0);
            }

            // Enriquecer los datos con información de usuario
            const enrichedLogs = await enrichLogsWithUserInfo(logs);

            // Formatear los logs para la exportación usando el formato optimizado
            const formattedLogs = enrichedLogs.map(log =>
                auditLogger.formatAuditDetailsOptimized(log)
            );

            // Generar CSV
            const csvData = generateCsvData(formattedLogs);

            // Configurar cabeceras
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');

            // Enviar datos
            res.status(200).send(csvData);

            // Registrar la exportación
            await auditLogger.logAction(
                req.user?.id || 0,
                auditLogger.OPERATION_TYPES.DOWNLOAD_CSV,
                'audit_logs',
                'export',
                {
                    filters: { startDate, endDate, action, entityType },
                    count: logs.length,
                    format: 'CSV',
                    customDescription: 'Exportación de registros de auditoría a CSV'
                },
                req.ip,
                req.get('User-Agent')
            );
        } catch (error) {
            console.error('Error al exportar logs a CSV:', error);
            res.status(500).json({
                success: false,
                error: 'Error al exportar registros de auditoría'
            });
        }
    },

    /**
     * Borra registros de auditoría más antiguos que cierta fecha
     * Solo disponible para administradores
     * @async
     * @param {Object} req - Objeto de solicitud Express
     * @param {Object} res - Objeto de respuesta Express
     */
    async purgeOldLogs(req, res) {
        try {
            // Verificar si el usuario tiene permisos de administrador
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'No tiene permisos para realizar esta acción'
                });
            }

            const { olderThanDays } = req.body;

            // Validar que se proporcione un número válido de días
            if (!olderThanDays || !Number.isInteger(Number(olderThanDays)) || olderThanDays < 30) {
                return res.status(400).json({
                    success: false,
                    error: 'Debe proporcionar un número válido de días (mínimo 30)'
                });
            }

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

            // Ejecutar la purga
            const [result] = await pool.query(
                'DELETE FROM audit_logs WHERE timestamp < ?',
                [cutoffDate.toISOString()]
            );

            const deletedCount = result.affectedRows;

            // Registrar la acción
            await auditLogger.logAction(
                req.user.id,
                'purge',
                'audit_logs',
                'system',
                {
                    olderThanDays,
                    cutoffDate: cutoffDate.toISOString(),
                    deletedCount,
                    customDescription: `Purga de ${deletedCount} registros de auditoría más antiguos que ${olderThanDays} días`
                },
                req.ip,
                req.get('User-Agent')
            );

            res.status(200).json({
                success: true,
                message: `Se han eliminado ${deletedCount} registros de auditoría`,
                data: {
                    deletedCount,
                    cutoffDate: cutoffDate.toISOString()
                }
            });
        } catch (error) {
            console.error('Error al purgar registros antiguos:', error);
            res.status(500).json({
                success: false,
                error: 'Error al purgar registros de auditoría'
            });
        }
    }
};

// Función auxiliar para enriquecer logs con información de usuario
async function enrichLogsWithUserInfo(logs) {
    // Crear un mapa para cachear información de usuarios
    const userCache = new Map();

    // Obtener IDs de usuario únicos
    const userIds = [...new Set(logs.map(log => log.user_id))];

    // Obtener información de usuarios en batch si es posible
    for (const userId of userIds) {
        try {
            if (!userCache.has(userId)) {
                const user = await require('../repositories/userRepository').userRepository.getUserById(userId);
                if (user) {
                    userCache.set(userId, {
                        id: user.id,
                        username: user.username,
                        role: user.role
                    });
                }
            }
        } catch (error) {
            console.error(`Error al obtener información del usuario ${userId}:`, error);
        }
    }

    // Enriquecer logs con información de usuario
    return logs.map(log => {
        const userInfo = userCache.get(log.user_id) || { username: 'Unknown' };
        return {
            ...log,
            user: userInfo
        };
    });
}

/**
 * Genera datos CSV a partir de registros de auditoría optimizados
 * @param {Array} logs - Registros de auditoría en formato optimizado
 * @returns {string} - Datos CSV
 */
function generateCsvData(logs) {
    // Definir cabeceras
    const headers = [
        'ID',
        'Fecha',
        'Usuario',
        'Rol',
        'Acción',
        'Descripción',
        'Entidad',
        'ID Entidad',
        'Campos Modificados',
        'Detalles'
    ];

    // Convertir registros a filas CSV
    const rows = logs.map(log => {
        // Formatear cambios para CSV
        let changesStr = '';
        if (log.changes && log.changes.length > 0) {
            changesStr = log.changes.map(change =>
                `${change.label}: ${change.oldValue || ''} → ${change.newValue || ''}`
            ).join('; ');
        }

        return [
            log.id,
            new Date(log.timestamp).toISOString(),
            log.user.username || 'Usuario desconocido',
            log.user.role || 'No especificado',
            log.action,
            log.description,
            log.entity.type,
            log.entity.id,
            changesStr,
            log.technical ? `IP: ${log.technical.ipAddress || 'No registrada'}` : ''
        ];
    });

    // Unir todo en un string CSV
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell =>
            // Encerrar en comillas y escapar comillas internas
            `"${String(cell || '').replace(/"/g, '""')}"`
        ).join(','))
    ].join('\n');

    return csvContent;
}

module.exports = AuditController;