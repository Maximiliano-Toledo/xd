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

  getEspecialidadesPrestador: (planId, provinciaId, localidadId, categoriaId, nombrePrestador) =>
    apiWrapper('get', `/cartilla/especialidadesPrestador/plan/${planId}/provincia/${provinciaId}/localidad/${localidadId}/categoria/${categoriaId}/nombre/${nombrePrestador}`),

  getNombrePrestadores: (planId, provinciaId, localidadId, categoriaId) =>
    apiWrapper('get', `/cartilla/nombrePrestadores/plan/${planId}/provincia/${provinciaId}/localidad/${localidadId}/categoria/${categoriaId}`),

  getPrestadoresPorNombre: async (planId, categoriaId, localidadId, especialidadId, nombrePrestador, page = 1, limit = 10) => {
    try {
      // Crear URL con parámetros de ruta y query
      const url = new URL(`${API_URL}/cartilla/prestadoresPorNombre/plan/${planId}/categoria/${categoriaId}/localidad/${localidadId}/especialidad/${especialidadId}/nombre/${encodeURIComponent(nombrePrestador)}`);

      // Añadir parámetros de paginación
      url.searchParams.append('page', page);
      url.searchParams.append('limit', limit);

      console.log("URL de solicitud para prestadores por nombre:", url.toString());

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
        throw new Error(`Error fetching prestadores por nombre: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Datos recibidos de prestadores por nombre:", data);

      return data;
    } catch (error) {
      console.error('Error in CartillaService.getPrestadoresPorNombre:', error);
      throw error;
    }
  },

  // Versión básica sin paginación (para mantener compatibilidad)
  getPrestadoresPorNombreBasic: (planId, categoriaId, localidadId, especialidadId, nombrePrestador) =>
    apiWrapper('get', `/cartilla/prestadoresPorNombre/plan/${planId}/categoria/${categoriaId}/localidad/${localidadId}/especialidad/${especialidadId}/nombre/${encodeURIComponent(nombrePrestador)}`),

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

  // Versión alternativa sin paginación (manteniendo compatibilidad)
  getPrestadoresBasic: (planId, categoriaId, provinciaId, localidadId, especialidadId) =>
    apiWrapper('get', `/cartilla/prestadores/especialidad/${especialidadId}/localidad/${localidadId}/provincia/${provinciaId}/categoria/${categoriaId}/plan/${planId}`),
  
  // Descarga de la cartilla completa en CSV
  descargarCartilla: async () => {
    try {
      // Usamos fetch directamente para manejar la descarga del archivo
      const response = await fetch(`${API_URL}/cartilla/descargar-cartilla`, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error HTTP ${response.status}: ${errorText}`);
        throw new Error(`Error al descargar la cartilla: ${response.status} ${response.statusText}`);
      }

      // Convertimos la respuesta a blob para la descarga
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Creamos un enlace temporal para la descarga
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Intentamos obtener el nombre del archivo desde la cabecera
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'cartilla.csv';
      
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Limpiamos
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true, message: 'Archivo descargado correctamente' };
    } catch (error) {
      console.error('Error in CartillaService.descargarCartilla:', error);
      throw error;
    }
  },
  
  // Subir archivo CSV de cartilla
  subirCartilla: async (file, onProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Usamos XMLHttpRequest para poder monitorear el progreso
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Configurar evento de progreso si se proporciona función de callback
        if (typeof onProgress === 'function') {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              onProgress({
                loaded: event.loaded,
                total: event.total,
                percent: percentComplete
              });
            }
          });
        }
        
        xhr.open('POST', `${API_URL}/cartilla/prestadores/subir-cartilla`);
        
        // Asegurarse de incluir las cookies en la solicitud para autenticación
        xhr.withCredentials = true;
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
              console.log('Respuesta del servidor:', data);
            } catch (error) {
              reject(new Error('Error al procesar la respuesta del servidor'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.message || `Error ${xhr.status}: ${xhr.statusText}`));
            } catch (parseError) {
              reject(new Error(`Error ${xhr.status}: ${xhr.statusText}`));
            }
          }
        };
        
        xhr.onerror = function() {
          reject(new Error('Error de red al subir el archivo'));
        };
        
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Error in CartillaService.subirCartilla:', error);
      throw error;
    }
  },
  
  // Obtener la lista de prestadores en la cartilla (con paginación)
  getPrestadoresCartilla: async (page = 1, limit = 10) => {
    try {
      const url = new URL(`${API_URL}/cartilla/prestadoresCartilla`);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', limit);

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
        throw new Error(`Error fetching prestadores cartilla: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in CartillaService.getPrestadoresCartilla:', error);
      throw error;
    }
  }
};