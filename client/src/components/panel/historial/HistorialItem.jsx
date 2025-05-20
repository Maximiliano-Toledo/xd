import React from 'react';
import {
    MdOutlineCalendarToday,
    MdPerson,
    MdOutlineLabel,
    MdDescription,
    MdEditNote
} from 'react-icons/md';
import {
    FaEdit,
    FaDownload,
    FaUpload,
    FaToggleOn,
    FaUserPlus,
    FaTrash,
    FaEye,
    FaSignInAlt,
    FaSignOutAlt,
    FaRegListAlt,
    FaCog
} from 'react-icons/fa';
import HistorialItemDetails from './HistorialItemDetails';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';

// Configurar dayjs
dayjs.locale('es');
dayjs.extend(relativeTime);

/**
 * Componente que muestra un item individual en la línea de tiempo
 * Actualizado para soportar el nuevo formato optimizado
 */
const HistorialItem = ({ log, index }) => {
    // Determinar si estamos usando el formato antiguo o el nuevo
    const isOldFormat = log.formattedDetails && log.formattedDetails.context;

    // Definición de íconos según tipo de acción
    const actionIcons = {
        create: <FaUserPlus className="action-icon text-success" />,
        update: <FaEdit className="action-icon text-primary" />,
        delete: <FaTrash className="action-icon text-danger" />,
        view: <FaEye className="action-icon text-info" />,
        login: <FaSignInAlt className="action-icon text-success" />,
        logout: <FaSignOutAlt className="action-icon text-warning" />,
        individual_upload: <FaUpload className="action-icon text-primary" />,
        bulk_upload: <FaUpload className="action-icon text-success" />,
        download_csv: <FaDownload className="action-icon text-info" />,
        download_pdf: <FaDownload className="action-icon text-danger" />,
        edit_provider: <FaEdit className="action-icon text-primary" />,
        enable_plan: <FaToggleOn className="action-icon text-success" />,
        disable_plan: <FaToggleOn className="action-icon text-danger" />,
        edit_plan: <FaEdit className="action-icon text-primary" />,
        create_plan: <FaUserPlus className="action-icon text-success" />,
        enable_specialty: <FaToggleOn className="action-icon text-success" />,
        disable_specialty: <FaToggleOn className="action-icon text-danger" />,
        edit_specialty: <FaEdit className="action-icon text-primary" />,
        create_specialty: <FaUserPlus className="action-icon text-success" />,
        toggle_status: <FaToggleOn className="action-icon text-warning" />,
        default: <MdDescription className="action-icon text-secondary" />
    };

    // Función para obtener icono según acción
    const getActionIcon = (action) => {
        return actionIcons[action] || actionIcons.default;
    };

    // Función para formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return { formatted: 'Fecha desconocida', relative: '' };

        const date = dayjs(dateString);
        return {
            formatted: date.format('DD/MM/YYYY HH:mm'),
            relative: date.fromNow()
        };
    };

    // Obtener la acción, descripción y fecha según el formato
    const action = log.action;
    const description = isOldFormat
        ? (log.formattedDetails?.description || 'Acción en el sistema')
        : (log.description || 'Acción en el sistema');

    const dateInfo = formatDate(log?.timestamp);

    // Obtener información de usuario
    const userName = isOldFormat
        ? (log.user?.username || 'Usuario desconocido')
        : (log.user?.username || 'Usuario desconocido');

    const userRole = isOldFormat
        ? (log.user?.role || 'Usuario')
        : (log.user?.role || 'Usuario');

    // Obtener información de entidad
    const entityType = isOldFormat
        ? (log.entity_type || 'No especificado')
        : (log.entity?.type || 'No especificado');

    const entityId = isOldFormat
        ? (log.entity_id || 'No especificado')
        : (log.entity?.id || 'No especificado');

    // Contar cambios reales (para mostrar badge)
    const countRealChanges = () => {
        if (isOldFormat && log.formattedDetails?.context?.cambios) {
            return log.formattedDetails.context.cambios.filter(c =>
                c.valorAnterior !== c.valorNuevo &&
                !(c.valorAnterior === 'No especificado' && c.valorNuevo === 'No especificado')
            ).length;
        } else if (log.changes) {
            return log.changes.filter(c =>
                c.oldValue !== c.newValue &&
                !(c.oldValue === null && c.newValue === null)
            ).length;
        }
        return 0;
    };

    const changesCount = countRealChanges();

    return (
        <div className="activity-item">
            <div className="activity-timeline-card mb-4">
                <div className="timeline-card-header d-flex align-items-center p-3 border-bottom">
                    <div className="action-icon-container me-3">
                        {getActionIcon(action)}
                    </div>
                    <div className="flex-grow-1">
                        <h5 className="mb-0 timeline-title">
                            {description}
                            {changesCount > 0 && (
                                <span className="badge bg-primary ms-2">{changesCount} cambio{changesCount !== 1 ? 's' : ''}</span>
                            )}
                        </h5>
                        <div className="d-flex align-items-center text-muted small">
                            <MdOutlineCalendarToday className="me-1" />
                            <span>{dateInfo.formatted}</span>
                            <span className="ms-2 text-nowrap">({dateInfo.relative})</span>
                        </div>
                    </div>
                </div>

                <div className="timeline-card-body p-3">
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <div className="d-flex align-items-center mb-2">
                                <MdPerson className="me-2 text-primary" />
                                <h6 className="mb-0">Usuario:</h6>
                            </div>
                            <p className="ms-4 mb-0">
                                <span>
                                    {userName}
                                    <span className="badge bg-secondary ms-2">{userRole}</span>
                                </span>
                            </p>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex align-items-center mb-2">
                                <MdOutlineLabel className="me-2 text-primary" />
                                <h6 className="mb-0">Entidad:</h6>
                            </div>
                            <p className="ms-4 mb-0">
                                {entityType} {entityId > 0 ? `#${entityId}` : ''}
                                {!isOldFormat && log.entity?.name && (
                                    <span className="text-primary ms-2">({log.entity.name})</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="timeline-details mt-3">
                        <div className="d-flex align-items-center mb-2">
                            <MdEditNote className="me-2 text-primary" size={20} />
                            <h6 className="mb-0">Detalles:</h6>
                        </div>
                        <div className="ms-4 details-content p-3 bg-light rounded">
                            <HistorialItemDetails log={log} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistorialItem;