const { pool } = require('../config/db');

const authRepository = {

    revokeRefreshToken: async (refreshToken) => {
        try {
            const [result] = await pool.query(
                `INSERT IGNORE INTO revoked_tokens (token_hash) 
                 VALUES (SHA2(?, 256))`, // Hashear el token para almacenamiento seguro
                [refreshToken]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error revoking token:', error);
            throw new Error('Error al revocar el token');
        }
    },

    isRefreshTokenRevoked: async (refreshToken) => {
        try {
            const [rows] = await pool.query(
                "SELECT token_hash FROM revoked_tokens WHERE token_hash = SHA2(?, 256)",
                [refreshToken]
            );
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking token:', error);
            throw new Error('Error al verificar token');
        }
    },
};

module.exports = {
    authRepository,
};