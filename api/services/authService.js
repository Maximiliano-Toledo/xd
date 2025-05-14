/**
 * @module services/authService
 * @description Servicios para operaciones de autenticación y autorización
 */

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { userRepository } = require("../repositories/userRepository");
const {
  secret,
  refreshSecret,
  expiresIn,
  refreshExpiresIn,
} = require("../config/jwt");
const { authRepository } = require("../repositories/authRepository");

/**
 * Servicios para operaciones de autenticación y autorización
 * @type {Object}
 */
const AuthService = {
  /**
   * Registra un nuevo usuario
   * @async
   * @param {string} username - Nombre de usuario
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} - Promesa que resuelve al usuario creado
   * @throws {Error} - Si faltan campos o el email ya está registrado
   */
  register: async (username, email, password) => {
    if (!username || !email || !password) {
      throw new Error("Todos los campos son requeridos");
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("El email ya está registrado");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await userRepository.createUser({
      username,
      email,
      password: hashedPassword,
      role: "user", // Rol por defecto
    });

    return newUser;
  },

  /**
   * Inicia sesión con un usuario
   * @async
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} - Promesa que resuelve a tokens y datos del usuario
   * @throws {Error} - Si las credenciales son incorrectas
   */
  login: async (username, password) => {
    const user = await userRepository.getUser(username);
    if (!user) {
      throw new Error("Usuario o contraseña incorrectos");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Usuario o contraseña incorrectos");
    }

    // Generar access token con información clara
    const accessToken = jwt.sign(
      {
        id: user.id,
        role: user.role,
        username: user.username
      },
      secret,
      { expiresIn }
    );

    // Generar refresh token
    const refreshToken = jwt.sign(
      { id: user.id },
      refreshSecret,
      { expiresIn: refreshExpiresIn }
    );

    // Depuración
    console.log("Token generado para usuario ID:", user.id);
    console.log("Secret usado:", secret ? "Secret configurado" : "Secret no configurado");

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  },

  /**
   * Crea un token para recuperación de contraseña
   * @async
   * @param {string} email - Correo electrónico del usuario
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el resultado
   * @throws {Error} - Si no se encuentra el usuario o hay un error
   */
  createToken: async (email) => {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new Error("No se encontró ningún usuario con ese email");
      }

      const token = bcrypt.hashSync(email + Date.now(), 10);

      await userRepository.saveToken(user.id, token);

      return {
        success: true,
        message: "Token creado correctamente",
        token: token // Opcional
      };
    } catch (error) {
      console.error('Error creating token:', error);
      throw new Error(error.message || 'Error al crear token');
    }
  },

  /**
   * Verifica la validez de un token de acceso
   * @async
   * @param {string} accessToken - Token de acceso
   * @returns {Promise<Object>} - Promesa que resuelve a la información del usuario
   * @throws {Error} - Si el token es inválido o el usuario no existe
   */
  verifyToken: async (accessToken) => {
    try {
      const decoded = jwt.verify(accessToken, secret);
      const user = await userRepository.getUserById(decoded.id);

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
    } catch (err) {
      throw new Error("Token inválido o expirado");
    }
  },

  /**
   * Renueva el token de acceso usando el token de refresco
   * @async
   * @param {string} refreshToken - Token de refresco
   * @returns {Promise<Object>} - Promesa que resuelve a un nuevo token de acceso y datos del usuario
   * @throws {Error} - Si el token es inválido o el usuario no existe
   */
  refreshToken: async (refreshToken) => {
    try {
      // Verificar y revocar el token de refresco
      await authRepository.isRefreshTokenRevoked(refreshToken);
      
      const decoded = jwt.verify(refreshToken, refreshSecret);
      const user = await userRepository.getUserById(decoded.id);

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      if (user.estado !== "Activo") {
        throw new Error("El usuario esta deshabilitado");
      }

      await authRepository.revokeRefreshToken(refreshToken);

      const newAccessToken = jwt.sign(
        { id: user.id, role: user.role },
        secret,
        { expiresIn }
      );

      const newRefreshToken = jwt.sign(
        { id: user.id },
        refreshSecret,
        { expiresIn: refreshExpiresIn }
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      };
    } catch (err) {
      throw new Error("Refresh token inválido");
    }
  },

  /**
   * Verifica si un usuario tiene un rol específico
   * @async
   * @param {string} accessToken - Token de acceso
   * @param {Array<string>} requiredRoles - Roles requeridos
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el usuario y si tiene el rol
   * @throws {Error} - Si el token es inválido o el usuario no tiene el rol requerido
   */
  async verifyRole(accessToken, requiredRoles) {
    try {
      const decoded = jwt.verify(accessToken, secret);
      const user = await userRepository.getUserById(decoded.id);

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      if (!requiredRoles.includes(user.role)) {
        throw new Error("Acceso no autorizado");
      }

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        isValid: true
      };
    } catch (error) {
      console.error("Error en verifyRole:", error);
      throw new Error(error.message || "Error verificando rol");
    }
  },

  async changePassword(accessToken, oldPassword, newPassword) {
    try{
      if (!accessToken || !oldPassword || !newPassword) {
        throw new Error('Datos insuficientes');
      }

      const decoded = jwt.verify(accessToken, secret);
      const userId = decoded.id;

      const user = await userRepository.getUserById(userId, true);

      const isValidPassword = await bcrypt.compare(oldPassword, user.password);
      if (isValidPassword) {
        const hashedPassword = bcrypt.hashSync(newPassword, 12);
        userRepository.updatePassword(user.id, hashedPassword);
        return {
          success: true,
          message: 'Contraseña cambiada correctamente'
        }
      } else {
        return {
          success: false,
          message: 'Contraseña antigua incorrecta'
        }
      }
    } catch (error) {
      console.error('Error in changePassword:', error);
      throw new Error('Error updating password');
    }
  },

  /**
   * Cierra la sesión de un usuario
   * @returns {boolean} - true si la operación fue exitosa
   */
  logout: () => {
    // Implementar la lógica para cerrar la sesión
    return true;
  },
};

module.exports = {
  AuthService,
};