import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditApi } from '../../hooks/useAuditApi';
import HeaderStaff from '../../layouts/HeaderStaff';
import { LuHistory, LuCalendarClock, LuFilter, LuActivity, LuRefreshCw, LuArrowLeft } from 'react-icons/lu';
import { MdSubdirectoryArrowLeft } from "react-icons/md";
import HistorialFilter from './historial/HistorialFilter';
import HistorialTimeline from './historial/HistorialTimeline';
import Pagination from '../Pagination';
import '../../styles/historial-actividad.css';

const Historial = () => {
    const navigate = useNavigate();
    const { getLogs, loading, error, clearError } = useAuditApi();
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [showFilter, setShowFilter] = useState(false);
    const [filter, setFilter] = useState({
        dateFrom: '',
        dateTo: '',
        action: '',
        entityType: ''
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalActions: 0,
        totalUsers: 0,
        lastActivity: 'Sin actividad reciente',
        commonAction: 'N/A'
    });

    // Función para cargar los registros de auditoría
    const fetchLogs = async (pageNumber = page, pageSize = itemsPerPage, filters = filter) => {
        try {
            clearError && clearError();
            setIsRefreshing(true);

            // Construir los parámetros de la consulta según los filtros
            let queryParams = {};

            if (filters.dateFrom) queryParams.startDate = filters.dateFrom;
            if (filters.dateTo) queryParams.endDate = filters.dateTo;
            if (filters.action) queryParams.action = filters.action;
            if (filters.entityType) queryParams.entityType = filters.entityType;

            const result = await getLogs(pageNumber, pageSize, queryParams);

            if (result && result.success) {
                setLogs(result.data || []);

                if (result.pagination && typeof result.pagination.total !== 'undefined') {
                    setTotalItems(result.pagination.total);
                    setTotalPages(Math.ceil(result.pagination.total / result.pagination.limit));
                } else {
                    setTotalItems(0);
                    setTotalPages(1);
                }

                // Estadísticas simuladas - En producción, estas vendrían del backend
                setStats({
                    totalActions: result.pagination?.total || 0,
                    totalUsers: Math.min(result.pagination?.total || 0, 15),
                    lastActivity: result.data[0]?.timestamp ? new Date(result.data[0].timestamp).toLocaleString() : 'Sin actividad reciente',
                    commonAction: result.data.length > 0 ? getMostCommonAction(result.data) : 'N/A'
                });
            } else {
                setLogs([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (err) {
            console.error('Error al obtener historial:', err);
            setLogs([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Función para obtener la acción más común
    const getMostCommonAction = (data) => {
        const actionCounts = {};
        data.forEach(log => {
            actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
        });

        let maxAction = 'none';
        let maxCount = 0;

        Object.keys(actionCounts).forEach(action => {
            if (actionCounts[action] > maxCount) {
                maxCount = actionCounts[action];
                maxAction = action;
            }
        });

        return formatActionName(maxAction);
    };

    // Función para formatear nombre de acción
    const formatActionName = (action) => {
        if (!action) return 'N/A';

        // Formateo básico para acciones comunes
        const actionMap = {
            'individual_upload': 'Carga individual',
            'bulk_upload': 'Carga masiva',
            'download_csv': 'Descarga CSV',
            'download_pdf': 'Descarga PDF',
            'edit_provider': 'Edición prestador',
            'create': 'Creación',
            'update': 'Actualización',
            'delete': 'Eliminación',
            'login': 'Inicio sesión',
            'logout': 'Cierre sesión',
            'toggle_status': 'Cambio estado'
        };

        return actionMap[action] || action.replace('_', ' ');
    };

    // Cargar logs al inicio o cuando cambia la página o la cantidad de ítems por página
    useEffect(() => {
        fetchLogs(page, itemsPerPage);
    }, [page, itemsPerPage]);

    // Manejar cambio en la cantidad de ítems por página
    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setPage(1); // Resetear a primera página cuando cambia la cantidad de ítems por página
    };

    // Manejar filtrado de registros
    const handleFilter = async (filterData) => {
        try {
            setPage(1); // Resetear a primera página al filtrar
            setFilter(filterData);
            await fetchLogs(1, itemsPerPage, filterData);
        } catch (err) {
            console.error('Error al aplicar filtros:', err);
        }
    };

    // Volver a la página anterior
    const handleVolver = () => {
        navigate(-1);
    };

    // Refrescar datos
    const handleRefresh = () => {
        fetchLogs(page, itemsPerPage, filter);
    };

    // Toggle mostrar/ocultar filtros
    const toggleFilters = () => {
        setShowFilter(!showFilter);
    };

    return (
        <div className="historial-container">
            <HeaderStaff />

            <h1 className="w-50 fs-4 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 m-4">
                Historial de actividad
            </h1>
            <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
                <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5 ms-4 me-4">
                    <h6 className="fs-3 h1-titulo fw-bold">Visualiza y analiza todas las acciones realizadas en el sistema.</h6>
                </div>
            </div>

            <div className="historial-content">
                <div className="container">
                    {/* Barra de estadísticas */}
                    <div className="stats-bar">
                        <div className="stat-item">
                            <span className="stat-label">Total de acciones</span>
                            <span className="stat-value stat-info">{stats.totalActions}</span>
                        </div>

                        <div className="stat-item">
                            <span className="stat-label">Última actividad</span>
                            <span className="stat-value">{stats.lastActivity}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Acción más común</span>
                            <span className="stat-value stat-warning">{stats.commonAction}</span>
                        </div>
                    </div>

                    {/* Controles de filtrado */}
                    <div className="historial-controls">
                        <div className="controls-row">
                            <div className="filters-row">
                                <div className="search-box">
                                    <LuFilter className="search-icon" />
                                    <button
                                        className="search-input"
                                        onClick={toggleFilters}
                                        style={{ cursor: 'pointer', textAlign: 'left' }}
                                    >
                                        {showFilter ? 'Ocultar filtros avanzados' : 'Mostrar filtros avanzados'}
                                    </button>
                                </div>

                                <button className="refresh-btn" onClick={handleRefresh} disabled={isRefreshing}>
                                    <LuRefreshCw className={isRefreshing ? 'spinning' : ''} />
                                </button>
                            </div>

                            {/* Filtros avanzados condicionalmente mostrados */}
                            {showFilter && (
                                <HistorialFilter
                                    filter={filter}
                                    onFilterApply={handleFilter}
                                    loading={loading}
                                />
                            )}
                        </div>
                    </div>

                    {/* Contenido principal con logs */}
                    <div className="historial-main">
                        <div className="logs-container">
                            {loading && !isRefreshing ? (
                                <div className="loading-container">
                                    <div className="loading-spinner">
                                        <div className="spinner"></div>
                                    </div>
                                    <p className="loading-text">Cargando historial de actividad...</p>
                                </div>
                            ) : error ? (
                                <div className="error-container">
                                    <div className="error-content">
                                        <LuActivity className="error-icon" />
                                        <h3>Error al cargar el historial</h3>
                                        <p>{error || 'Se produjo un error inesperado. Intente nuevamente.'}</p>
                                        <button className="retry-btn" onClick={handleRefresh}>
                                            <LuRefreshCw /> Reintentar
                                        </button>
                                    </div>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-content">
                                        <LuHistory className="empty-icon" />
                                        <h3>No hay registros de actividad</h3>
                                        <p>No se encontraron registros que coincidan con los criterios de búsqueda seleccionados.</p>
                                    </div>
                                </div>
                            ) : (
                                <HistorialTimeline logs={logs} isRefreshing={isRefreshing} />
                            )}
                        </div>

                        {/* Paginación */}
                        {totalPages > 0 && (
                            <div className="pagination-wrapper">
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                    itemsPerPage={itemsPerPage}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                    totalItems={totalItems}
                                />
                            </div>
                        )}
                    </div>

                    {/* Botón volver - usando exactamente el mismo estilo que en PanelUsuario */}
                    <div className="back-button-container">
                        <button className="back-button" onClick={handleVolver}>
                            <MdSubdirectoryArrowLeft />
                            <span>Volver</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Historial;