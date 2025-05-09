const db = require('../config/db');

/**
 * Ejecuta una consulta a la base de datos utilizando la cadena de consulta y los parámetros proporcionados.
 * @param {string} query - La consulta SQL a ejecutar.
 * @param {Array} params - Un array de parámetros a utilizar en la consulta.
 * @returns {Promise<Array>} - Una promesa que resuelve los resultados de la consulta.
 * @throws {Error} - Lanza un error si falla la ejecución de la consulta.
 */
async function executeQuery(query, params) {
    try {
        const [results] = await db.query(query, params);
        return results;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    executeQuery
};