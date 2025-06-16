const { pool } = require('../config/db');

const userRepository = {

    getAllUsers: async (page = 1, limit = 10) => {
        const offset = (page - 1) * limit;
        try {
            const [totalRows] = await pool.query(
                "CALL getCountUsers();"
            );

            const totalItems = totalRows[0][0].total || 0;
            const [rows] = await pool.query(
                "CALL GetUsersPaginados(?, ?);",
                [limit, offset]
            );
            const totalPages = Math.ceil(totalItems / limit);

            return {
                items: rows[0],
                pagination: {
                    totalItems,
                    itemsPerPage: limit,
                    currentPage: page,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            };
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            throw new Error('Error retrieving users');
        }
    },

    getUser: async (username) => {
        try {
            const [rows] = await pool.query(
                "SELECT id, username, role, email, password, estado, last_login, last_action, total_actions FROM users WHERE username = ?",
                [username]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error in getUser:', error);
            throw new Error('Error retrieving user');
        }
    },

    createUser: async (userData) => {
        try {
            const [result] = await pool.query(
                `INSERT INTO users (username, email, password, role, token) 
                 VALUES (?, ?, ?, ?, NULL)`,
                [
                    userData.username,
                    userData.email,
                    userData.password,
                    userData.role || 'user'
                ]
            );

            return {
                id: result.insertId,
                username: userData.username,
                email: userData.email,
                role: userData.role || 'user'
            };
        } catch (error) {
            console.error('Database error details:', {
                code: error.code,
                errno: error.errno,
                sqlMessage: error.sqlMessage,
                sql: error.sql
            });
            throw new Error('Error creating user: ' + error.sqlMessage);
        }
    },

    editUser: async (id, email, password) => {
        try {
            // Si viene solo el email o el password, se actualiza solo ese campo
            if (!email && password) {
                const hashPassword = await bcrypt.hash(password, 12);
                await pool.query(
                    "UPDATE users SET password = ? WHERE id = ?",
                    [hashPassword, id]
                );
                return { success: true };
            } else if (email && !password) {
                await pool.query(
                    "UPDATE users SET email = ? WHERE id = ?",
                    [email, id]
                );
                return { success: true };
            }

            const hashPassword = await bcrypt.hash(password, 12);
            await pool.query(
                "UPDATE users SET email = ?, password = ? WHERE id = ?",
                [email, hashPassword, id]
            );
            return { success: true };
        } catch (error) {
            console.error('Error in editUser:', error);
            throw new Error('Error editing user');
        }
    },

    findByEmail: async (email) => {
        try {
            const [rows] = await pool.query(
                "SELECT id, username, email, password, role FROM users WHERE email = ?",
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error in findByEmail:', error);
            throw new Error('Error finding user by email');
        }
    },

    getUserById: async (id, change = false) => {
        try {
            if(change) {
                const [rows] = await pool.query(
                    "SELECT id, username, role, email, estado, password, last_login, last_action, total_actions FROM users WHERE id = ?",
                    [id]
                );
                return rows.length > 0 ? rows[0] : null;
            }
            const [rows] = await pool.query(
                "SELECT id, username, role, email, estado, last_login, last_action, total_actions FROM users WHERE id = ?",
                [id]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Error in getUserById:", error);
            throw error;
        }
    },

    updateLastLogin: async (userId) => {
        try {
            await pool.query(
                "UPDATE users SET last_login = NOW() WHERE id = ?",
                [userId]
            );
            return { success: true };
        } catch (error) {
            console.error('Error in updateLastLogin:', error);
            throw new Error('Error update time login');
        }
    },

    saveToken: async (userId, token) => {
        try {
            // Verificar que userId sea un número
            if (isNaN(userId) || !Number.isInteger(Number(userId))) {
                throw new Error('Invalid user ID');
            }

            await pool.query(
                "UPDATE users SET token = ? WHERE id = ?",
                [token, userId]
            );
            return { success: true};
        } catch (error) {
            console.error('Error in saveToken:', error);
            throw new Error('Error saving token');
        }
    },

    findByToken: async (token) => {
        try {
            const [rows] = await pool.query(
                "SELECT id, username, email, role FROM users WHERE BINARY token = ?",
                [token]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error in findByToken:', error);
            throw new Error('Error finding user by token');
        }
    },

    updatePassword: async (userId, newPassword) => {
        try {
            await pool.query(
                "UPDATE users SET password = ?, token = NULL WHERE id = ?",
                [newPassword, userId]
            );
            return { success: true };
        } catch (error) {
            console.error('Error in updatePassword:', error);
            throw new Error('Error updating password');
        }
    },
};

module.exports = {
    userRepository,
};