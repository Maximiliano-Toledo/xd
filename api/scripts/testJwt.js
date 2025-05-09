const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Función para verificar la configuración de dotenv
function checkDotEnv() {
    const envPath = path.resolve(process.cwd(), '.env');
    console.log(`Buscando archivo .env en: ${envPath}`);

    if (fs.existsSync(envPath)) {
        console.log('✅ Archivo .env encontrado');

        // Cargar variables de entorno
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        console.log('Variables en .env:');
        for (const key in envConfig) {
            if (key.includes('JWT')) {
                console.log(`- ${key}: ${key.includes('SECRET') ? '[HIDDEN]' : envConfig[key]}`);
            }
        }
    } else {
        console.log('❌ Archivo .env NO encontrado');
    }

    console.log('\nVariables de entorno cargadas:');
    console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? '[PRESENT]' : '[MISSING]'}`);
    console.log(`- JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? '[PRESENT]' : '[MISSING]'}`);
    console.log(`- JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN || '[MISSING]'}`);
    console.log(`- JWT_REFRESH_EXPIRES_IN: ${process.env.JWT_REFRESH_EXPIRES_IN || '[MISSING]'}`);
}

// Cargar configuración JWT
function loadJwtConfig() {
    try {
        const jwtConfigPath = path.resolve(process.cwd(), 'config', 'jwt.js');
        console.log(`\nCargando configuración JWT desde: ${jwtConfigPath}`);

        if (fs.existsSync(jwtConfigPath)) {
            console.log('✅ Archivo de configuración JWT encontrado');
            const jwtConfig = require('../config/jwt');
            return jwtConfig;
        } else {
            console.log('❌ Archivo de configuración JWT NO encontrado');
            return null;
        }
    } catch (error) {
        console.error('Error al cargar configuración JWT:', error);
        return null;
    }
}

function testJwt() {
    console.log("=== Prueba de configuración JWT ===\n");

    // Verificar dotenv
    checkDotEnv();

    // Cargar configuración JWT
    const jwtConfig = loadJwtConfig();

    if (!jwtConfig) {
        console.error('\n❌ No se pudo cargar la configuración JWT');
        return;
    }

    console.log("\nConfiguración JWT cargada:");
    console.log(`- Secret: ${jwtConfig.secret ? '[PRESENT]' : '[MISSING]'}`);
    console.log(`- Refresh Secret: ${jwtConfig.refreshSecret ? '[PRESENT]' : '[MISSING]'}`);
    console.log(`- Expires In: ${jwtConfig.expiresIn}`);
    console.log(`- Refresh Expires In: ${jwtConfig.refreshExpiresIn}`);

    // Verificar que los secretos no sean undefined
    if (!jwtConfig.secret || !jwtConfig.refreshSecret) {
        console.error('\n❌ Los secretos JWT no están definidos correctamente');
        return;
    }

    try {
        // Crear un token de prueba
        const testToken = jwt.sign(
            { id: 1, role: 'admin', test: true },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        console.log("\n✅ Token de prueba generado correctamente");
        console.log(`Token: ${testToken.substring(0, 20)}...`);

        // Verificar el token
        const decoded = jwt.verify(testToken, jwtConfig.secret);

        console.log("\n✅ Token verificado correctamente");
        console.log("Contenido decodificado:", decoded);

        console.log("\n✅ La configuración JWT está funcionando correctamente");
    } catch (error) {
        console.error("\n❌ Error en la configuración JWT:");
        console.error(error);
    }
}

testJwt();