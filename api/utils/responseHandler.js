/**
 * @module utils/responseHandler
 * @description Utilidades para manejar respuestas HTTP de manera consistente
 */

const { Messages } = require("../config/response-messages");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

/**
 * Construye una respuesta HTTP con los datos especificados.
 * @param {number} status - El código de estado HTTP.
 * @param {string} message - El mensaje de estado HTTP.
 * @param {Object} [data=null] - La información adicional que se devuelve en el cuerpo de la respuesta.
 * @param {string} [errorDetails=null] - La información adicional de error que se devuelve en el cuerpo de la respuesta.
 * @returns {Object} - La respuesta HTTP construida.
 */
const buildResponse = (status, message, data = null, errorDetails = null) => ({
    status,
    message,
    ...(data && { data }),
    ...(errorDetails && { error: { details: errorDetails } }),
    timestamp: new Date().toISOString()
});

/**
 * Verifica si un resultado de consulta está vacío
 * @param {Array|Object} rows - Resultado de la consulta
 * @returns {boolean} - true si está vacío, false si contiene datos
 */
const isEmptyResult = (rows) => {
    if (!rows) return true;

    // Si es un array vacío
    if (Array.isArray(rows) && rows.length === 0) return true;

    // Si es un array que contiene un array vacío (formato típico de procedimientos almacenados)
    if (Array.isArray(rows) && rows[0] && Array.isArray(rows[0]) && rows[0].length === 0) return true;

    // Si es un objeto que tiene una propiedad items que es un array vacío (formato de paginación)
    if (rows[0] && rows[0].items && Array.isArray(rows[0].items) && rows[0].items.length === 0) return true;

    return false;
};

/**
 * Maneja la respuesta de una solicitud HTTP ejecutando una función de callback y devolviendo una respuesta formateada.
 * @param {Object} res - El objeto de respuesta de Express.
 * @param {Function} callback - La función de callback a ejecutar, que debe devolver una promesa que resuelva en filas de la base de datos.
 * @param {string} [entityName="datos"] - El nombre de la entidad que se está manejando, utilizado en el mensaje de respuesta.
 * @returns {Promise<Object>} - Una promesa que se resuelve con la respuesta HTTP enviada al cliente.
 * @throws {Error} - Registrará un error y devolverá una respuesta de error interno del servidor si el callback falla.
 */
const handleResponse = async (res, callback, entityName = "datos") => {
    try {
        const [rows] = await callback();

        // Verificación mejorada para detectar resultados vacíos
        if (isEmptyResult(rows)) {
            return res.status(StatusCodes.NOT_FOUND).json(
                buildResponse(
                    StatusCodes.NOT_FOUND,
                    ReasonPhrases.NOT_FOUND,
                    null,
                    Messages.errors.notFound(entityName)
                )
            );
        }

        return res.status(StatusCodes.OK).json(
            buildResponse(
                StatusCodes.OK,
                Messages.success.get(entityName),
                rows
            )
        );
    } catch (error) {
        console.error(`[ERROR] ${entityName}: handleResponse - Error al obtener resultados`, error);

        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(
            buildResponse(
                error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
                ReasonPhrases.INTERNAL_SERVER_ERROR,
                null,
                error.message || `Error al obtener ${entityName}`
            )
        );
    }
};

module.exports = handleResponse;