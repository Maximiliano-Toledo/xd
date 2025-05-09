import axios from 'axios';
import AuthService from '../api/services/authService';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Redirigir a login o limpiar el store
//       // window.location.href = '/login';
//       // console.error('No autorizado');
//     }
//     return Promise.reject(error);
//   }
// );

// api.interceptors.response.use(
//   response => response,
//   async (error) => {
//     const originalRequest = error.config;
    
//     // Si el error es 401 y no es una solicitud de refresh
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
      
//       try {
//         // Intentar refrescar el token
//         await AuthService.refreshToken();
//         // Reintentar la solicitud original
//         return api(originalRequest);
//       } catch (refreshError) {
//         // Si falla el refresh, redirigir al inicio
//         window.location.href = '/';
//         return Promise.reject(refreshError);
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

export default api;