import { useState, useEffect } from 'react';
import { MdOutlineKeyboardDoubleArrowRight, MdSubdirectoryArrowLeft } from 'react-icons/md';
import { MdFilterList, MdRefresh, MdDownload } from 'react-icons/md';
import { FiClock, FiUser, FiActivity, FiFile } from 'react-icons/fi';
import { BsCalendar } from 'react-icons/bs';
import HeaderStaff from '../../layouts/HeaderStaff';
import '../../styles/panel-usuario.css'
import '../../styles/historial.css'
import { useNavigate } from 'react-router';
import useAuthStore from '../../stores/authStore';
import { useAuditApi } from '../../hooks/useAuditApi';

const Historial = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        loading,
        error,
        getLogs,
        getLogsByAction,
        getLogsByEntity,
        getLogsByUser,
        getLogsByDateRange,
        clearError
    } = useAuditApi();

    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: 10,
        total: 0,
        hasMore: false
    });
    const [filters, setFilters] = useState({
        action: '',
        entityType: '',
        dateRange: {
            startDate: '',
            endDate: ''
        }
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Mapeo de acciones a español
    const actionMap = {
        'create': 'Crear',
        'update': 'Actualizar',
        'delete': 'Eliminar'
    };

    // Mapeo de tipos de entidad a español
    const entityTypeMap = {
        'prestador': 'Prestador',
        'plan': 'Plan',
        'especialidad': 'Especialidad',
        'categoria': 'Categoría',
        'user': 'Usuario'
    };

    const handleVolver = () => {
        navigate(-1);
    };

    // Cargar logs desde la API
    const fetchLogs = async (page = 1) => {
        try {
            clearError();
            let data;

            // Aplicar filtros según el tipo seleccionado
            if (filters.action) {
                data = await getLogsByAction(filters.action, page, pagination.limit);
            } else if (filters.entityType) {
                data = await getLogsByEntity(filters.entityType, page, pagination.limit);
            } else if (filters.dateRange.startDate && filters.dateRange.endDate) {
                data = await getLogsByDateRange(filters.dateRange.startDate, filters.dateRange.endDate, page, pagination.limit);
            } else {
                data = await getLogs(page, pagination.limit);
            }

            if (data.success) {
                setLogs(data.data);
                setPagination(prev => ({
                    ...prev,
                    currentPage: page,
                    total: data.pagination?.total || data.data.length,
                    hasMore: data.pagination?.hasMore || false
                }));
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    // Filtrar logs por usuario actual
    const fetchUserLogs = async () => {
        try {
            clearError();
            const data = await getLogsByUser(user.id, 1, pagination.limit);

            if (data.success) {
                setLogs(data.data);
                setPagination(prev => ({
                    ...prev,
                    currentPage: 1,
                    total: data.pagination?.count || data.data.length,
                    hasMore: false
                }));
            }
        } catch (error) {
            console.error('Error fetching user logs:', error);
        }
    };

    // Aplicar filtros
    const applyFilters = () => {
        fetchLogs(1);
        setIsFilterOpen(false);
    };

    // Limpiar filtros
    const clearFilters = () => {
        setFilters({
            action: '',
            entityType: '',
            dateRange: {
                startDate: '',
                endDate: ''
            }
        });
        fetchLogs(1);
        setIsFilterOpen(false);
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Obtener icono de acción
    const getActionIcon = (action) => {
        switch (action) {
            case 'create':
                return <FiFile className="action-icon create" />;
            case 'update':
                return <FiActivity className="action-icon update" />;
            case 'delete':
                return <MdOutlineKeyboardDoubleArrowRight className="action-icon delete" />;
            default:
                return <FiActivity className="action-icon" />;
        }
    };

    // Efecto para cargar datos iniciales
    useEffect(() => {
        fetchLogs(1);
    }, []);

    return (
        <div className="historial-container">
            <HeaderStaff />

            <h6 className="w-25 fs-3 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 m-4">
                Historial de actividad
            </h6>

            <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
                <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5 ms-4 me-4">
                    <h1 className="fs-2 h1-titulo fw-bold border p-2 d-flex align-items-center">
                        <div className='rounded-color d-flex justify-content-center align-items-center me-4'>
                            <MdOutlineKeyboardDoubleArrowRight className="fs-1 text-white" />
                        </div>
                        Historial de actividad
                    </h1>
                    <h2 className="fs-2 h1-titulo p-2 fw-normal">
                        Visualizá las últimas acciones realizadas en el sistema.
                    </h2>
                </div>
            </div>

            <div className="historial-controls">
                <div className="controls-left">
                    <button
                        className="btn btn-filter"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        <MdFilterList className="me-2" />
                        Filtros
                    </button>
                    <button
                        className="btn btn-refresh"
                        onClick={() => fetchLogs(pagination.currentPage)}
                        disabled={loading}
                    >
                        <MdRefresh className="me-2" />
                        Actualizar
                    </button>
                    <button
                        className="btn btn-user-logs"
                        onClick={fetchUserLogs}
                        disabled={loading}
                    >
                        <FiUser className="me-2" />
                        Mis actividades
                    </button>
                </div>
                <div className="controls-right">
                    <select
                        className="form-select"
                        value={pagination.limit}
                        onChange={(e) => {
                            setPagination(prev => ({ ...prev, limit: parseInt(e.target.value) }));
                            fetchLogs(1);
                        }}
                    >
                        <option value="10">10 registros</option>
                        <option value="20">20 registros</option>
                        <option value="50">50 registros</option>
                    </select>
                </div>
            </div>

            {/* Panel de filtros */}
            {isFilterOpen && (
                <div className="filter-panel">
                    <div className="filter-content">
                        <h5>Filtrar por:</h5>
                        <div className="filter-grid">
                            <div className="filter-group">
                                <label>Acción:</label>
                                <select
                                    className="form-select"
                                    value={filters.action}
                                    onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                                >
                                    <option value="">Todas las acciones</option>
                                    <option value="create">Crear</option>
                                    <option value="update">Actualizar</option>
                                    <option value="delete">Eliminar</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Tipo de entidad:</label>
                                <select
                                    className="form-select"
                                    value={filters.entityType}
                                    onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
                                >
                                    <option value="">Todos los tipos</option>
                                    <option value="prestador">Prestador</option>
                                    <option value="plan">Plan</option>
                                    <option value="especialidad">Especialidad</option>
                                    <option value="categoria">Categoría</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Fecha desde:</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filters.dateRange.startDate}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        dateRange: { ...prev.dateRange, startDate: e.target.value }
                                    }))}
                                />
                            </div>
                            <div className="filter-group">
                                <label>Fecha hasta:</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filters.dateRange.endDate}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        dateRange: { ...prev.dateRange, endDate: e.target.value }
                                    }))}
                                />
                            </div>
                        </div>
                        <div className="filter-actions">
                            <button className="btn btn-volver" onClick={clearFilters}>
                                Limpiar filtros
                            </button>
                            <button className="btn btn-cargar" onClick={applyFilters}>
                                Aplicar filtros
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Resumen de auditoría */}
            <div className="d-flex justify-content-center m-4">
                <div className="w-100">
                    <AuditSummary />
                </div>
            </div>

            <div className="d-flex justify-content-center align-items-start min-vh-75">
                <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow m-4">
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p>Cargando historial...</p>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="alert alert-danger" role="alert">
                                {error}
                                <button
                                    className="btn btn-sm btn-outline-danger ms-3"
                                    onClick={() => fetchLogs(1)}
                                >
                                    Reintentar
                                </button>
                            </div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="no-data-container">
                            <FiActivity className="no-data-icon" />
                            <h4>No hay actividades registradas</h4>
                            <p className="text-muted">Aún no se han registrado actividades en el sistema.</p>
                        </div>
                    ) : (
                        <>
                            <div className="historial-list">
                                {logs.map((log, index) => (
                                    <div key={log.id || index} className="historial-item">
                                        <div className="historial-item-header">
                                            <div className="historial-icon">
                                                {getActionIcon(log.action)}
                                            </div>
                                            <div className="historial-main-info">
                                                <h5 className="historial-action">
                                                    {actionMap[log.action] || log.action}
                                                    <span className="historial-entity">
                                                        {entityTypeMap[log.entity_type] || log.entity_type}
                                                    </span>
                                                </h5>
                                                <div className="historial-meta">
                                                    <span className="historial-user">
                                                        <FiUser className="me-1" />
                                                        {log.user?.username || 'Usuario desconocido'}
                                                    </span>
                                                    <span className="historial-date">
                                                        <FiClock className="me-1" />
                                                        {formatDate(log.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {log.details && (
                                            <div className="historial-details">
                                                <strong>Detalles:</strong>
                                                <pre>{JSON.stringify(log.details, null, 2)}</pre>
                                            </div>
                                        )}

                                        {log.entity_id && (
                                            <div className="historial-entity-id">
                                                <small>ID de entidad: {log.entity_id}</small>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Paginación */}
                            {pagination.total > pagination.limit && (
                                <div className="pagination-controls">
                                    <button
                                        className="btn btn-pagination"
                                        disabled={pagination.currentPage === 1}
                                        onClick={() => fetchLogs(pagination.currentPage - 1)}
                                    >
                                        Anterior
                                    </button>
                                    <span className="pagination-info">
                                        Página {pagination.currentPage} de {Math.ceil(pagination.total / pagination.limit)}
                                    </span>
                                    <button
                                        className="btn btn-pagination"
                                        disabled={!pagination.hasMore}
                                        onClick={() => fetchLogs(pagination.currentPage + 1)}
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <button
                className='btn btn-volver rounded-pill text-white text-center text-uppercase'
                type='button'
                onClick={handleVolver}
            >
                <MdSubdirectoryArrowLeft className='text-white' /> Volver
            </button>
        </div>
    );
};

export default Historial;