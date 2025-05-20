import React from 'react';
import HistorialItem from './HistorialItem';

const HistorialTimeline = ({ logs, isRefreshing }) => {
    // Asegurarnos de que logs es un array antes de intentar mapearlo
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
        return null; // El componente principal ya maneja el estado vacío
    }

    return (
        <div className="log-timeline">
            {logs.map((log, index) => (
                <HistorialItem
                    key={log?.id || index}
                    log={log}
                    index={index}
                    fadeEffect={isRefreshing}
                />
            ))}
        </div>
    );
};

export default HistorialTimeline;