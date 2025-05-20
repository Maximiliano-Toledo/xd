import React, { useState, useEffect } from 'react';
import { MdSubdirectoryArrowLeft } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAuditApi } from '../../hooks/useAuditApi';
import HeaderStaff from '../../layouts/HeaderStaff';
import HistorialHeader from './historial/HistorialHeader';
import HistorialFilter from './historial/HistorialFilter';
import HistorialTimeline from './historial/HistorialTimeline';
import Pagination from '../Pagination';
import '../../styles/panel-usuario.css';
import '../../styles/historial.css';

/**
 * Componente principal del historial de actividad, actualizado para trabajar
 * con el nuevo formato optimizado de logs de auditoría
 */
const Historial = () => {
    const navigate = useNavigate();
    const { getLogs, loading, error, clearError } = useAuditApi();
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [filter, setFilter] = useState({
        dateFrom: '',
        dateTo: '',
        action: '',
        entityType: ''
    });

    // Función para cargar los registros de auditoría
    const fetchLogs = async (pageNumber = page, pageSize = itemsPerPage, filters = filter) => {
        try {
            clearError && clearError();

            // Construir los parámetros de la consulta según los filtros
            let queryParams = {};

            if (filters.dateFrom) queryParams.startDate = filters.dateFrom;
            if (filters.dateTo) queryParams.endDate = filters.dateTo;
            if (filters.action) queryParams.action = filters.action;
            if (filters.entityType) queryParams.entityType = filters.entityType;

            const result = await getLogs(pageNumber, pageSize, queryParams);

            if (result && result.success) {
                // Los datos ahora vienen directamente en el formato optimizado
                setLogs(result.data || []);

                if (result.pagination && typeof result.pagination.total !== 'undefined') {
                    setTotalItems(result.pagination.total);
                    setTotalPages(Math.ceil(result.pagination.total / result.pagination.limit));
                } else {
                    setTotalItems(0);
                    setTotalPages(1);
                }
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
        }
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
    const handleFilter = async () => {
        try {
            setPage(1); // Resetear a primera página al filtrar
            await fetchLogs(1, itemsPerPage, filter);
        } catch (err) {
            console.error('Error al aplicar filtros:', err);
        }
    };

    // Volver a la página anterior
    const handleVolver = () => {
        navigate(-1);
    };

    return (
        <div className="historial-container">
            <HeaderStaff />

            {/* Encabezado */}
            <HistorialHeader />

            {/* Filtros */}
            <HistorialFilter
                filter={filter}
                setFilter={setFilter}
                handleFilter={handleFilter}
                loading={loading}
            />

            {/* Timeline de actividad */}
            <div className="d-flex justify-content-center align-items-start">
                <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow m-4">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="mt-3">Cargando historial de actividad...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger" role="alert">
                            <p className="mb-0">Error al cargar el historial: {error}</p>
                            <button
                                className="btn btn-outline-danger mt-2"
                                onClick={() => {
                                    setPage(1);
                                    clearError && clearError();
                                    fetchLogs(1, itemsPerPage);
                                }}
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Pasar los logs en su nuevo formato */}
                            <HistorialTimeline logs={logs || []} />

                            {/* Paginación utilizando el nuevo componente */}
                            {totalPages > 0 && (
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                    itemsPerPage={itemsPerPage}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                    totalItems={totalItems}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Botón volver */}
            <div className="d-flex justify-content-center mb-4">
                <button
                    className="btn btn-volver rounded-pill text-white text-center text-uppercase"
                    type="button"
                    onClick={handleVolver}
                >
                    <MdSubdirectoryArrowLeft className="text-white" /> Volver
                </button>
            </div>
        </div>
    );
};

export default Historial;