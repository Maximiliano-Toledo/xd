/**
 * @module utils/responsePostHandler
 * @description Utilidades para manejar respuestas HTTP para operaciones de modificación
 */

const { StatusCodes, ReasonPhrases } = require('http-status-codes');

/**
 * Maneja respuestas para operaciones POST, PUT, PATCH y DELETE
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} operationPromise - Función que devuelve una promesa que ejecuta la operación
 * @param {String} entityName - Nombre de la entidad (para mensajes)
 * @param {Object} [options={}] - Opciones adicionales
 * @param {Number} [options.successStatus=201] - Código de estado para éxito (201 para creación, 200 para otros)
 * @param {String} [options.action='crear'] - Acción realizada ('crear', 'actualizar', 'eliminar', 'baja')
 * @returns {Promise<void>} - Una promesa que se resuelve cuando se ha enviado la respuesta
 */
const handlePostResponse = async (
  res,
  operationPromise,
  entityName,
  options = {}
) => {
  const {
    successStatus = StatusCodes.CREATED,
    action = 'crear'
  } = options;

  const actionMessages = {
    crear: {
      success: `${entityName} creado exitosamente`,
      error: `Error al crear ${entityName}`
    },
    actualizar: {
      success: `${entityName} actualizado exitosamente`,
      error: `Error al actualizar ${entityName}`
    },
    baja: {
      success: `${entityName} dado de baja exitosamente`,
      error: `Error al dar de baja ${entityName}`
    },
    eliminar: {
      success: `${entityName} eliminado exitosamente`,
      error: `Error al eliminar ${entityName}`
    }
  };

  try {
    const result = await operationPromise();

    res.status(successStatus).json({
      status: successStatus,
      message: actionMessages[action].success,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`[ERROR] ${action} ${entityName}:`, error);
    const statusCode = error.statusCode || StatusCodes.BAD_REQUEST;

    res.status(statusCode).json({
      status: statusCode,
      message: ReasonPhrases.BAD_REQUEST,
      error: {
        details: error.message || actionMessages[action].error
      },
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = handlePostResponse;