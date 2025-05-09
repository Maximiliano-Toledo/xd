const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

async function createUsersTable() {
    try {
        // Crear la tabla de usuarios
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        console.log('Tabla de usuarios creada correctamente');

        // Verificar si ya existe un usuario administrador
        const [adminCheck] = await pool.query(
            "SELECT * FROM users WHERE role = 'admin' LIMIT 1"
        );

        // Si no existe un administrador, crear uno por defecto
        if (adminCheck.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 12);

            await pool.query(
                `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
                ['admin', 'admin@example.com', hashedPassword, 'admin']
            );

            console.log('Usuario administrador creado con éxito:');
            console.log('Username: admin');
            console.log('Password: admin123');
            console.log('¡IMPORTANTE! Cambia esta contraseña después de iniciar sesión por primera vez');
        } else {
            console.log('Ya existe un usuario administrador');
        }

    } catch (error) {
        console.error('Error al crear tabla de usuarios:', error);
    } finally {
        process.exit();
    }
}

createUsersTable();