/**
 * create-admin.js
 * Script para crear un usuario administrador por defecto en la base de datos.
 * 
 * Uso: node create-admin.js
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// Configuración del usuario administrador
const adminUser = {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',  // Cambiar por una contraseña segura en producción
    role: 'admin'
};

/**
 * Crea un usuario administrador en la base de datos
 */
async function createAdminUser() {
    let connection;

    try {
        console.log('Iniciando creación de usuario administrador...');

        // Obtener conexión
        connection = await pool.getConnection();

        // Verificar si ya existe un usuario con ese nombre o email
        const [existingUsers] = await connection.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [adminUser.username, adminUser.email]
        );

        if (existingUsers.length > 0) {
            console.log('Ya existe un usuario con ese nombre o email.');

            // Opcional: actualizar el rol a admin si existe pero no es admin
            const existingUser = existingUsers[0];
            if (existingUser.role !== 'admin') {
                await connection.query(
                    'UPDATE users SET role = ? WHERE id = ?',
                    ['admin', existingUser.id]
                );
                console.log(`Usuario ${existingUser.username} actualizado a rol admin.`);
            } else {
                console.log(`El usuario ${existingUser.username} ya tiene rol admin.`);
            }

            return;
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(adminUser.password, 12);

        // Insertar el usuario admin
        const [result] = await connection.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [adminUser.username, adminUser.email, hashedPassword, adminUser.role]
        );

        console.log(`Usuario administrador creado con ID: ${result.insertId}`);
        console.log('Credenciales:');
        console.log(`- Usuario: ${adminUser.username}`);
        console.log(`- Contraseña: ${adminUser.password}`);
        console.log(`- Email: ${adminUser.email}`);

    } catch (error) {
        console.error('Error al crear usuario administrador:', error);
    } finally {
        if (connection) connection.release();
        // Cerrar el pool de conexiones para terminar el script
        pool.end();
    }
}

// Ejecutar la función
createAdminUser()
    .then(() => console.log('Proceso completado.'))
    .catch(err => console.error('Error en el proceso:', err));