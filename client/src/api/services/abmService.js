import apiWrapper from '../apiHelpers';

const entities = ['planes', 'categorias', 'especialidades', 'provincias', 'localidades'];

const createEntityMethods = (entity) => ({
  [`getAll${capitalizeFirstLetter(entity)}`]: () => apiWrapper('get', `abm/${entity}`),
  [`get${capitalizeFirstLetter(entity)}ById`]: (id) => apiWrapper('get', `abm/${entity}/${id}`),
  [`create${capitalizeFirstLetter(entity)}`]: (data) => apiWrapper('post', `abm/${entity}`, data),
  [`update${capitalizeFirstLetter(entity)}`]: (id, data) => apiWrapper('put', `abm/${entity}/${id}`, data),
  [`delete${capitalizeFirstLetter(entity)}`]: (id) => apiWrapper('delete', `abm/${entity}/${id}`),
  [`toggle${capitalizeFirstLetter(entity)}Status`]: (id) => apiWrapper('patch', `abm/${entity}/${id}/toggle-status`),
  [`createPrestador`]: (data) => apiWrapper('post', `cartilla/crear-prestador`, data),
  [`getLocalidadesByProvincia`]: (id) => apiWrapper('get', `abm/localidades/provincia/${id}`),
});

// Helper para capitalizar la primera letra
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Crear el servicio dinámicamente
export const ABMService = entities.reduce((service, entity) => {
  return { ...service, ...createEntityMethods(entity) };
}, {});