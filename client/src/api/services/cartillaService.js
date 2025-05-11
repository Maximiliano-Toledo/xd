import apiWrapper from '../apiHelpers';

const API_URL = 'http://localhost:3000/api'; // Ajusta esto según la URL de tu backend

export const CartillaService = {
  getPlanes: () => apiWrapper('get', '/cartilla/planes'),

  getProvincias: (planId) =>
    apiWrapper('get', `/cartilla/provincias/plan/${planId}`),

  getLocalidades: (planId, provinciaId) =>
    apiWrapper('get', `/cartilla/localidades/plan/${planId}/provincia/${provinciaId}`),

  getCategorias: (planId, localidadId) =>
    apiWrapper('get', `/cartilla/categorias/plan/${planId}/localidad/${localidadId}`),

  getEspecialidades: (planId, categoriaId, provinciaId, localidadId) =>
    apiWrapper('get', `/cartilla/especialidades/localidad/${localidadId}/provincia/${provinciaId}/categoria/${categoriaId}/plan/${planId}`),

  getPrestadores: async (idPlan, idCategoria, idProvincia, idLocalidad, idEspecialidad, page = 1, limit = 10) => {
    try {
      // Crear URL con parámetros de paginación explícitos
      const url = new URL(`${API_URL}/cartilla/prestadores/especialidad/${idEspecialidad}/localidad/${idLocalidad}/provincia/${idProvincia}/categoria/${idCategoria}/plan/${idPlan}`);

      // Añadir parámetros de paginación como query params
      url.searchParams.append('page', page);
      url.searchParams.append('limit', limit);

      console.log("URL de solicitud:", url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error HTTP ${response.status}: ${errorText}`);
        throw new Error(`Error fetching prestadores: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Datos recibidos de la API:", data);

      return data;
    } catch (error) {
      console.error('Error in CartillaService.getPrestadores:', error);
      throw error;
    }
  },
};                        