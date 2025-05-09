const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    // Obtener el token del header
    const accessToken = req.cookies.accessToken;

    // Depuración
    console.log("Verificando token:", accessToken ? "Token presente" : "Token ausente");

    if (!accessToken) {
      return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
      // Verificar el accessToken
      const decoded = jwt.verify(accessToken, secret);
      console.log("Token verificado correctamente, usuario ID:", decoded.id);

      req.user = decoded;

      // Verificar roles si se especificaron
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        console.log("Rol requerido:", roles, "Rol del usuario:", decoded.role);
        return res.status(403).json({ message: 'No tienes permisos para esta acción' });
      }

      next();
    } catch (error) {
      console.error("Error verificando token:", error.name, error.message);

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado' });
      }
      return res.status(401).json({ message: 'Token inválido' });
    }
  };
};

module.exports = {
  authMiddleware,
};