import React, { useState } from 'react';
import { LuCalendar, LuActivity, LuDatabase, LuSearch, LuX } from 'react-icons/lu';

const HistorialFilter = ({ filter, onFilterApply, loading }) => {
    const [localFilter, setLocalFilter] = useState({ ...filter });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFilter({ ...localFilter, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onFilterApply(localFilter);
    };

    const handleReset = () => {
        const emptyFilter = {
            dateFrom: '',
            dateTo: '',
            action: '',
            entityType: ''
        };
        setLocalFilter(emptyFilter);
        onFilterApply(emptyFilter);
    };

    return (
        <form onSubmit={handleSubmit} className="filter-form">
            <div className="filter-grid">
                <div className="filter-group">
                    <label htmlFor="dateFrom" className="filter-label">
                        <LuCalendar className="filter-icon" /> Desde
                    </label>
                    <input
                        type="date"
                        id="dateFrom"
                        name="dateFrom"
                        className="date-input"
                        value={localFilter.dateFrom}
                        onChange={handleChange}
                    />
                </div>

                <div className="filter-group">
                    <label htmlFor="dateTo" className="filter-label">
                        <LuCalendar className="filter-icon" /> Hasta
                    </label>
                    <input
                        type="date"
                        id="dateTo"
                        name="dateTo"
                        className="date-input"
                        value={localFilter.dateTo}
                        onChange={handleChange}
                    />
                </div>

                <div className="filter-group">
                    <label htmlFor="action" className="filter-label">
                        <LuActivity className="filter-icon" /> Tipo de acción
                    </label>
                    <select
                        id="action"
                        name="action"
                        className="filter-select"
                        value={localFilter.action}
                        onChange={handleChange}
                    >
                        <option value="">Todas las acciones</option>
                        <option value="individual_upload">Carga individual</option>
                        <option value="bulk_upload">Carga masiva</option>
                        <option value="download_csv">Descarga CSV</option>
                        <option value="download_pdf">Descarga PDF</option>
                        <option value="edit_provider">Edición de prestador</option>
                        <option value="edit_plan">Edición de plan</option>
                        <option value="create_plan">Creación de plan</option>
                        <option value="toggle_status">Cambio de estado</option>
                        <option value="login">Inicio de sesión</option>
                        <option value="logout">Cierre de sesión</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="entityType" className="filter-label">
                        <LuDatabase className="filter-icon" /> Entidad
                    </label>
                    <select
                        id="entityType"
                        name="entityType"
                        className="filter-select"
                        value={localFilter.entityType}
                        onChange={handleChange}
                    >
                        <option value="">Todas las entidades</option>
                        <option value="prestadores">Prestadores</option>
                        <option value="planes">Planes</option>
                        <option value="especialidades">Especialidades</option>
                        <option value="cartilla">Cartilla</option>
                        <option value="usuarios">Usuarios</option>
                    </select>
                </div>
            </div>

            <div className="filter-actions">
                <button
                    type="button"
                    className="clear-filters-btn"
                    onClick={handleReset}
                >
                    <LuX /> Limpiar
                </button>

                <button
                    type="submit"
                    className="apply-filters-btn"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div className="spinner-small"></div>
                            <span>Aplicando...</span>
                        </>
                    ) : (
                        <>
                            <LuSearch />
                            <span>Aplicar filtros</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default HistorialFilter;