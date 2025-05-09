import { create } from 'zustand';
import AuthService from '../api/services/authService';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (userData) => {
    try {
      const response = await AuthService.login(userData.username, userData.password);
      set({ user: response.data.user, isAuthenticated: true });
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await AuthService.logout();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  },

  checkAuth: async () => {
    try {
      const response = await AuthService.verifySession();
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      return response;
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  refreshToken: async () => {
    try {
      const response = await AuthService.refreshToken();
      set({ user: response.data.user, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
      throw error;
    }
  },

  verifyRole: async (requiredRoles) => {
    try {
      // Verificación local inicial
      const { user } = get();
      if (user && requiredRoles.includes(user.role)) {
        return true;
      }
      
      // Verificación con backend si falla la local
      const response = await AuthService.verifyRole(requiredRoles);

      if (response.data.isValid) {
        set({ user: response.data.user }); // Actualiza datos del usuario si es necesario
        return true;
      }
      
      throw new Error('Unauthorized');
    } catch (error) {
      throw error;
    }
  }

  // hasRole: (requiredRoles) => {
  //   const state = useAuthStore.getState();
  //   const user = state.user;
  //   if (!user) return false;
    
  //   const role = user.role;
  //   return requiredRoles.includes(role);
  // },

}));

export default useAuthStore;