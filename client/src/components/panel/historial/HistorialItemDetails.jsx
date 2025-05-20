import React from 'react';
import {
    MdInfoOutline,
    MdCompareArrows,
    MdCalendarToday,
    MdPerson,
    MdOutlineLabel,
    MdComputer,
    MdAddCircleOutline,
    MdEdit,
    MdToggleOn
} from 'react-icons/md';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';

// Configurar dayjs
dayjs.locale('es');
dayjs.extend(relativeTime);

/**
 * Componente que muestra detalles de auditoría desde un formato estandarizado
 */
const HistorialItemDetails = ({ log }) => {
    if (!log) return null;

    // Formatear valor para visualización
    const formatValue = (value, isArray = false) => {
        if (value === null || value === undefined || value === '') {
            return '-';
        }
        return value;
    };

    // Obtener icono según tipo de acción
    const getActionIcon = (action) => {
        switch (action) {
            case 'create':
                return <MdAddCircleOutline className="text-success" size={24} />;
            case 'update':
            case 'edit_provider':
                return <MdEdit className="text-primary" size={24} />;
            case 'toggleStatus':
                return <MdToggleOn className="text-warning" size={24} />;
            default:
                return <MdInfoOutline className="text-secondary" size={24} />;
        }
    };

    // Obtener título según tipo de acción
    const getActionTitle = (action) => {
        switch (action) {
            case 'create':
                return 'Datos creados:';
            case 'update':
            case 'edit_provider':
                return 'Cambios realizados:';
            case 'toggleStatus':
                return 'Cambio de estado:';
            default:
                return 'Detalles:';
        }
    };

    // Formatear fecha para visualización
    const formattedDate = dayjs(log.timestamp).format('DD/MM/YYYY HH:mm:ss');
    const relativeTime = dayjs(log.timestamp).fromNow();

    // Verificar si hay cambios para mostrar
    const hasChanges = log.changes && log.changes.length > 0;

    // Determinar si mostrar una o dos columnas de valores
    const showSingleColumn = log.action === 'create';

    return (
        <div className="log-details p-3">
            {/* Encabezado con información general */}
            <div className="d-flex align-items-center mb-3">
                <div className="action-icon-container me-3">
                    {getActionIcon(log.action)}
                </div>
                <div className="flex-grow-1">
                    <h5 className="mb-1 timeline-title">{log.description}</h5>
                    <div className="d-flex flex-wrap align-items-center text-muted small">
                        <div className="me-3 d-flex align-items-center">
                            <MdCalendarToday className="me-1" />
                            <span>{formattedDate}</span>
                            <span className="ms-2 text-nowrap">({relativeTime})</span>
                        </div>
                        <div className="me-3 d-flex align-items-center">
                            <MdPerson className="me-1" />
                            <span>{log.user.username}</span>
                            <span className="badge bg-secondary ms-2">{log.user.role}</span>
                        </div>
                        <div className="d-flex align-items-center">
                            <MdOutlineLabel className="me-1" />
                            <span>{log.entity.type} #{log.entity.id}</span>
                            {log.entity.name && (
                                <span className="ms-1">({log.entity.name})</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de cambios/datos */}
            {hasChanges ? (
                <div className="timeline-details mt-3">
                    <div className="d-flex align-items-center mb-2">
                        {getActionIcon(log.action)}
                        <h6 className="mb-0 ms-2">{getActionTitle(log.action)}</h6>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-sm table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>Campo</th>
                                    {showSingleColumn ? (
                                        <th>Valor</th>
                                    ) : (
                                        <>
                                            <th>Valor anterior</th>
                                            <th>Valor nuevo</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {log.changes.map((change, idx) => (
                                    <tr key={idx}>
                                        <td className="fw-semibold">{change.label}</td>
                                        {showSingleColumn ? (
                                            <td>{formatValue(change.newValue, change.isArray)}</td>
                                        ) : (
                                            <>
                                                <td>{formatValue(change.oldValue, change.isArray)}</td>
                                                <td>{formatValue(change.newValue, change.isArray)}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="alert alert-info mt-3">
                    <MdInfoOutline className="me-2" />
                    No se detectaron datos relevantes para esta operación.
                </div>
            )}

            {/* Información técnica (opcional) */}
            {log.technical && (log.technical.ipAddress || log.technical.userAgent) && (
                <div className="mt-3 small text-muted d-flex align-items-center">
                    <MdComputer className="me-1" />
                    <span>
                        Ejecutado desde: {log.technical.ipAddress || 'IP desconocida'}
                        {log.technical.userAgent && (
                            <>
                                {' | '}
                                {log.technical.userAgent.split(' ')[0].replace(/[\(\)]/g, '')}
                            </>
                        )}
                    </span>
                </div>
            )}
        </div>
    );
};

export default HistorialItemDetails;