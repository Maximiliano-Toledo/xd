import React from 'react';
import {
    LuArrowRight,
    LuClipboard,
    LuServer,
    LuGlobe,
    LuCalendar,
    LuUser,
    LuTag,
    LuInfo,
    LuPlus,
    LuPencil,
    LuToggleRight,
    LuShuffle,
    LuUpload,
    LuDownload,
    LuUsers,
    LuFileText,
    LuPhone
} from 'react-icons/lu';
import dayjs from 'dayjs';
import { formatPhonesForDisplay } from '../../../utils/phoneFormatter';

const HistorialItemDetails = ({ log }) => {
    if (!log) return null;

    // Verificar si hay cambios para mostrar
    const hasChanges = log.changes && log.changes.length > 0;

    // Determinar si mostrar una o dos columnas de valores
    const showSingleColumn = [
        'create',
        'individual_upload',
        'bulk_upload',
        'download_csv',
        'download_pdf'
    ].includes(log.action);

    // Función para detectar si un campo es de teléfonos
    const isPhoneField = (fieldName) => {
        const phoneFields = ['telefono', 'telefonos', 'phone', 'phones'];
        return phoneFields.some(field =>
          fieldName.toLowerCase().includes(field.toLowerCase())
        );
    };

    // Función para detectar si un valor es JSON de teléfonos
    const isPhoneJsonValue = (value) => {
        if (typeof value !== 'string') return false;

        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Verificar si tiene estructura de teléfono
                const firstItem = parsed[0];
                return firstItem &&
                  typeof firstItem === 'object' &&
                  (firstItem.hasOwnProperty('tipo') ||
                    firstItem.hasOwnProperty('codigoArea') ||
                    firstItem.hasOwnProperty('numero'));
            }
        } catch (e) {
            return false;
        }

        return false;
    };

    // Función para formatear valor para visualización
    const formatValue = (value, fieldName = '') => {
        if (value === null || value === undefined) {
            return <span className="text-muted">Sin especificar</span>;
        }
        if (value === '') {
            return <span className="text-muted">Vacío</span>;
        }

        // Si es un boolean, convertir a Sí/No
        if (typeof value === 'boolean') {
            return <span className={value ? 'text-success' : 'text-danger'}>{value ? 'Sí' : 'No'}</span>;
        }

        // NUEVO: Formatear teléfonos si es un campo de teléfono o contiene JSON de teléfonos
        if (isPhoneField(fieldName) || isPhoneJsonValue(value)) {
            try {
                const formattedPhones = formatPhonesForDisplay(value);
                if (formattedPhones && formattedPhones !== value) {
                    return (
                      <div className="phone-formatted">
                          <LuPhone className="me-1 text-primary" size={14} />
                          <span>{formattedPhones}</span>
                      </div>
                    );
                }
            } catch (error) {
                console.warn('Error al formatear teléfonos:', error);
                // Si falla el formateo, continuar con el formateo normal
            }
        }

        // Si es un array, mostrar como lista
        if (Array.isArray(value)) {
            return value.join(', ');
        }

        // Si es un objeto, mostrar en formato JSON
        if (typeof value === 'object') {
            try {
                return <code className="json-value">{JSON.stringify(value, null, 2)}</code>;
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
            individual_upload: 'Prestador creado',
            bulk_upload: 'Carga masiva realizada',
            update: 'Cambios realizados',
            edit_provider: 'Prestador modificado',
            edit_plan: 'Plan modificado',
            edit_specialty: 'Especialidad modificada',
            delete: 'Datos eliminados',
            toggle_status: 'Estado modificado',
            update_order: 'Orden modificado',
            enable_plan: 'Plan habilitado',
            disable_plan: 'Plan deshabilitado',
            enable_specialty: 'Especialidad habilitada',
            disable_specialty: 'Especialidad deshabilitada',
            download_csv: 'Descarga CSV realizada',
            download_pdf: 'Descarga PDF realizada'
        };

        return titles[log.action] || 'Detalles de la operación';
    };

    // Obtener ícono según tipo de acción
    const getActionIcon = () => {
        const icons = {
            create: <LuPlus className="text-success" />,
            individual_upload: <LuPlus className="text-success" />,
            bulk_upload: <LuUsers className="text-success" />,
            update: <LuPencil className="text-primary" />,
            edit_provider: <LuPencil className="text-primary" />,
            edit_plan: <LuPencil className="text-primary" />,
            edit_specialty: <LuPencil className="text-primary" />,
            toggle_status: <LuToggleRight className="text-warning" />,
            update_order: <LuShuffle className="text-info" />,
            enable_plan: <LuToggleRight className="text-success" />,
            disable_plan: <LuToggleRight className="text-danger" />,
            enable_specialty: <LuToggleRight className="text-success" />,
            disable_specialty: <LuToggleRight className="text-danger" />,
            download_csv: <LuDownload className="text-info" />,
            download_pdf: <LuDownload className="text-info" />
        };

        return icons[log.action] || <LuInfo className="text-secondary" />;
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

        if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
        if (userAgent.indexOf('Safari') > -1) return 'Safari';
        if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
        if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) return 'Internet Explorer';
        if (userAgent.indexOf('Edge') > -1) return 'Edge';

        return userAgent.split(' ')[0];
    };

    const browserName = getBrowserName(userAgent);

    // Función para obtener clase CSS según el tipo de cambio
    const getChangeRowClass = (change) => {
        if (showSingleColumn) return '';

        // Si hay cambio de valor, resaltar
        if (change.oldValue !== change.newValue) {
            return 'bg-light-warning';
        }

        return '';
    };

    // Función para renderizar el valor con formato especial
    const renderFormattedValue = (value, fieldName = '', isOld = false) => {
        const formatted = formatValue(value, fieldName);

        if (showSingleColumn) {
            return <span className="change-new">{formatted}</span>;
        }

        const className = isOld ? 'change-old' : 'change-new';
        return <span className={className}>{formatted}</span>;
    };

    // Función para mostrar información específica según el tipo de acción
    const renderActionSpecificInfo = () => {
        switch (log.action) {
            case 'bulk_upload':
                return (
                  <div className="additional-info">
                      <h6><LuUsers className="me-2" />Información de carga masiva:</h6>
                      <div className="row">
                          <div className="col-md-4">
                              <small className="text-muted">Registros procesados:</small>
                              <div className="fw-bold">{log.totalProcessed || 'No especificado'}</div>
                          </div>
                          <div className="col-md-4">
                              <small className="text-muted">Registros exitosos:</small>
                              <div className="text-success fw-bold">{log.successful || 'No especificado'}</div>
                          </div>
                          <div className="col-md-4">
                              <small className="text-muted">Registros fallidos:</small>
                              <div className="text-danger fw-bold">{log.failed || 'No especificado'}</div>
                          </div>
                      </div>
                  </div>
                );

            case 'update_order':
                return (
                  <div className="additional-info">
                      <h6><LuShuffle className="me-2" />Información del reordenamiento:</h6>
                      <div className="alert alert-info">
                          <div className="d-flex align-items-center">
                              <LuInfo className="me-2" />
                              <div>
                                  Se modificó el orden de visualización de los elementos.
                                  {log.changes && log.changes.length > 0 && (
                                    <div className="mt-2">
                                        <strong>Elementos reordenados:</strong> {log.changes.length}
                                    </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
                );

            case 'download_csv':
            case 'download_pdf':
                return (
                  <div className="additional-info">
                      <h6><LuDownload className="me-2" />Información de descarga:</h6>
                      <div className="row">
                          <div className="col-md-6">
                              <small className="text-muted">Formato:</small>
                              <div className="fw-bold">
                                  {log.action === 'download_csv' ? (
                                    <span className="badge bg-success">CSV</span>
                                  ) : (
                                    <span className="badge bg-danger">PDF</span>
                                  )}
                              </div>
                          </div>
                          <div className="col-md-6">
                              <small className="text-muted">Filtros aplicados:</small>
                              <div className="fw-bold">{log.filters ? Object.keys(log.filters).length : 0} filtros</div>
                          </div>
                      </div>
                  </div>
                );

            case 'toggle_status':
                return (
                  <div className="additional-info">
                      <h6><LuToggleRight className="me-2" />Cambio de estado:</h6>
                      <div className="alert alert-warning">
                          <div className="d-flex align-items-center justify-content-between">
                              <div>
                                  <strong>Estado anterior:</strong>
                                  <span className="badge bg-secondary ms-2">{log.changes?.[0]?.oldValue || 'No especificado'}</span>
                              </div>
                              <LuArrowRight className="mx-3" />
                              <div>
                                  <strong>Estado nuevo:</strong>
                                  <span className="badge bg-primary ms-2">{log.changes?.[0]?.newValue || 'No especificado'}</span>
                              </div>
                          </div>
                      </div>
                  </div>
                );

            default:
                return null;
        }
    };

    return (
      <div className="log-details">
          {hasChanges ? (
            <div className="log-changes">
                <div className="change-section-title">
                    {getActionIcon()}
                    <h4 className="mb-0 ms-2">{getActionTitle()}</h4>
                </div>

                <div className="change-details">
                    {showSingleColumn ? (
                      // Vista para creaciones y operaciones sin comparación (una sola columna)
                      <table className="table table-changes table-sm">
                          <thead>
                          <tr>
                              <th style={{ width: '30%' }}>Campo</th>
                              <th style={{ width: '70%' }}>Valor</th>
                          </tr>
                          </thead>
                          <tbody>
                          {log.changes.map((change, idx) => (
                            <tr key={idx} className={getChangeRowClass(change)}>
                                <td>
                                    <span className="field-name">{change.label || change.field}</span>
                                </td>
                                <td className="field-value">
                                    {renderFormattedValue(change.newValue, change.field)}
                                </td>
                            </tr>
                          ))}
                          </tbody>
                      </table>
                    ) : (
                      // Vista para ediciones (dos columnas con flecha)
                      <table className="table table-changes table-sm">
                          <thead>
                          <tr>
                              <th style={{ width: '25%' }}>Campo</th>
                              <th style={{ width: '32%' }}>Valor anterior</th>
                              <th style={{ width: '8%', textAlign: 'center' }}></th>
                              <th style={{ width: '35%' }}>Valor nuevo</th>
                          </tr>
                          </thead>
                          <tbody>
                          {log.changes.map((change, idx) => (
                            <tr key={idx} className={getChangeRowClass(change)}>
                                <td>
                                    <span className="field-name">{change.label || change.field}</span>
                                </td>
                                <td className="field-value">
                                    {renderFormattedValue(change.oldValue, change.field, true)}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <LuArrowRight className="text-muted" />
                                </td>
                                <td className="field-value">
                                    {renderFormattedValue(change.newValue, change.field)}
                                </td>
                            </tr>
                          ))}
                          </tbody>
                      </table>
                    )}
                </div>
            </div>
          ) : (
            <div className="log-detail-message">
                <LuInfo className="detail-icon" />
                <span>No hay cambios detallados disponibles para esta acción.</span>
            </div>
          )}

          {/* Información específica del tipo de acción */}
          {renderActionSpecificInfo()}

          {/* Información adicional */}
          <div className="log-details-grid">
              <div className="log-detail-item">
                    <span className="log-detail-label">
                        <LuCalendar className="me-1" />
                        Fecha y hora
                    </span>
                  <span className="log-detail-value">{formatISODate(log.timestamp)}</span>
              </div>

              <div className="log-detail-item">
                    <span className="log-detail-label">
                        <LuUser className="me-1" />
                        Usuario
                    </span>
                  <span className="log-detail-value">
                        {log.user?.username || 'Usuario desconocido'}
                      <span className="badge bg-secondary ms-2">{log.user?.role || 'Sin rol'}</span>
                    </span>
              </div>

              <div className="log-detail-item">
                    <span className="log-detail-label">
                        <LuTag className="me-1" />
                        Entidad
                    </span>
                  <span className="log-detail-value">
                        {log.entity?.type || 'Entidad desconocida'}
                      {log.entity?.id && ` #${log.entity.id}`}
                      {log.entity?.name && (
                        <span className="badge bg-info ms-2">{log.entity.name}</span>
                      )}
                    </span>
              </div>

              <div className="log-detail-item">
                    <span className="log-detail-label">
                        <LuGlobe className="me-1" />
                        Dirección IP
                    </span>
                  <span className="log-detail-value">{userIP}</span>
              </div>

              <div className="log-detail-item">
                    <span className="log-detail-label">
                        <LuServer className="me-1" />
                        Navegador
                    </span>
                  <span className="log-detail-value">{browserName}</span>
              </div>

              {log.description && (
                <div className="log-detail-item log-detail-description">
                        <span className="log-detail-label">
                            <LuClipboard className="me-1" />
                            Descripción
                        </span>
                    <span className="log-detail-value">{log.description}</span>
                </div>
              )}
          </div>
      </div>
    );
};

export default HistorialItemDetails;