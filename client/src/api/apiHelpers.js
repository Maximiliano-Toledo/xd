import api from './axiosConfig';

const handleResponse = (response) => {
  if (response.status >= 200 && response.status < 300) {
      return response.data ?? [];
  } else {
      const error = new Error(response.status);
      error.data = response.data;
      throw error;
  }
};

const apiWrapper = async (method, endpoint, params = {}) => {
  try {
    const response = await api[method](endpoint, params);
    const data = handleResponse(response);
    return Array.isArray(data?.data?.[0]) ? data.data[0] : data.data || [];
  } catch (error) {
    throw handleResponse(error.response);
  }
};

export default apiWrapper;