import React from 'react';
import {
    LuArrowRight,
    LuClipboard,
    LuServer,
    LuGlobe,
    LuCalendar,
    LuUser,
    LuTag,
    LuInfo
} from 'react-icons/lu';
import dayjs from 'dayjs';

const HistorialItemDetails = ({ log }) => {
    if (!log) return null;

    // Verificar si hay cambios para mostrar
    const hasChanges = log.changes && log.changes.length > 0;

    // Determinar si mostrar una o dos columnas de valores
    const showSingleColumn = log.action === 'create';

    // Función para formatear valor para visualización
    const formatValue = (value) => {
        if (value === null || value === undefined) return '-';
        if (value === '') return 'Vacío';

        // Si es un boolean, convertir a Sí/No
        if (typeof value === 'boolean') {
            return value ? 'Sí' : 'No';
        }

        // Si es un objeto o array, mostrar en formato JSON
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value);
            } catch (e) {
                return String(value);
            }
        }

        return String(value);
    };

    // Obtener título según tipo de acción
    const getActionTitle = () => {
        const titles = {
            create: 'Datos creados',
            update: 'Cambios realizados',
            delete: 'Datos eliminados',
            toggle_status: 'Cambio de estado',
            individual_upload: 'Registro creado',
            bulk_upload: 'Registros creados',
            edit_provider: 'Modificación de prestador',
            edit_plan: 'Modificación de plan'
        };

        return titles[log.action] || 'Detalles de la operación';
    };

    // Formatear fecha ISO completa
    const formatISODate = (dateString) => {
        if (!dateString) return '-';
        return dayjs(dateString).format('DD/MM/YYYY HH:mm:ss');
    };

    // Valores por defecto para información técnica
    const userIP = log.technical?.ipAddress || '127.0.0.1';
    const userAgent = log.technical?.userAgent || navigator.userAgent || 'Navegador desconocido';

    // Extraer nombre del navegador del user agent
    const getBrowserName = (userAgent) => {
        if (!userAgent) return 'Desconocido';

        // Extraer el primer segmento que suele contener el nombre del navegador
        if (userAgent.indexOf('(') > 0) {
            return userAgent.split(' ')[0].replace(/[\(\)]/g, '');
        }

        // Detección básica de navegadores comunes
        if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
        if (userAgent.indexOf('Safari') > -1) return 'Safari';
        if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
        if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) return 'Internet Explorer';
        if (userAgent.indexOf('Edge') > -1) return 'Edge';

        return userAgent.split(' ')[0];
    };

    const browserName = getBrowserName(userAgent);

    return (
        <div className="log-details">
            {hasChanges ? (
                <div className="log-changes">
                    <h4>{getActionTitle()}</h4>
                    <div className="changes-list">
                        {log.changes.map((change, idx) => (
                            <div className="change-item" key={idx}>
                                <span className="change-field">{change.label || change.field}</span>

                                {showSingleColumn ? (
                                    <span className="change-new">{formatValue(change.newValue)}</span>
                                ) : (
                                    <>
                                        <span className="change-old">{formatValue(change.oldValue)}</span>
                                        <span className="change-arrow"><LuArrowRight /></span>
                                        <span className="change-new">{formatValue(change.newValue)}</span>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="log-detail-message">
                    <LuInfo className="detail-icon" />
                    <span>No hay cambios detallados disponibles para esta acción.</span>
                </div>
            )}

            <div className="log-details-grid">
                {/* Datos básicos */}
                {/* <div className="log-detail-item">
                    <span className="log-detail-label">Acción</span>
                    <span className="log-detail-value">{log.action || 'No especificada'}</span>
                </div> */}

                <div className="log-detail-item">
                    <span className="log-detail-label">Fecha y hora</span>
                    <span className="log-detail-value">{formatISODate(log.timestamp)}</span>
                </div>

                {/* Información de usuario */}
                {/* <div className="log-detail-item">
                    <span className="log-detail-label">Usuario</span>
                    <span className="log-detail-value">
                        {log.user?.username || 'Usuario desconocido'}
                        ({log.user?.role || 'Sin rol'})
                    </span>
                </div> */}

                {/* Entidad afectada */}
                {/* <div className="log-detail-item">
                    <span className="log-detail-label">Entidad</span>
                    <span className="log-detail-value">
                        {log.entity?.type || 'Entidad desconocida'}
                        {log.entity?.id && ` #${log.entity.id}`}
                        {log.entity?.name && ` - ${log.entity.name}`}
                    </span>
                </div> */}

                {/* Información técnica - siempre visible */}
                <div className="log-detail-item">
                    <span className="log-detail-label">Dirección IP</span>
                    <span className="log-detail-value">{userIP}</span>
                </div>

                <div className="log-detail-item">
                    <span className="log-detail-label">Navegador</span>
                    <span className="log-detail-value">{browserName}</span>
                </div>

                {/* Descripción si está disponible */}
                {log.description && (
                    <div className="log-detail-item log-detail-description">
                        <span className="log-detail-label">Descripción</span>
                        <span className="log-detail-value">{log.description}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistorialItemDetails;