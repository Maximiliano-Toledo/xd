import React from 'react';

const HistorialFilter = ({ filter, setFilter, handleFilter, loading }) => {
    return (
        <div className="d-flex justify-content-center align-items-start">
            <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow m-4">
                <div className="row mb-3">
                    <div className="col-md-3">
                        <label className="form-label">Desde:</label>
                        <input
                            type="date"
                            className="form-control"
                            value={filter.dateFrom}
                            onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Hasta:</label>
                        <input
                            type="date"
                            className="form-control"
                            value={filter.dateTo}
                            onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Tipo de acción:</label>
                        <select
                            className="form-select"
                            value={filter.action}
                            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
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
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Entidad:</label>
                        <select
                            className="form-select"
                            value={filter.entityType}
                            onChange={(e) => setFilter({ ...filter, entityType: e.target.value })}
                        >
                            <option value="">Todas las entidades</option>
                            <option value="prestadores">Prestadores</option>
                            <option value="planes">Planes</option>
                            <option value="especialidades">Especialidades</option>
                            <option value="cartilla">Cartilla</option>
                        </select>
                    </div>
                </div>
                <div className="d-flex justify-content-end">
                    <button
                        className="btn btn-primary"
                        onClick={handleFilter}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Filtrando...
                            </>
                        ) : "Filtrar"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HistorialFilter;