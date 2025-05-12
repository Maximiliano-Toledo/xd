import { useState, useCallback } from 'react';
import api from '../api/axiosConfig';

export const useAuditApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función auxiliar para manejar errores
    const handleError = (err) => {
        const errorMessage = err.response?.data?.error || err.message || 'Error desconocido';
        setError(errorMessage);
        throw new Error(errorMessage);
    };

    // Obtener logs generales con paginación
    const getLogs = useCallback(async (page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/audit/logs?limit=${limit}&offset=${(page - 1) * limit}`);
            return response.data;
        } catch (err) {
            return handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener logs por acción
    const getLogsByAction = useCallback(async (action, page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/audit/logs/action/${action}?limit=${limit}&offset=${(page - 1) * limit}`);
            return response.data;
        } catch (err) {
            return handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener logs por tipo de entidad
    const getLogsByEntity = useCallback(async (entityType, page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/audit/logs/entity/${entityType}?limit=${limit}&offset=${(page - 1) * limit}`);
            return response.data;
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
            return response.data;
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
            const response = await api.get(`/audit/logs/date-range?startDate=${startDate}&endDate=${endDate}&limit=${limit}&offset=${(page - 1) * limit}`);
            return response.data;
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
            return response.data;
        } catch (err) {
            return handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener logs por entidad específica (ID)
    const getLogsByEntityId = useCallback(async (entityType, entityId, page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/audit/logs/entity/${entityType}/id/${entityId}?limit=${limit}&offset=${(page - 1) * limit}`);
            return response.data;
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
            return response.data;
        } catch (err) {
            return handleError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Exportar logs (para funcionalidad futura)
    const exportLogs = useCallback(async (filters = {}, format = 'csv') => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams(filters);
            params.append('format', format);

            const response = await api.get(`/audit/export?${params.toString()}`, {
                responseType: 'blob'
            });

            // Crear un enlace de descarga
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
            link.click();
            window.URL.revokeObjectURL(url);

            return { success: true };
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