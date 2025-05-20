import { useState, useCallback } from 'react';
import api from '../api/axiosConfig';

/**
 * Hook personalizado para interactuar con la API de auditoría
 * Versión mejorada para manejar el nuevo formato optimizado de logs
 */
export const useAuditApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Función auxiliar para manejar errores
     * @param {Error} err - Error capturado
     * @returns {Error} - Error formateado
     */
    const handleError = (err) => {
        // Obtener mensaje de error desde diferentes fuentes posibles
        const errorMessage =
            err.response?.data?.error ||
            err.response?.data?.message ||
            err.message ||
            'Error desconocido';

        console.error('Error de API:', err);
        setError(errorMessage);
        // En lugar de devolver un error, simplemente lo almacenamos en el estado
        return null;
    };

    /**
     * Obtener logs generales con paginación y soporte para filtros
     * @param {number} page - Número de página
     * @param {number} limit - Cantidad de registros por página
     * @param {Object} filters - Filtros aplicados
     * @returns {Promise<Object>} - Promesa con los logs
     */
    const getLogs = useCallback(async (page = 1, limit = 10, filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            // Construir parámetros de consulta
            const params = new URLSearchParams();
            params.append('limit', limit);
            params.append('offset', (page - 1) * limit);
            params.append('optimize', 'true'); // Solicitar formato optimizado

            // Añadir filtros si están presentes
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    params.append(key, value);
                }
            });

            // Realizar la solicitud
            const response = await api.get(`/audit/logs?${params.toString()}`);

            // Validar la respuesta
            if (!response.data) {
                throw new Error('Respuesta de API vacía');
            }

            setLoading(false);
            return response.data;
        } catch (err) {
            handleError(err);
            setLoading(false);
            // Devolvemos un objeto con datos vacíos pero bien estructurados para evitar errores
            return {
                success: false,
                data: [],
                pagination: {
                    total: 0,
                    limit: limit,
                    offset: (page - 1) * limit
                },
                error: err.message || 'Error al obtener logs'
            };
        }
    }, []);

    /**
     * Obtener logs por acción
     * @param {string} action - Tipo de acción
     * @param {number} page - Número de página
     * @param {number} limit - Cantidad de registros por página
     * @returns {Promise<Object>} - Promesa con los logs filtrados
     */
    const getLogsByAction = useCallback(async (action, page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('limit', limit);
            params.append('offset', (page - 1) * limit);
            params.append('optimize', 'true'); // Solicitar formato optimizado

            const response = await api.get(`/audit/logs/action/${action}?${params.toString()}`);
            setLoading(false);
            return response.data;
        } catch (err) {
            handleError(err);
            setLoading(false);
            return {
                success: false,
                data: [],
                pagination: {
                    total: 0,
                    limit: limit,
                    offset: (page - 1) * limit
                }
            };
        }
    }, []);

    /**
     * Obtener logs por tipo de entidad
     * @param {string} entityType - Tipo de entidad
     * @param {number} page - Número de página
     * @param {number} limit - Cantidad de registros por página
     * @returns {Promise<Object>} - Promesa con los logs filtrados
     */
    const getLogsByEntity = useCallback(async (entityType, page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('limit', limit);
            params.append('offset', (page - 1) * limit);
            params.append('optimize', 'true'); // Solicitar formato optimizado

            const response = await api.get(`/audit/logs/entity/${entityType}?${params.toString()}`);
            setLoading(false);
            return response.data;
        } catch (err) {
            handleError(err);
            setLoading(false);
            return {
                success: false,
                data: [],
                pagination: {
                    total: 0,
                    limit: limit,
                    offset: (page - 1) * limit
                }
            };
        }
    }, []);

    /**
     * Obtener logs por usuario
     * @param {number} userId - ID del usuario
     * @param {number} page - Número de página
     * @param {number} limit - Cantidad de registros por página
     * @returns {Promise<Object>} - Promesa con los logs filtrados
     */
    const getLogsByUser = useCallback(async (userId, page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('limit', limit);
            params.append('offset', (page - 1) * limit);
            params.append('optimize', 'true'); // Solicitar formato optimizado

            const response = await api.get(`/audit/logs/user/${userId}?${params.toString()}`);
            setLoading(false);
            return response.data;
        } catch (err) {
            handleError(err);
            setLoading(false);
            return {
                success: false,
                data: [],
                pagination: {
                    total: 0,
                    limit: limit,
                    offset: (page - 1) * limit
                }
            };
        }
    }, []);

    /**
     * Obtener logs por rango de fechas
     * @param {string} startDate - Fecha inicial
     * @param {string} endDate - Fecha final
     * @param {number} page - Número de página
     * @param {number} limit - Cantidad de registros por página
     * @returns {Promise<Object>} - Promesa con los logs filtrados
     */
    const getLogsByDateRange = useCallback(async (startDate, endDate, page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('limit', limit);
            params.append('offset', (page - 1) * limit);
            params.append('optimize', 'true'); // Solicitar formato optimizado
            params.append('startDate', startDate);
            params.append('endDate', endDate);

            const response = await api.get(`/audit/logs/date-range?${params.toString()}`);
            setLoading(false);
            return response.data;
        } catch (err) {
            handleError(err);
            setLoading(false);
            return {
                success: false,
                data: [],
                pagination: {
                    total: 0,
                    limit: limit,
                    offset: (page - 1) * limit
                }
            };
        }
    }, []);

    /**
     * Obtener resumen de auditoría
     * @returns {Promise<Object>} - Promesa con el resumen
     */
    const getAuditSummary = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/audit/summary');
            setLoading(false);
            return response.data;
        } catch (err) {
            handleError(err);
            setLoading(false);
            return {
                success: false,
                data: {
                    totalLogs: 0,
                    actionCounts: {},
                    recentLogs: []
                }
            };
        }
    }, []);

    /**
     * Obtener logs por entidad específica (ID)
     * @param {string} entityType - Tipo de entidad
     * @param {number|string} entityId - ID de la entidad
     * @param {number} page - Número de página
     * @param {number} limit - Cantidad de registros por página
     * @returns {Promise<Object>} - Promesa con los logs filtrados
     */
    const getLogsByEntityId = useCallback(async (entityType, entityId, page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('limit', limit);
            params.append('offset', (page - 1) * limit);
            params.append('optimize', 'true'); // Solicitar formato optimizado

            const response = await api.get(`/audit/logs/entity/${entityType}/id/${entityId}?${params.toString()}`);
            setLoading(false);
            return response.data;
        } catch (err) {
            handleError(err);
            setLoading(false);
            return {
                success: false,
                data: [],
                pagination: {
                    total: 0,
                    limit: limit,
                    offset: (page - 1) * limit
                }
            };
        }
    }, []);

    /**
     * Verificar salud del servicio de auditoría
     * @returns {Promise<Object>} - Promesa con el estado de salud
     */
    const checkAuditHealth = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/audit/health');
            setLoading(false);
            return response.data;
        } catch (err) {
            handleError(err);
            setLoading(false);
            return {
                success: false,
                status: 'error',
                message: 'Servicio no disponible'
            };
        }
    }, []);

    /**
     * Exportar logs a un archivo
     * @param {Object} filters - Filtros aplicados
     * @param {string} format - Formato de exportación (csv, pdf)
     * @returns {Promise<Object>} - Promesa con el resultado
     */
    const exportLogs = useCallback(async (filters = {}, format = 'csv') => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();

            // Filtrar parámetros vacíos
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    params.append(key, value);
                }
            });

            params.append('format', format);
            params.append('optimize', 'true'); // Solicitar formato optimizado

            const response = await api.get(`/audit/export?${params.toString()}`, {
                responseType: 'blob'
            });

            // Crear un enlace de descarga
            const blob = new Blob([response.data], {
                type: format === 'csv' ? 'text/csv' : 'application/pdf'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
            link.click();
            window.URL.revokeObjectURL(url);

            setLoading(false);
            return { success: true };
        } catch (err) {
            handleError(err);
            setLoading(false);
            return {
                success: false,
                message: 'Error al exportar logs'
            };
        }
    }, []);

    /**
     * Limpiar errores
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loading,
        error,
        getLogs,
        getLogsByAction,
        getLogsByEntity,
        getLogsByUser,
        getLogsByDateRange,
        getAuditSummary,
        getLogsByEntityId,
        checkAuditHealth,
        exportLogs,
        clearError
    };
};