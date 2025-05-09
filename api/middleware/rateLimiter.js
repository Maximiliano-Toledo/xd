/**
 * @module middleware/rateLimiter
 * @description Middleware para limitar la tasa de solicitudes a la API
 */

const rateLimit = require('express-rate-limit');

/**
 * Crea un limitador de tasa con configuración personalizada
 * @param {number} windowMs - Ventana de tiempo en milisegundos
 * @param {number} max - Número máximo de solicitudes permitidas en la ventana de tiempo
 * @param {string} message - Mensaje de error cuando se excede el límite
 * @returns {Function} - Middleware de limitación de tasa
 */
const createRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: { success: false, error: message },
        standardHeaders: true,
        legacyHeaders: false
    });
};

/**
 * Limitador para operaciones generales
 * @type {Function}
 */
const generalLimiter = createRateLimiter(
    30 * 60 * 1000, // 30 minutos (aumentado de 15 a 30 minutos)
    150, // 150 solicitudes (aumentado de 100 a 150)
    'Demasiadas solicitudes, por favor intente de nuevo más tarde'
);

/**
 * Limitador más estricto para operaciones de escritura
 * @type {Function}
 */
const writeLimiter = createRateLimiter(
    30 * 60 * 1000, // 30 minutos (aumentado de 15 a 30 minutos)
    50, // 50 solicitudes (aumentado de 30 a 50)
    'Demasiadas solicitudes de escritura, por favor intente de nuevo más tarde'
);

/**
 * Limitador para login
 * @type {Function}
 */
const loginLimiter = createRateLimiter(
    30 * 60 * 1000, // 30 minutos (aumentado de 15 a 30 minutos)
    10, // 10 intentos (aumentado de 5 a 10)
    'Demasiados intentos de inicio de sesión, por favor intente de nuevo más tarde'
);

module.exports = {
    generalLimiter,
    writeLimiter,
    loginLimiter
};