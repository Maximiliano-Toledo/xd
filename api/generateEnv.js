const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

function generateSecret(length = 64) {
    return crypto.randomBytes(length).toString('hex');
}

// Crear interfaz de readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer);
        });
    });
}

async function generateEnvFile() {
    const envPath = path.resolve(process.cwd(), '.env');

    // Verificar si ya existe
    if (fs.existsSync(envPath)) {
        const answer = await askQuestion('El archivo .env ya existe. ¿Deseas sobrescribirlo? (s/N): ');

        if (answer.toLowerCase() !== 's' && answer.toLowerCase() !== 'si' && answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
            console.log('No se sobrescribirá el archivo existente.');
            console.log('Si deseas regenerar el archivo, elimina el archivo .env existente primero o confirma la sobrescritura.');
            rl.close();
            return;
        }

        console.log('Se sobrescribirá el archivo .env existente...');
    }

    // Contenido del archivo .env
    const envContent = `# Database Configuration
        DB_HOST=localhost
        DB_USER=root
        DB_PASSWORD=
        DB_NAME=cartilla_ossacra_2_db

        # JWT Configuration
        JWT_SECRET=${generateSecret(32)}
        JWT_REFRESH_SECRET=${generateSecret(32)}
        JWT_EXPIRES_IN=1h
        JWT_REFRESH_EXPIRES_IN=7d

        # Server Configuration
        PORT=3000
        NODE_ENV=development
    `;

    // Escribir archivo
    fs.writeFileSync(envPath, envContent);
    console.log(`Archivo .env generado en: ${envPath}`);
    console.log('Este archivo contiene secretos JWT aleatorios y configuración básica.');
    console.log('Recuerda actualizar las credenciales de la base de datos según tu entorno.');

    // Cerrar la interfaz de readline
    rl.close();
}

// Manejo de eventos de readline
rl.on('close', () => {
    console.log('Proceso completado.');
    process.exit(0);
});

// Ejecutar la función principal
generateEnvFile().catch(error => {
    console.error('Error al generar el archivo .env:', error);
    rl.close();
});