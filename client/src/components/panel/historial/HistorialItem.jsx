import React, { useState } from 'react';
import {
    LuUser,
    LuCalendar,
    LuTag,
    LuChevronDown,
    LuChevronUp,
    LuPen,
    LuPlus,
    LuTrash2,
    LuEye,
    LuLogIn,
    LuLogOut,
    LuUpload,
    LuDownload,
    LuToggleRight,
    LuInfo,
    LuGlobe
} from 'react-icons/lu';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import HistorialItemDetails from './HistorialItemDetails';

// Configurar dayjs
dayjs.locale('es');
dayjs.extend(relativeTime);

const HistorialItem = ({ log, index, fadeEffect }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Determinar si hay cambios para mostrar
    const hasChanges = log.changes && log.changes.length > 0;

    // Definición de íconos según tipo de acción
    const getActionIcon = (action) => {
        const actionIcons = {
            create: <LuPlus />,
            update: <LuPen />,
            delete: <LuTrash2 />,
            view: <LuEye />,
            login: <LuLogIn />,
            logout: <LuLogOut />,
            individual_upload: <LuUpload />,
            bulk_upload: <LuUpload />,
            download_csv: <LuDownload />,
            download_pdf: <LuDownload />,
            edit_provider: <LuPen />,
            edit_plan: <LuPen />,
            create_plan: <LuPlus />,
            toggle_status: <LuToggleRight />
        };

        return actionIcons[action] || <LuInfo />;
    };

    // Función para obtener clase CSS según acción
    const getActionClass = (action) => {
        const actionClasses = {
            create: 'log-icon-success',
            update: 'log-icon-primary',
            delete: 'log-icon-danger',
            view: 'log-icon-info',
            login: 'log-icon-success',
            logout: 'log-icon-warning',
            individual_upload: 'log-icon-primary',
            bulk_upload: 'log-icon-success',
            download_csv: 'log-icon-info',
            download_pdf: 'log-icon-danger',
            edit_provider: 'log-icon-primary',
            edit_plan: 'log-icon-primary',
            create_plan: 'log-icon-success',
            toggle_status: 'log-icon-warning'
        };

        return actionClasses[action] || 'log-icon-secondary';
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

    // Procesar información del log
    const action = log.action;
    const description = log.description || 'Acción en el sistema';
    const dateInfo = formatDate(log?.timestamp);
    const userName = log.user?.username || 'Usuario desconocido';
    const userRole = log.user?.role || 'Usuario';
    const entityType = log.entity?.type || 'No especificado';
    const entityId = log.entity?.id || '';
    const entityName = log.entity?.name || '';

    // Contar cambios reales para mostrar badge
    const changesCount = hasChanges ? log.changes.filter(c =>
        c.oldValue !== c.newValue &&
        !(c.oldValue === null && c.newValue === null)
    ).length : 0;

    // Toggle expandir/colapsar detalles
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`log-card ${fadeEffect ? 'refreshing' : ''}`}>
            <div className="log-card-header">
                <div className="log-icon-wrapper">
                    <div className={`log-icon ${getActionClass(action)}`}>
                        {getActionIcon(action)}
                    </div>
                </div>

                <div className="log-main-info">
                    <div className="log-action-title">
                        <span className="log-action-text">{description}</span>
                        <span className="log-entity-badge">
                            {entityType}
                            {entityId && ` #${entityId}`}
                        </span>
                        {changesCount > 0 && (
                            <span className="log-changes-badge">{changesCount}</span>
                        )}
                    </div>

                    <div className="log-meta">
                        <div className="log-date">
                            <LuCalendar className="meta-icon" />
                            <span title={dateInfo.formatted}>{dateInfo.relative}</span>
                        </div>

                        <div className="log-user">
                            <LuUser className="meta-icon" />
                            <span>{userName}</span>
                            <span className="log-user-role">{userRole}</span>
                        </div>

                        {entityName && (
                            <div className="log-entity">
                                <LuTag className="meta-icon" />
                                <span>{entityName}</span>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    className="log-expand-btn"
                    onClick={toggleExpand}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? "Colapsar detalles" : "Expandir detalles"}
                >
                    {isExpanded ? <LuChevronUp /> : <LuChevronDown />}
                </button>
            </div>

            {isExpanded && (
                <div className="log-card-details">
                    <HistorialItemDetails log={log} />
                </div>
            )}
        </div>
    );
};

export default HistorialItem;