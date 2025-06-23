import apiWrapper from '../apiHelpers';

const API_URL = 'http://localhost:3000/api'; // Ajusta esto según la URL de tu backend

export const CartillaService = {
  getPlanes: () => apiWrapper('get', '/cartilla/planes'),

  getPlanesEdit: () => apiWrapper('get', '/cartilla/planesEdit/edit/true'),

  getProvincias: (planId) =>
    apiWrapper('get', `/cartilla/provincias/plan/${planId}`),

  getProvinciasEdit: (planId) =>
    apiWrapper('get', `/cartilla/provinciasEdit/plan/${planId}/edit/true`),

  getLocalidades: (planId, provinciaId) =>
    apiWrapper('get', `/cartilla/localidades/plan/${planId}/provincia/${provinciaId}`),

  getLocalidadesEdit: (planId, provinciaId) =>
    apiWrapper('get', `/cartilla/localidadesEdit/plan/${planId}/provincia/${provinciaId}/edit/true`),

  getCategorias: (planId, localidadId) =>
    apiWrapper('get', `/cartilla/categorias/plan/${planId}/localidad/${localidadId}`),

  getCategoriasVirtuales: (planId) =>
    apiWrapper('get', `/cartilla/categoriasVirtuales/plan/${planId}`),

  getCategoriasVirtualesEdit: (planId) =>
    apiWrapper('get', `/cartilla/categoriasVirtualesEdit/plan/${planId}/edit/true`),

  getCategoriasEdit: (planId, localidadId) =>
    apiWrapper('get', `/cartilla/categoriasEdit/plan/${planId}/localidad/${localidadId}/edit/true`),

  getEspecialidades: (planId, categoriaId, provinciaId, localidadId) =>
    apiWrapper('get', `/cartilla/especialidades/localidad/${localidadId}/provincia/${provinciaId}/categoria/${categoriaId}/plan/${planId}`),

  getEspecialidadesEdit: (planId, categoriaId, provinciaId, localidadId) =>
    apiWrapper('get', `/cartilla/especialidadesEdit/localidad/${localidadId}/provincia/${provinciaId}/categoria/${categoriaId}/plan/${planId}/edit/true`),

  getEspecialidadesVirtuales: (categoriaId, planId) =>
    apiWrapper('get', `/cartilla/especialidadesVirtuales/categoria/${categoriaId}/plan/${planId}`),

  getEspecialidadesVirtualesEdit: (categoriaId, planId) =>
    apiWrapper('get', `/cartilla/especialidadesVirtualesEdit/categoria/${categoriaId}/plan/${planId}/edit/true`),

  getEspecialidadesPrestador: (planId, provinciaId, localidadId, categoriaId, nombrePrestador) =>
    apiWrapper('get', `/cartilla/especialidadesPrestador/plan/${planId}/provincia/${provinciaId}/localidad/${localidadId}/categoria/${categoriaId}/nombre/${nombrePrestador}`),

  getEspecialidadesPrestadorEdit: (planId, provinciaId, localidadId, categoriaId, nombrePrestador) =>
    apiWrapper('get', `/cartilla/especialidadesPrestadorEdit/plan/${planId}/provincia/${provinciaId}/localidad/${localidadId}/categoria/${categoriaId}/nombre/${nombrePrestador}/edit/true`),

  getNombrePrestadores: (planId, provinciaId, localidadId, categoriaId) =>
    apiWrapper('get', `/cartilla/nombrePrestadores/plan/${planId}/provincia/${provinciaId}/localidad/${localidadId}/categoria/${categoriaId}`),

  getNombrePrestadoresEdit: (planId, provinciaId, localidadId, categoriaId) =>
    apiWrapper('get', `/cartilla/nombrePrestadoresEdit/plan/${planId}/provincia/${provinciaId}/localidad/${localidadId}/categoria/${categoriaId}/edit/true`),

  getPrestadoresPorNombre: async (planId, categoriaId, localidadId, especialidadId, nombrePrestador, page = 1, limit = 10) => {
    try {
      // Crear URL con parámetros de ruta y query
      const url = new URL(`${API_URL}/cartilla/prestadoresPorNombre/plan/${planId}/categoria/${categoriaId}/localidad/${localidadId}/especialidad/${especialidadId}/nombre/${encodeURIComponent(nombrePrestador)}`);

      // Añadir parámetros de paginación
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
        throw new Error(`Error fetching prestadores por nombre: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      throw error;
    }
  },

  getPrestadoresPorNombreEdit: async (planId, categoriaId, localidadId, especialidadId, nombrePrestador, page = 1, limit = 10) => {
    try {
      // Crear URL con parámetros de ruta y query
      const url = new URL(`${API_URL}/cartilla/prestadoresPorNombreEdit/plan/${planId}/categoria/${categoriaId}/localidad/${localidadId}/especialidad/${especialidadId}/nombre/${encodeURIComponent(nombrePrestador)}/edit/true`);

      // Añadir parámetros de paginación
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
        throw new Error(`Error fetching prestadores por nombre: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
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

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error fetching prestadores: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      throw error;
    }
  },

  getPrestadoresEdit: async (idPlan, idCategoria, idProvincia, idLocalidad, idEspecialidad, page = 1, limit = 10) => {
    try {
      // Crear URL con parámetros de paginación explícitos
      const url = new URL(`${API_URL}/cartilla/prestadoresEdit/especialidad/${idEspecialidad}/localidad/${idLocalidad}/provincia/${idProvincia}/categoria/${idCategoria}/plan/${idPlan}/edit/true`);

      // Añadir parámetros de paginación como query params
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
        throw new Error(`Error fetching prestadores: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Versión alternativa sin paginación (manteniendo compatibilidad)
  getPrestadoresBasic: (planId, categoriaId, provinciaId, localidadId, especialidadId) =>
    apiWrapper('get', `/cartilla/prestadores/especialidad/${especialidadId}/localidad/${localidadId}/provincia/${provinciaId}/categoria/${categoriaId}/plan/${planId}`),

  getPrestadoresVirtuales: async (categoriaId, planId, especialidadId, page = 1, limit = 10) => {
    try {
      // Crear URL con parámetros de paginación explícitos
      const url = new URL(`${API_URL}/cartilla/prestadoresVirtuales/categoria/${categoriaId}/plan/${planId}/especialidad/${especialidadId}`);

      // Añadir parámetros de paginación como query params
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
        throw new Error(`Error fetching prestadores virtuales: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      throw error;
    }
  },

  getPrestadoresVirtualesEdit: async (categoriaId, planId, especialidadId, page = 1, limit = 10) => {
    try {
      // Crear URL con parámetros de paginación explícitos
      const url = new URL(`${API_URL}/cartilla/prestadoresVirtualesEdit/categoria/${categoriaId}/plan/${planId}/especialidad/${especialidadId}/edit/true`);

      // Añadir parámetros de paginación como query params
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
        throw new Error(`Error fetching prestadores virtuales: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      throw error;
    }
  },

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
      throw error;
    }
  },

  subirPortadaPDF: async (idPlan, idProvincia, pdfFile) => {
    try {
      const formData = new FormData();
      formData.append('idPlan', idPlan);
      formData.append('idProvincia', idProvincia);
      formData.append('pdf', pdfFile);

      const response = await fetch(`${API_URL}/cartilla/subir-portada`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  descargarCartillaPDF: async (idPlan, idProvincia) => {
    try {
      const response = await fetch(
        `${API_URL}/cartilla/descargar-cartilla-pdf/plan/${idPlan}/provincia/${idProvincia}`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      // Obtener el blob
      const blob = await response.blob();

      // Extraer nombre del archivo de forma más robusta
      let filename = 'cartilla.pdf';
      const contentDisposition = response.headers.get('content-disposition') || response.headers.get('Content-Disposition');

      if (contentDisposition) {
        // Primero intentar con filename* (formato RFC 6266 para UTF-8)
        const utf8FilenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
        if (utf8FilenameMatch && utf8FilenameMatch[1]) {
          filename = decodeURIComponent(utf8FilenameMatch[1]);
        } else {
          // Fallback a filename normal
          const basicFilenameMatch = contentDisposition.match(/filename="([^"]+)"/i);
          if (basicFilenameMatch && basicFilenameMatch[1]) {
            filename = basicFilenameMatch[1];
          }
        }
      }

      return { blob, filename };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Subir archivo CSV de cartilla
   * MODIFICADO: Ahora acepta opciones para el parseo de teléfonos
   * @param {File} file - Archivo CSV a subir
   * @param {Object} options - Opciones de configuración
   * @param {boolean} [options.enablePhoneParsing=true] - Si aplicar parseo automático de teléfonos
   * @param {Function} [onProgress] - Función de callback para monitorear progreso (LEGACY)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  subirCartilla: async (file, options = {}, onProgress = null) => {
    try {
      // NUEVO: Manejar parámetros flexibles para compatibilidad
      // Si el segundo parámetro es una función, es el callback legacy
      let actualOptions = {};
      let progressCallback = null;

      if (typeof options === 'function') {
        // Uso legacy: subirCartilla(file, onProgress)
        progressCallback = options;
        actualOptions = { enablePhoneParsing: true }; // Default para legacy
      } else {
        // Uso nuevo: subirCartilla(file, options, onProgress)
        actualOptions = options;
        progressCallback = onProgress;
      }

      const formData = new FormData();
      formData.append('file', file);

      // NUEVO: Agregar el parámetro de parseo de teléfonos
      const enablePhoneParsing = actualOptions.enablePhoneParsing !== false; // Default true
      formData.append('enablePhoneParsing', enablePhoneParsing.toString());

      // Usamos XMLHttpRequest para poder monitorear el progreso
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Configurar evento de progreso si se proporciona función de callback
        if (typeof progressCallback === 'function') {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              progressCallback({
                loaded: event.loaded,
                total: event.total,
                percent: percentComplete
              });
            }
          });
        }

        xhr.open('POST', `${API_URL}/cartilla/subir-cartilla`);

        // Asegurarse de incluir las cookies en la solicitud para autenticación
        xhr.withCredentials = true;

        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
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
        throw new Error(`Error fetching prestadores cartilla: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
};