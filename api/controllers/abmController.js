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
                        // Registrar la creación con información completa
                        await auditLogger.logEntityCreation(
                          req.user?.id || 0,
                          entityName,
                          result.id,
                          result,
                          req.ip,
                          req.get('User-Agent')
                        );
                        return res.status(201).json({ success: true, data: result });

                    case 'update':
                        // Obtener datos originales antes de la actualización
                        const originalData = await ABMService.getById(entityName, req.params.id);
                        result = await ABMService.update(entityName, req.params.id, req.body);

                        // Registrar la actualización con cambios detallados
                        await auditLogger.logEntityUpdate(
                          req.user?.id || 0,
                          entityName,
                          req.params.id,
                          originalData,
                          result,
                          req.ip,
                          req.get('User-Agent')
                        );
                        return res.status(200).json({ success: true, data: result });

                    case 'delete':
                        await ABMService.delete(entityName, req.params.id);
                        // Registrar la acción
                        await auditLogger.logAction(
                          req.user?.id || 0,
                          'delete',
                          entityName,
                          req.params.id,
                          { requestData: req.body },
                          req.ip,
                          req.get('User-Agent')
                        );
                        return res.status(200).json({
                            success: true,
                            message: `${ABMService.getEntityConfig(entityName).displayName} eliminado correctamente`
                        });

                    case 'toggleStatus':
                        // Obtener datos antes del cambio
                        const originalStatusData = await ABMService.getById(entityName, req.params.id);
                        result = await ABMService.toggleStatus(entityName, req.params.id);

                        // Registrar con información mejorada
                        await auditLogger.logStatusChange(
                          req.user?.id || 0,
                          entityName,
                          req.params.id,
                          originalStatusData.estado,
                          result.newState,
                          {
                              entityName: originalStatusData.nombre || null,
                              entityConfig: ABMService.getEntityConfig(entityName).displayName
                          },
                          req.ip,
                          req.get('User-Agent')
                        );

                        return res.status(200).json({
                            success: true,
                            message: `Estado actualizado a ${result.newState}`,
                            newState: result.newState
                        });

                    case 'getLocalidadesByProvincia':
                        result = await ABMService.getLocalidadesByProvincia(req.params.id);
                        return res.status(200).json({ success: true, data: result });

                    case 'updateOrder':
                        if (!req.body.orders || !Array.isArray(req.body.orders)) {
                            return res.status(400).json({
                                success: false,
                                error: 'Se requiere un array de órdenes'
                            });
                        }

                        result = await ABMService.updateOrder(entityName, req.body.orders);

                        // Registrar el cambio de orden con información detallada
                        await auditLogger.logOrderChange(
                          req.user?.id || 0,
                          entityName,
                          req.body.orders,
                          req.ip,
                          req.get('User-Agent')
                        );

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
     * Actualiza el orden de los elementos de una entidad
     * @param {string} entityName - Nombre de la entidad
     * @returns {Function} - Función middleware para Express
     */
    updateOrderHandler(entityName) {
        return async (req, res) => {
            try {
                const { orders } = req.body;

                if (!Array.isArray(orders)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Los datos de orden deben ser un array'
                    });
                }

                const result = await ABMService.updateOrder(entityName, orders);

                // Registrar la acción
                await auditLogger.logAction(
                  req.user?.id || 0,
                  'updateOrder',
                  entityName,
                  'bulk-order-update',
                  {
                      requestData: orders,
                      result,
                      totalUpdated: orders.length
                  }
                );

                return res.status(200).json({
                    success: true,
                    message: `Orden de ${ABMService.getEntityConfig(entityName).displayName} actualizado correctamente`,
                    data: result
                });
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
                const result = await ABMService.toggleStatus(entityName, req.params.id);

                await auditLogger.logAction(
                    req.user?.id || 0,
                    'toggleStatus',
                    entityName,
                    req.params.id,
                    {
                        previousStatus: result.newState === 'Activo' ? 'Inactivo' : 'Activo',
                        newStatus: result.newState
                    }
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
    },

    /**
     * Crea un manejador mejorado para cambiar el estado de una entidad
     * @param {string} entityName - Nombre de la entidad
     * @returns {Function} - Función middleware para Express
     */
    toggleStatusHandlerImproved(entityName) {
        return async (req, res) => {
            try {
                // Obtener datos antes del cambio
                const originalData = await ABMService.getById(entityName, req.params.id);

                const result = await ABMService.toggleStatus(entityName, req.params.id);

                // Registrar con información mejorada
                await auditLogger.logStatusChange(
                  req.user?.id || 0,
                  entityName,
                  req.params.id,
                  originalData.estado,
                  result.newState,
                  {
                      entityName: originalData.nombre || null,
                      entityConfig: ABMService.getEntityConfig(entityName).displayName
                  },
                  req.ip,
                  req.get('User-Agent')
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
    },

    /**
     * Crea un manejador mejorado para crear entidades
     * @param {string} entityName - Nombre de la entidad
     * @returns {Function} - Función middleware para Express
     */
    createHandlerImproved(entityName) {
        return async (req, res) => {
            try {
                const result = await ABMService.create(entityName, req.body);

                // Registrar la creación con información completa
                await auditLogger.logEntityCreation(
                  req.user?.id || 0,
                  entityName,
                  result.id,
                  result,
                  req.ip,
                  req.get('User-Agent')
                );

                return res.status(201).json({ success: true, data: result });
            } catch (error) {
                handleError(res, error, entityName);
            }
        };
    },

    /**
     * Crea un manejador mejorado para actualizar entidades
     * @param {string} entityName - Nombre de la entidad
     * @returns {Function} - Función middleware para Express
     */
    updateHandlerImproved(entityName) {
        return async (req, res) => {
            try {
                // Obtener datos originales antes de la actualización
                const originalData = await ABMService.getById(entityName, req.params.id);

                const result = await ABMService.update(entityName, req.params.id, req.body);

                // Registrar la actualización con cambios detallados
                await auditLogger.logEntityUpdate(
                  req.user?.id || 0,
                  entityName,
                  req.params.id,
                  originalData,
                  result,
                  req.ip,
                  req.get('User-Agent')
                );

                return res.status(200).json({ success: true, data: result });
            } catch (error) {
                handleError(res, error, entityName);
            }
        };
    },

    /**
     * Crea un manejador mejorado para cambio de orden
     * @param {string} entityName - Nombre de la entidad
     * @returns {Function} - Función middleware para Express
     */
    updateOrderHandlerImproved(entityName) {
        return async (req, res) => {
            try {
                const { orders } = req.body;

                if (!Array.isArray(orders)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Los datos de orden deben ser un array'
                    });
                }

                const result = await ABMService.updateOrder(entityName, orders);

                // Registrar el cambio de orden con información detallada
                await auditLogger.logOrderChange(
                  req.user?.id || 0,
                  entityName,
                  orders,
                  req.ip,
                  req.get('User-Agent')
                );

                return res.status(200).json({
                    success: true,
                    message: `Orden de ${ABMService.getEntityConfig(entityName).displayName} actualizado correctamente`,
                    data: result
                });
            } catch (error) {
                handleError(res, error, entityName);
            }
        };
    }
};

module.exports = ABMController;

