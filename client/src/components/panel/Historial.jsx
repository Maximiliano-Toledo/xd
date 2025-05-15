// Historial.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
    MdSubdirectoryArrowLeft,
    MdFilterList,
    MdRefresh,
    MdDownload
} from 'react-icons/md';
import {
    LuActivity,
    LuCalendar,
    LuUser,
    LuEye,
    LuClock,
    LuFilter,
    LuSearch,
    LuFileText,
    LuServer,
    LuShield,
    LuPenTool,
    LuPlus,
    LuTrash2,
    LuToggleLeft,
    LuToggleRight,
    LuUpload,
    LuDownload as LuDownloadIcon
} from 'react-icons/lu';
import HeaderStaff from '../../layouts/HeaderStaff';
import { useAuditApi } from '../../hooks/useAuditApi';
import Pagination from '../Pagination';
import '../../styles/historial-actividad.css';

const Historial = () => {
    const navigate = useNavigate();
    const {
        getLogs,
        getLogsByEntity,
        getLogsByAction,
        getLogsByUser,
        getLogsByDateRange,
        loading,
        error
    } = useAuditApi();

    // Estados locales
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedUser, setSelectedUser] = useState('');
    const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
    const [expandedLog, setExpandedLog] = useState(null);

    // Estados de paginación
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
    });

    // Mapeo de acciones a iconos y colores
    const actionIcons = {
        'create': { icon: <LuPlus />, color: 'success', label: 'Creación' },
        'update': { icon: <LuPenTool />, color: 'info', label: 'Actualización' },
        'delete': { icon: <LuTrash2 />, color: 'danger', label: 'Eliminación' },
        'toggleStatus': { icon: <LuToggleLeft />, color: 'warning', label: 'Cambio Estado' },
        'login': { icon: <LuShield />, color: 'primary', label: 'Inicio Sesión' },
        'logout': { icon: <LuShield />, color: 'secondary', label: 'Cierre Sesión' },
        'export': { icon: <LuDownloadIcon />, color: 'info', label: 'Exportación' },
        'import': { icon: <LuUpload />, color: 'success', label: 'Importación' },
        'query': { icon: <LuSearch />, color: 'primary', label: 'Consulta' },
        'default': { icon: <LuActivity />, color: 'secondary', label: 'Acción' }
    };

    // Mapeo de entidades
    const entityLabels = {
        'planes': 'Planes',
        'especialidades': 'Especialidades',
        'categorias_prestador': 'Categorías',
        'prestadores': 'Prestadores',
        'cartilla': 'Cartilla',
        'users': 'Usuarios',
        'provincias': 'Provincias',
        'localidades': 'Localidades'
    };

    // Cargar datos iniciales
    useEffect(() => {
        fetchLogs();
    }, []);

    // Aplicar filtros
    useEffect(() => {
        applyFilters();
    }, [logs, searchTerm, filterType, dateRange, selectedUser]);

    const fetchLogs = async (page = 1, limit = pagination.itemsPerPage) => {
        try {
            const response = await getLogs(page, limit);
            if (response && response.data) {
                setLogs(response.data);
                setPagination({
                    currentPage: page,
                    totalPages: Math.ceil((response.pagination?.total || 0) / limit),
                    totalItems: response.pagination?.total || 0,
                    itemsPerPage: limit,
                    hasNextPage: response.pagination?.hasMore || false,
                    hasPrevPage: page > 1,
                });
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
        }
    };

    const applyFilters = () => {
        let filtered = [...logs];

        // Filtro por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(log =>
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.user?.username && log.user.username.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filtro por tipo de acción
        if (filterType !== 'all') {
            filtered = filtered.filter(log => log.action.includes(filterType));
        }

        // Filtro por rango de fechas
        if (dateRange.start && dateRange.end) {
            filtered = filtered.filter(log => {
                const logDate = new Date(log.timestamp);
                const startDate = new Date(dateRange.start);
                const endDate = new Date(dateRange.end);
                return logDate >= startDate && logDate <= endDate;
            });
        }

        // Filtro por usuario
        if (selectedUser) {
            filtered = filtered.filter(log =>
                log.user?.username === selectedUser
            );
        }

        setFilteredLogs(filtered);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDetails = (details) => {
        if (!details) return null;

        try {
            const parsed = typeof details === 'string' ? JSON.parse(details) : details;
            return parsed;
        } catch {
            return details;
        }
    };

    const getActionInfo = (action) => {
        // Buscar coincidencia exacta primero
        if (actionIcons[action]) {
            return actionIcons[action];
        }

        // Buscar por prefijo
        for (const [key, value] of Object.entries(actionIcons)) {
            if (action.includes(key)) {
                return value;
            }
        }

        return actionIcons.default;
    };

    const handlePageChange = (page) => {
        fetchLogs(page, pagination.itemsPerPage);
    };

    const handlePageSizeChange = (newSize) => {
        fetchLogs(1, newSize);
    };

    const handleRefresh = () => {
        fetchLogs(pagination.currentPage, pagination.itemsPerPage);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterType('all');
        setDateRange({ start: '', end: '' });
        setSelectedUser('');
    };

    const handleVolver = () => {
        navigate(-1);
    };

    const renderLogCard = (log) => {
        const actionInfo = getActionInfo(log.action);
        const details = formatDetails(log.details);
        const isExpanded = expandedLog === log.id;

        return (
            <div key={log.id} className="log-card">
                <div className="log-card-header">
                    <div className="log-icon-wrapper">
                        <div className={`log-icon log-icon-${actionInfo.color}`}>
                            {actionInfo.icon}
                        </div>
                    </div>

                    <div className="log-main-info">
                        <div className="log-action-title">
                            <span className="log-action-text">{actionInfo.label}</span>
                            <span className="log-entity-badge">
                                {entityLabels[log.entity_type] || log.entity_type}
                            </span>
                        </div>
                        <div className="log-meta">
                            <span className="log-user">
                                <LuUser className="meta-icon" />
                                {log.user?.username || 'Sistema'}
                            </span>
                            <span className="log-date">
                                <LuClock className="meta-icon" />
                                {formatDate(log.timestamp)}
                            </span>
                        </div>
                    </div>

                    <button
                        className="log-expand-btn"
                        onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                    >
                        <LuEye />
                    </button>
                </div>

                {isExpanded && (
                    <div className="log-card-details">
                        <div className="log-details-grid">
                            <div className="log-detail-item">
                                <span className="log-detail-label">ID Entidad:</span>
                                <span className="log-detail-value">{log.entity_id}</span>
                            </div>
                            {details && details.ip && (
                                <div className="log-detail-item">
                                    <span className="log-detail-label">IP:</span>
                                    <span className="log-detail-value">{details.ip}</span>
                                </div>
                            )}
                            {details && details.actionType && (
                                <div className="log-detail-item">
                                    <span className="log-detail-label">Tipo:</span>
                                    <span className="log-detail-value">{details.actionType}</span>
                                </div>
                            )}
                        </div>

                        {details && details.changes && (
                            <div className="log-changes">
                                <h4>Cambios realizados:</h4>
                                <div className="changes-list">
                                    {details.changes.map((change, index) => (
                                        <div key={index} className="change-item">
                                            <span className="change-field">{change.field}:</span>
                                            <span className="change-old">"{change.oldValue}"</span>
                                            <span className="change-arrow">→</span>
                                            <span className="change-new">"{change.newValue}"</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const stats = {
        total: logs.length,
        creates: logs.filter(log => log.action.includes('create')).length,
        updates: logs.filter(log => log.action.includes('update')).length,
        deletes: logs.filter(log => log.action.includes('delete')).length
    };

    return (
        <div className="historial-container">
            <HeaderStaff />

            {/* Header */}
            <div className="historial-header">
                <div className="container">
                    <h1 className="historial-title">Historial de Actividad</h1>
                    <p className="historial-subtitle">
                        Visualiza las últimas acciones realizadas en el sistema
                    </p>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="historial-content">
                <div className="container">
                    {/* Estadísticas rápidas */}
                    <div className="stats-bar">
                        <div className="stat-item">
                            <span className="stat-label">Total</span>
                            <span className="stat-value">{stats.total}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Creaciones</span>
                            <span className="stat-value stat-success">{stats.creates}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Actualizaciones</span>
                            <span className="stat-value stat-info">{stats.updates}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Eliminaciones</span>
                            <span className="stat-value stat-danger">{stats.deletes}</span>
                        </div>
                    </div>

                    {/* Controles y filtros */}
                    <div className="historial-controls">
                        <div className="controls-row">
                            {/* Búsqueda */}
                            <div className="search-box">
                                <LuSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Buscar por acción, entidad o usuario..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>

                            {/* Filtros */}
                            <div className="filters-row">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">Todas las acciones</option>
                                    <option value="create">Creaciones</option>
                                    <option value="update">Actualizaciones</option>
                                    <option value="delete">Eliminaciones</option>
                                    <option value="login">Sesiones</option>
                                    <option value="export">Exportaciones</option>
                                    <option value="import">Importaciones</option>
                                </select>

                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="date-input"
                                />

                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="date-input"
                                />

                                <button
                                    onClick={handleClearFilters}
                                    className="clear-filters-btn"
                                    title="Limpiar filtros"
                                >
                                    <MdFilterList />
                                </button>

                                <button
                                    onClick={handleRefresh}
                                    className="refresh-btn"
                                    title="Actualizar"
                                    disabled={loading}
                                >
                                    <MdRefresh className={loading ? 'spinning' : ''} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Lista de logs */}
                    <div className="historial-main">
                        {loading ? (
                            <div className="loading-container">
                                <div className="loading-spinner">
                                    <div className="spinner"></div>
                                    <p className="loading-text">Cargando historial...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="error-container">
                                <div className="error-content">
                                    <LuFileText className="error-icon" />
                                    <h3>Error al cargar el historial</h3>
                                    <p>{error}</p>
                                    <button onClick={handleRefresh} className="retry-btn">
                                        <MdRefresh /> Reintentar
                                    </button>
                                </div>
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-content">
                                    <LuActivity className="empty-icon" />
                                    <h3>No hay actividad registrada</h3>
                                    <p>No se encontraron logs que coincidan con los filtros aplicados.</p>
                                    <button onClick={handleClearFilters} className="clear-filters-btn">
                                        Limpiar filtros
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="logs-container">
                                    {filteredLogs.map(renderLogCard)}
                                </div>

                                {/* Paginación */}
                                <div className="pagination-wrapper">
                                    <Pagination
                                        currentPage={pagination.currentPage}
                                        totalPages={pagination.totalPages}
                                        totalItems={pagination.totalItems}
                                        itemsPerPage={pagination.itemsPerPage}
                                        onPageChange={handlePageChange}
                                        onItemsPerPageChange={handlePageSizeChange}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Botón volver */}
            <div className="back-button-container">
                <button className="back-button" onClick={handleVolver}>
                    <MdSubdirectoryArrowLeft />
                    <span>Volver</span>
                </button>
            </div>
        </div>
    );
};

export default Historial;