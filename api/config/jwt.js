require('dotenv').config();

// verificar si las variables de entorno estan definidas
if (!process.env.JWT_SECRET) {
    console.warn('ADVERTENCIA: JWT_SECRET no está definido en el archivo .env. Usando valor por defecto.');
}

if (!process.env.JWT_REFRESH_SECRET) {
    console.warn('ADVERTENCIA: JWT_REFRESH_SECRET no está definido en el archivo .env. Usando valor por defecto.');
}

// configuracion con valores por defecto como respaldo
const jwtConfig = {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_key_for_development_only',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key_for_development_only',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};

// advertencia si estamos en produccion y usando valores por defecto
if (process.env.NODE_ENV === 'production') {
    if (jwtConfig.secret === 'default_jwt_secret_key_for_development_only' ||
        jwtConfig.refreshSecret === 'default_refresh_secret_key_for_development_only') {
        console.error('ERROR: No se deben usar secretos por defecto en producción. Configure JWT_SECRET y JWT_REFRESH_SECRET en el archivo .env.');
    }
}

module.exports = jwtConfig;