const AuditRepository = require('../repositories/auditRepository');
const userRepository = require('../repositories/userRepository');

const AuditController = {
    async getLogs(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;

            const logs = await AuditRepository.getLogs(limit, offset);
            const totalCount = await AuditRepository.getLogCount();

            // Enriquecer los datos con información de usuario si es posible
            const enrichedLogs = await enrichLogsWithUserInfo(logs);

            res.status(200).json({
                success: true,
                data: enrichedLogs,
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

            res.status(200).json({
                success: true,
                data: enrichedLogs,
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
            if (!['create', 'update', 'delete'].includes(action)) {
                return res.status(400).json({
                    success: false,
                    error: 'Acción no válida. Las acciones permitidas son: create, update, delete'
                });
            }

            const logs = await AuditRepository.getLogsByAction(action, limit, offset);
            const totalCount = await AuditRepository.getLogCountByAction(action);

            // Enriquecer los datos con información de usuario si es posible
            const enrichedLogs = await enrichLogsWithUserInfo(logs);

            res.status(200).json({
                success: true,
                data: enrichedLogs,
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

            res.status(200).json({
                success: true,
                data: logs,
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

            res.status(200).json({
                success: true,
                data: enrichedLogs,
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

            res.status(200).json({
                success: true,
                data: enrichedLogs,
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

            // Obtener conteos por acción
            const createCount = await AuditRepository.getLogCountByAction('create');
            const updateCount = await AuditRepository.getLogCountByAction('update');
            const deleteCount = await AuditRepository.getLogCountByAction('delete');

            // Obtener los últimos 5 registros
            const recentLogs = await AuditRepository.getLogs(5, 0);
            const enrichedRecentLogs = await enrichLogsWithUserInfo(recentLogs);

            res.status(200).json({
                success: true,
                data: {
                    totalLogs,
                    actionCounts: {
                        create: createCount,
                        update: updateCount,
                        delete: deleteCount
                    },
                    recentLogs: enrichedRecentLogs
                }
            });
        } catch (error) {
            console.error('Error al obtener resumen de auditoría:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener resumen de auditoría'
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

module.exports = AuditController;