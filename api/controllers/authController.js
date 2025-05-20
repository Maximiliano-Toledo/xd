/**
 * @module controllers/authController
 * @description Controlador para operaciones de autenticación y autorización
 */

const { AuthService } = require("../services/authService");
const auditLogger = require("../utils/auditLogger");

/**
 * Controlador para operaciones de autenticación y autorización
 * @type {Object}
 */
const AuthController = {
  /**
   * Maneja el inicio de sesión de usuarios
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>} - Respuesta con el resultado del inicio de sesión
   */
  login: async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    try {
      const response = await AuthService.login(username, password);

      // Configuración de cookies mejorada
      res.cookie("accessToken", response.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true en producción, false en desarrollo
        sameSite: "lax", // "lax" para desarrollo local
        maxAge: 3600000, // 1 hora
        path: '/' // Asegura que la cookie este disponible en todas las rutas
      });

      res.cookie("refreshToken", response.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax",
        maxAge: 7 * 24 * 3600000, // 7 días
        path: '/'
      });

      // Mostrar información de depuración
      console.log("Login exitoso para usuario:", username);
      console.log("Token generado correctamente");

      // Registrar el evento de inicio de sesión
      await auditLogger.logAction(
        response.user.id,
        'login',
        'users',
        response.user.id,
        { username: response.user.username, timestamp: new Date() }
      );

      res.status(200).json({ user: response.user });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(401).json({ error: error.message });
    }
  },

  /**
   * Maneja el registro de nuevos usuarios
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>} - Respuesta con el resultado del registro
   */
  register: async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const response = await AuthService.register(username, email, password);

      // Registrar el evento de registro
      await auditLogger.logAction(
        req.user?.id || 0, // ID del administrador que crea el usuario
        'create',
        'users',
        response.id,
        { username, email }
      );

      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  changePassword: async (req, res) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ error: 'No access token provided' });
    }
    
    const { oldPassword, newPassword } = req.body;

    try {
      const response = await AuthService.changePassword(accessToken, oldPassword, newPassword);
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Maneja el cierre de sesión de usuarios
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>} - Respuesta confirmando el cierre de sesión
   */
  logout: async (req, res) => {
    try {
      refreshToken = req.cookies.refreshToken;
      await AuthService.logout(refreshToken);
      // Registrar el evento de cierre de sesión
      if (req.user) {
        await auditLogger.logAction(
          req.user.id,
          'logout',
          'users',
          req.user.id,
          { username: req.user.username, timestamp: new Date() }
        );
      }

      res.clearCookie('accessToken', { httpOnly: true, sameSite: 'none', secure: true });
      res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'none', secure: true });
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error("Error en logout:", error);
      res.status(500).json({ error: "Error al cerrar sesión" });
    }
  },

  /**
   * Crea un token para recuperación de contraseña
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>} - Respuesta con el token creado
   */
  createToken: async (req, res) => {
    const { email } = req.body;
    try {
      const response = await AuthService.createToken(email);
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Verifica la validez de un token de acceso
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>} - Respuesta con la información del usuario si el token es válido
   */
  verifyToken: async (req, res) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ error: 'No access token provided' });
    }

    try {
      const response = await AuthService.verifyToken(accessToken);
      res.status(200).json(response);
    } catch (error) {
      res.clearCookie('accessToken', { httpOnly: true, sameSite: 'none', secure: true });
      res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'none', secure: true });
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Renueva el token de acceso usando el token de refresco
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>} - Respuesta con el nuevo token de acceso
   */
  refreshToken: async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token no proporcionado' });
    }

    try {
      const response = await AuthService.refreshToken(refreshToken);
      res.cookie("accessToken", response.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax",
        maxAge: 3600000, // 1 hora
        path: '/'
      });

      res.cookie("refreshToken", response.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax",
        maxAge: 7 * 24 * 3600000, // 7 días
        path: '/'
      });

      res.status(200).json({ user: response.user })
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Verifica si un usuario tiene un rol específico
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>} - Respuesta indicando si el usuario tiene el rol requerido
   */
  async verifyRole(req, res) {
    try {
      const accessToken = req.cookies.accessToken;
      const { roles: requiredRoles } = req.body;

      if (!accessToken || !requiredRoles) {
        throw new Error('Datos insuficientes');
      }

      const { user, isValid } = await AuthService.verifyRole(accessToken, requiredRoles);
      res.json({ user, isValid });
    } catch (error) {
      res.status(403).json({ error: error.message });
    }
  }
};

module.exports = {
  AuthController,
};