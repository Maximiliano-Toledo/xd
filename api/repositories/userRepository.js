const { pool } = require('../config/db');

const userRepository = {
    getUser: async (username) => {
        try {
            const [rows] = await pool.query(
                "SELECT id, username, role, email, password FROM users WHERE username = ?",
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

    getUserById: async (id) => {
        try {
            const [rows] = await pool.query(
                "SELECT id, username, role, email, estado FROM users WHERE id = ?",
                [id]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Error in getUserById:", error);
            throw error;
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
            return { success: true };
        } catch (error) {
            console.error('Error in saveToken:', error);
            throw new Error('Error saving token');
        }
    },

    findByToken: async (token) => {
        try {
            const [rows] = await pool.query(
                "SELECT id, username, email, role FROM users WHERE token = ?",
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
                "UPDATE users SET password = ? WHERE id = ?",
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