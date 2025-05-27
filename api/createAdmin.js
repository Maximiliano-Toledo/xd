/**
 * create-admin.js
 * Script para crear un usuario administrador por defecto en la base de datos.
 *
 * Uso: node createAdmin.js
 */

const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configuración de la conexión a la base de datos
const mysql = require('mysql2/promise');

// Configuración del usuario administrador
const adminUser = {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',  // Cambiar por una contraseña segura en producción
    role: 'admin'
};

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cartilla_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

/**
 * Crea un usuario administrador en la base de datos
 */
async function createAdminUser() {
    let connection;

    try {
        console.log('=== CREACIÓN DE USUARIO ADMINISTRADOR ===');
        console.log('Configuración de conexión:');
        console.log(`- Host: ${dbConfig.host}`);
        console.log(`- Usuario: ${dbConfig.user}`);
        console.log(`- Base de datos: ${dbConfig.database}`);
        console.log(`- Contraseña: ${dbConfig.password ? '[CONFIGURADA]' : '[VACÍA]'}`);
        console.log('');

        // Crear conexión directa
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Conexión a la base de datos establecida');

        // Verificar si ya existe un usuario con ese nombre o email
        const [existingUsers] = await connection.query(
          'SELECT * FROM users WHERE username = ? OR email = ?',
          [adminUser.username, adminUser.email]
        );

        if (existingUsers.length > 0) {
            console.log('⚠️  Ya existe un usuario con ese nombre o email.');

            // Opcional: actualizar el rol a admin si existe pero no es admin
            const existingUser = existingUsers[0];
            if (existingUser.role !== 'admin') {
                await connection.query(
                  'UPDATE users SET role = ? WHERE id = ?',
                  ['admin', existingUser.id]
                );
                console.log(`✓ Usuario ${existingUser.username} actualizado a rol admin.`);
            } else {
                console.log(`✓ El usuario ${existingUser.username} ya tiene rol admin.`);
            }

            return;
        }

        // Hashear la contraseña
        console.log('🔒 Hasheando contraseña...');
        const hashedPassword = await bcrypt.hash(adminUser.password, 12);

        // Insertar el usuario admin
        const [result] = await connection.query(
          'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
          [adminUser.username, adminUser.email, hashedPassword, adminUser.role]
        );

        console.log('');
        console.log('🎉 ¡Usuario administrador creado exitosamente!');
        console.log(`- ID: ${result.insertId}`);
        console.log(`- Usuario: ${adminUser.username}`);
        console.log(`- Contraseña: ${adminUser.password}`);
        console.log(`- Email: ${adminUser.email}`);
        console.log(`- Rol: ${adminUser.role}`);
        console.log('');
        console.log('⚠️  IMPORTANTE: Cambia la contraseña por defecto en producción');

    } catch (error) {
        console.error('❌ Error al crear usuario administrador:', error.message);

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('');
            console.log('💡 Posibles soluciones:');
            console.log('1. Verifica que el archivo .env existe en la carpeta raíz del proyecto');
            console.log('2. Asegúrate de que las variables DB_HOST, DB_USER, DB_PASSWORD y DB_NAME estén configuradas');
            console.log('3. Verifica que el usuario de MySQL tenga permisos para acceder a la base de datos');
            console.log('4. Asegúrate de que MySQL esté ejecutándose');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('');
            console.log('💡 La base de datos no existe. Asegúrate de crearla primero.');
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('');
            console.log('💡 La tabla "users" no existe. Ejecuta las migraciones primero.');
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Conexión cerrada');
        }
    }
}

/**
 * Verifica las variables de entorno
 */
function verifyEnvironment() {
    console.log('=== VERIFICACIÓN DE VARIABLES DE ENTORNO ===');
    const requiredVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
    const missingVars = [];

    requiredVars.forEach(varName => {
        const value = process.env[varName];
        console.log(`${varName}: ${value || '[NO DEFINIDA]'}`);
        if (!value) {
            missingVars.push(varName);
        }
    });

    console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '[DEFINIDA]' : '[NO DEFINIDA]'}`);
    console.log('');

    if (missingVars.length > 0) {
        console.log('❌ Variables faltantes:', missingVars.join(', '));
        console.log('');
        console.log('📝 Crea un archivo .env en la raíz del proyecto con:');
        console.log('DB_HOST=localhost');
        console.log('DB_USER=tu_usuario_mysql');
        console.log('DB_PASSWORD=tu_contraseña_mysql');
        console.log('DB_NAME=nombre_de_tu_base_de_datos');
        console.log('');
        return false;
    }

    console.log('✓ Todas las variables requeridas están definidas');
    console.log('');
    return true;
}

// Ejecutar la función
async function main() {
    if (!verifyEnvironment()) {
        process.exit(1);
    }

    await createAdminUser();
    console.log('=== PROCESO COMPLETADO ===');
}

main().catch(err => {
    console.error('❌ Error en el proceso:', err);
    process.exit(1);
});