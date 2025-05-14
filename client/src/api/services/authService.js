import api from '../axiosConfig';

const AuthService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', { oldPassword, newPassword });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createToken: async () => {
    try {
      const response = await api.post('/auth/create-token');
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  verifySession: async () => {
    try {
      const response = await api.post('/auth/validate-session');
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  verifyRole: async (requiredRoles) => {
    try {
      const response = await api.post('/auth/verify-role', { roles: requiredRoles });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Error verificando roles' };
    }
  }

};

export default AuthService;