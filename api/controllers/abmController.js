/**
 * @module controllers/abmController
 * @description Controlador para operaciones CRUD genéricas
 */

const ABMService = require('../services/abmService');
const auditLogger = require('../utils/auditLogger');

/**
 * Maneja errores de forma consistente
 * @param {Object} res - Objeto de respuesta Express
 * @param {Error} error - Error capturado
 * @param {string} entityName - Nombre de la entidad relacionada con el error
 * @returns {Object} - Respuesta HTTP con el error formateado
 */
const handleError = (res, error, entityName) => {
    // Registrar el error completo para depuración interna
    console.error(`Error en operación ${entityName}:`, error);

    // Mensajes de error genéricos para producción
    const genericErrors = {
        'no encontrado': { status: 404, message: 'Recurso no encontrado' },
        'siendo utilizado': { status: 409, message: 'El recurso no puede ser eliminado porque está en uso' },
        'es requerido': { status: 400, message: 'Datos incompletos o inválidos' },
        'Ya existe': { status: 400, message: 'Ya existe un registro con esos datos' },
        'Campo no permitido': { status: 400, message: 'Solicitud inválida' },
        'Tabla no permitida': { status: 400, message: 'Solicitud inválida' },
        'ID inválido': { status: 400, message: 'Identificador inválido' }
    };

    // Buscar un mensaje genérico apropiado
    for (const [key, value] of Object.entries(genericErrors)) {
        if (error.message.includes(key)) {
            return res.status(value.status).json({
                success: false,
                error: value.message,
                // En desarrollo puedes incluir más detalles, en producción omitirlos
                ...(process.env.NODE_ENV === 'development' ? { details: error.message } : {})
            });
        }
    }

    // Error genérico por defecto
    return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
};

/**
 * Controlador para operaciones CRUD genéricas
 * @type {Object}
 */
const ABMController = {
    /**
     * Crea un manejador de operaciones CRUD para una entidad específica
     * @param {string} operation - Tipo de operación (getAll, getById, create, update, delete, toggleStatus)
     * @param {string} entityName - Nombre de la entidad
     * @returns {Function} - Función middleware para Express
     */
    createHandler(operation, entityName) {
        return async (req, res) => {
            try {
                let result;

                switch (operation) {
                    case 'getAll':
                        result = await ABMService.getAll(entityName);
                        return res.status(200).json({ success: true, data: result });

                    case 'getById':
                        result = await ABMService.getById(entityName, req.params.id);
                        return res.status(200).json({ success: true, data: result });

                    case 'create':
                        result = await ABMService.create(entityName, req.body);

                        // Log detallado según el tipo de entidad
                        if (entityName === 'planes') {
                            await auditLogger.logPlanAction(
                                req.user?.id || 0,
                                'create',
                                result.id,
                                req.body,
                                req.ip
                            );
                        } else if (entityName === 'especialidades') {
                            await auditLogger.logEspecialidadAction(
                                req.user?.id || 0,
                                'create',
                                result.id,
                                req.body,
                                req.ip
                            );
                        } else if (entityName === 'categorias') {
                            await auditLogger.logCategoriaAction(
                                req.user?.id || 0,
                                'create',
                                result.id,
                                req.body,
                                req.ip
                            );
                        } else {
                            // Para otros tipos de entidad
                            await auditLogger.logAction(
                                req.user?.id || 0,
                                'create',
                                entityName,
                                result.id,
                                {
                                    actionType: 'creacion',
                                    requestData: req.body,
                                    result,
                                    ip: req.ip
                                }
                            );
                        }
                        return res.status(201).json({ success: true, data: result });

                    case 'update':
                        // Obtener datos previos para el log
                        const previousData = await ABMService.getById(entityName, req.params.id);
                        result = await ABMService.update(entityName, req.params.id, req.body);

                        // Log detallado según el tipo de entidad
                        if (entityName === 'planes') {
                            await auditLogger.logPlanAction(
                                req.user?.id || 0,
                                'update',
                                req.params.id,
                                req.body,
                                req.ip,
                                previousData
                            );
                        } else if (entityName === 'especialidades') {
                            await auditLogger.logEspecialidadAction(
                                req.user?.id || 0,
                                'update',
                                req.params.id,
                                req.body,
                                req.ip,
                                previousData
                            );
                        } else if (entityName === 'categorias') {
                            await auditLogger.logCategoriaAction(
                                req.user?.id || 0,
                                'update',
                                req.params.id,
                                req.body,
                                req.ip,
                                previousData
                            );
                        } else {
                            // Para otros tipos de entidad, usar método genérico con detalles de cambios
                            const changes = [];
                            Object.keys(req.body).forEach(key => {
                                if (previousData[key] !== req.body[key]) {
                                    changes.push({
                                        field: key,
                                        oldValue: previousData[key],
                                        newValue: req.body[key]
                                    });
                                }
                            });

                            await auditLogger.logAction(
                                req.user?.id || 0,
                                'update',
                                entityName,
                                req.params.id,
                                {
                                    actionType: 'edicion',
                                    changes,
                                    fieldsModified: changes.length,
                                    requestData: req.body,
                                    result,
                                    ip: req.ip
                                }
                            );
                        }
                        return res.status(200).json({ success: true, data: result });

                    case 'delete':
                        // Obtener datos antes de eliminar
                        const dataToDelete = await ABMService.getById(entityName, req.params.id);
                        await ABMService.delete(entityName, req.params.id);

                        // Log detallado según el tipo de entidad
                        if (entityName === 'planes') {
                            await auditLogger.logPlanAction(
                                req.user?.id || 0,
                                'delete',
                                req.params.id,
                                dataToDelete,
                                req.ip
                            );
                        } else if (entityName === 'especialidades') {
                            await auditLogger.logEspecialidadAction(
                                req.user?.id || 0,
                                'delete',
                                req.params.id,
                                dataToDelete,
                                req.ip
                            );
                        } else if (entityName === 'categorias') {
                            await auditLogger.logCategoriaAction(
                                req.user?.id || 0,
                                'delete',
                                req.params.id,
                                dataToDelete,
                                req.ip
                            );
                        } else {
                            await auditLogger.logAction(
                                req.user?.id || 0,
                                'delete',
                                entityName,
                                req.params.id,
                                {
                                    actionType: 'eliminacion',
                                    deletedData: dataToDelete,
                                    ip: req.ip
                                }
                            );
                        }
                        return res.status(200).json({
                            success: true,
                            message: `${ABMService.getEntityConfig(entityName).displayName} eliminado correctamente`
                        });

                    case 'toggleStatus':
                        return this.toggleStatusHandler(entityName)(req, res);

                    case 'getLocalidadesByProvincia':
                        result = await ABMService.getLocalidadesByProvincia(req.params.id);
                        return res.status(200).json({ success: true, data: result });

                    default:
                        return res.status(400).json({ success: false, error: 'Operación no soportada' });
                }
            } catch (error) {
                handleError(res, error, entityName);
            }
        };
    },

    /**
     * Crea un manejador para cambiar el estado de una entidad
     * @param {string} entityName - Nombre de la entidad
     * @returns {Function} - Función middleware para Express
     */
    toggleStatusHandler(entityName) {
        return async (req, res) => {
            try {
                // Obtener estado actual
                const currentData = await ABMService.getById(entityName, req.params.id);
                const oldStatus = currentData.estado;

                const result = await ABMService.toggleStatus(entityName, req.params.id);
                const newStatus = result.newState;

                // Log específico para cambio de estado
                await auditLogger.logStatusChange(
                    req.user?.id || 0,
                    entityName,
                    req.params.id,
                    oldStatus,
                    newStatus,
                    currentData,
                    req.ip
                );

                return res.status(200).json({
                    success: true,
                    message: `Estado actualizado a ${result.newState}`,
                    newState: result.newState
                });
            } catch (error) {
                handleError(res, error, entityName);
            }
        };
    }
};

module.exports = ABMController;