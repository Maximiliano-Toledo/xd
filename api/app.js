const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const prestadoresRoutes = require('./routes/prestadorRoutes');
const abmRoutes = require('./routes/abmRoutes');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Deshabilitar la cabecera X-Powered-By
app.disable('x-powered-by');

// Aplicar Helmet para seguridad de encabezados HTTP
app.use(helmet());

// Configurar Content Security Policy
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
    }
}));

// Otras configuraciones de seguridad con Helmet
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.hsts({
    maxAge: 15552000, // 180 días en segundos
    includeSubDomains: true,
    preload: true
}));
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
app.use(helmet.permittedCrossDomainPolicies());

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cookieParser());
app.use(cors(corsOptions));

app.use(express.json({ limit: '10kb' })); // Limitar tamaño del payload
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Aplicar rate limiting global
app.use(generalLimiter);

// En app.js, antes de las rutas
app.use((req, res, next) => {
    // Capturar la IP real del cliente (sin usar connection deprecado)
    req.ip = req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        req.socket.remoteAddress ||
        req.ip ||
        '0.0.0.0';

    // Limpiar la IP (remover prefijo IPv6 si existe)
    if (req.ip.startsWith('::ffff:')) {
        req.ip = req.ip.substring(7);
    }

    next();
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/cartilla', prestadoresRoutes);
app.use('/api/abm', abmRoutes);
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/test', require('./routes/testRoutes'));


// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada'
    });
});

// Manejo global de errores
app.use((err, req, res, next) => {
    console.error('Error no controlado:', err);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server cartilla is running on port http://localhost:${PORT}`);
});