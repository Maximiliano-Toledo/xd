import React from 'react';
import HistorialItem from './HistorialItem';

/**
 * Componente que muestra la línea de tiempo del historial
 * Actualizado para trabajar con el nuevo formato optimizado
 */
const HistorialTimeline = ({ logs }) => {
    // Asegurarnos de que logs es un array antes de intentar mapearlo
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
        return (
            <div className="text-center py-5">
                <span className="display-1 text-muted">📄</span>
                <h4 className="mt-3">No hay registros de actividad</h4>
                <p className="text-muted">No se encontraron registros de actividad en el sistema.</p>
            </div>
        );
    }

    return (
        <div className="activity-timeline">
            {logs.map((log, index) => (
                <HistorialItem
                    key={log?.id || index}
                    log={log}
                    index={index}
                />
            ))}
        </div>
    );
};

export default HistorialTimeline;