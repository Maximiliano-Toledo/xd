const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('Intentando conectar a la base de datos...');
    console.log(`Host: ${process.env.DB_HOST || 'no definido'}`);
    console.log(`Usuario: ${process.env.DB_USER || 'no definido'}`);
    console.log(`Base de datos: ${process.env.DB_NAME || 'no definido'}`);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log('✅ Conexión a la base de datos exitosa.');

        await connection.end();
        console.log('✅ Conexión cerrada exitosamente.');

    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:');

        // Mostrar detalles específicos del error
        if (error.code) {
            console.error(`Código de error: ${error.code}`);

            // Interpretar códigos de error comunes
            switch (error.code) {
                case 'ECONNREFUSED':
                    console.error('El servidor rechazó la conexión. Verifica que el host y puerto sean correctos y que el servidor MySQL esté en ejecución.');
                    break;
                case 'ER_ACCESS_DENIED_ERROR':
                    console.error('Acceso denegado. Verifica el nombre de usuario y contraseña.');
                    break;
                case 'ER_BAD_DB_ERROR':
                    console.error('La base de datos especificada no existe.');
                    break;
                case 'ETIMEDOUT':
                    console.error('Tiempo de espera agotado al intentar conectar. Verifica la conectividad de red.');
                    break;
                case 'PROTOCOL_CONNECTION_LOST':
                    console.error('Conexión perdida con el servidor MySQL.');
                    break;
                default:
                    console.error(`Error específico: ${error.message}`);
            }
        }

        if (error.errno) console.error(`Número de error: ${error.errno}`);
        if (error.sqlState) console.error(`Estado SQL: ${error.sqlState}`);
        if (error.sqlMessage) console.error(`Mensaje SQL: ${error.sqlMessage}`);

        console.error('Stack trace completo:', error.stack);

        // Verificar variables de entorno
        console.error('\nVerificación de variables de entorno:');
        const requiredVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
        let missingVars = false;

        requiredVars.forEach(varName => {
            if (!process.env[varName]) {
                console.error(`⚠️ Variable ${varName} no está definida en el archivo .env`);
                missingVars = true;
            }
        });

        if (!process.env.DB_PASSWORD) {
            console.error('⚠️ Variable DB_PASSWORD no está definida en el archivo .env (o está vacía)');
        }

        if (missingVars) {
            console.error('\nAsegúrate de que tu archivo .env contiene todas las variables necesarias y está correctamente ubicado.');
        }
    }
}

testConnection();