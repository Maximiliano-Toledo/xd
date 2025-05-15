import { useState, useCallback } from 'react';
import api from '../api/axiosConfig';

export const useAuditApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función auxiliar para manejar errores
    const handleError = (err) => {
        console.error('Audit API Error:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Error desconocido';
        setError(errorMessage);
        throw new Error(errorMessage);
    };

    // Función auxiliar para procesar la respuesta
    const processResponse = (response) => {
        if (response.data.success) {
            return response.data;
        }
        throw new Error(response.data.error || 'Error en la respuesta');
    };

    // Obtener logs generales con paginación
    const getLogs = useCallback(async (page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/audit/logs?limit=${limit}&offset=${(page - 1) * limit}`);
            return processResponse(response);
        } catch (err) {
            return handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener logs por acción (create, update, delete, etc.)
    const getLogsByAction = useCallback(async (action, page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/audit/logs/action/${action}?limit=${limit}&offset=${(page - 1) * limit}`);
            return processResponse(response);
        } catch (err) {
            return handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener logs por tipo de entidad (planes, prestadores, etc.)
    const getLogsByEntity = useCallback(async (entityType, page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/audit/logs/entity/${entityType}?limit=${limit}&offset=${(page - 1) * limit}`);
            return processResponse(response);
        } catch (err) {
            return handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener logs por usuario
    const getLogsByUser = useCallback(async (userId, page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/audit/logs/user/${userId}?limit=${limit}&offset=${(page - 1) * limit}`);
            return processResponse(response);
        } catch (err) {
            return handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener logs por rango de fechas
    const getLogsByDateRange = useCallback(async (startDate, endDate, page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            // Formatear fechas para la API
            const start = new Date(startDate).toISOString().split('T')[0];
            const end = new Date(endDate).toISOString().split('T')[0];

            const response = await api.get(
                `/audit/logs/date-range?startDate=${start}&endDate=${end}&limit=${limit}&offset=${(page - 1) * limit}`
            );
            return processResponse(response);
        } catch (err) {
            return handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener logs por ID específico de entidad
    const getLogsByEntityId = useCallback(async (entityType, entityId, page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(
                `/audit/logs/entity/${entityType}/id/${entityId}?limit=${limit}&offset=${(page - 1) * limit}`
            );
            return processResponse(response);
        } catch (err) {
            return handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener resumen de auditoría
    const getAuditSummary = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/audit/summary');
            return processResponse(response);
        } catch (err) {
            return handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Verificar salud del servicio de auditoría
    const checkAuditHealth = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/audit/health');
            return processResponse(response);
        } catch (err) {
            return handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Exportar logs en formato CSV
    const exportLogs = useCallback(async (filters = {}, format = 'csv') => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();

            // Agregar filtros a los parámetros
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    params.append(key, value);
                }
            });

            params.append('format', format);

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

            // Generar nombre de archivo con timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            link.download = `audit-logs-${timestamp}.${format}`;

            // Agregar al DOM, hacer clic y limpiar
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            return { success: true, message: 'Archivo descargado exitosamente' };
        } catch (err) {
            return handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Limpiar errores
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Función para obtener estadísticas rápidas
    const getQuickStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/audit/quick-stats');
            return processResponse(response);
        } catch (err) {
            return handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Búsqueda de logs con filtros múltiples
    const searchLogs = useCallback(async (searchParams, page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', limit);

            // Agregar parámetros de búsqueda
            Object.entries(searchParams).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    params.append(key, value);
                }
            });

            const response = await api.get(`/audit/search?${params.toString()}`);
            return processResponse(response);
        } catch (err) {
            return handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        // Estados
        loading,
        error,

        // Métodos principales
        getLogs,
        getLogsByAction,
        getLogsByEntity,
        getLogsByUser,
        getLogsByDateRange,
        getLogsByEntityId,
        getAuditSummary,

        // Métodos adicionales
        checkAuditHealth,
        exportLogs,
        getQuickStats,
        searchLogs,
        clearError,

        // Helpers
        isLoading: loading,
        hasError: !!error
    };
};