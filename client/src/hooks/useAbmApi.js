import { useState } from 'react';
import { ABMService } from '../api/services/abmService';

export const useAbmApi = (entity) => {
  const [data, setData] = useState([]);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Métodos genéricos
  const getAll = async () => {
    try {
      setLoading(true);
      const response = await ABMService[`getAll${capitalize(entity)}`]();
      setData(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getById = async (id) => {
    try {
      setLoading(true);
      const response = await ABMService[`get${capitalize(entity)}ById`](id);
      setItem(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const create = async (formData) => {
    try {
      setLoading(true);
      const response = await ABMService[`create${capitalize(entity)}`](formData);
      await getAll(); // Refrescar la lista
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createPrestador = async (formData) => {
    try {
      setLoading(true);
      const response = await ABMService[`createPrestador`](formData);
      await getAll(); // Refrescar la lista
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, formData) => {
    try {
      setLoading(true);
      const response = await ABMService[`update${capitalize(entity)}`](id, formData);
      await getAll(); // Refrescar la lista
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      setLoading(true);
      await ABMService[`delete${capitalize(entity)}`](id);
      await getAll(); // Refrescar la lista
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      setLoading(true);
      const response = await ABMService[`toggle${capitalize(entity)}Status`](id);
      await getAll(); // Refrescar la lista
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getLocalidadesByProvincia = async (id) => {
    try {
      setLoading(true);
      const response = await ABMService[`getLocalidadesByProvincia`](id);
      setData(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper para capitalizar
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return {
    data,
    item,
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    remove,
    toggleStatus,
    createPrestador,
    getLocalidadesByProvincia,
  };
};