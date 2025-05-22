import React from "react";
import { FiSearch } from "react-icons/fi";

const ResultsStep = ({
                       prestadores,
                       loading,
                       pagination,
                       handlePageChange,
                       handleSelectPrestador,
                       goToSearch
                     }) => {
  return (
    <div className="container-fluid px-2 px-md-4">
      <div className="row justify-content-center">
        <div className="col-12">
          <div className="border shadow-input p-3 p-md-5 rounded-3 shadow my-3 my-md-5">
            <h4 className="mb-4">Resultados de búsqueda</h4>

            {loading.prestadores ? (
              <div className="text-center my-5">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p>Cargando prestadores...</p>
              </div>
            ) : prestadores.length > 0 ? (
              <>
                {/* Vista de tabla para pantallas medianas y grandes */}
                <div className="d-none d-md-block">
                  <div className="table-responsive">
                    <table
                      className="table table-hover shadow"
                      style={{
                        borderCollapse: "separate",
                        borderSpacing: "0",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <thead>
                      <tr>
                        <th
                          className="text-center fw-medium letter-color bg-color-icon"
                          style={{
                            backgroundColor: "#f8f9fa",
                            borderBottom: "2px solid #dee2e6",
                          }}
                        >
                          Seleccionar
                        </th>
                        <th
                          className="text-center fw-medium letter-color bg-color-icon"
                          style={{
                            backgroundColor: "#f8f9fa",
                            borderBottom: "2px solid #dee2e6",
                          }}
                        >
                          Nombre
                        </th>
                        <th
                          className="text-center fw-medium letter-color bg-color-icon"
                          style={{
                            backgroundColor: "#f8f9fa",
                            borderBottom: "2px solid #dee2e6",
                          }}
                        >
                          Dirección
                        </th>
                        <th
                          className="text-center fw-medium letter-color bg-color-icon"
                          style={{
                            backgroundColor: "#f8f9fa",
                            borderBottom: "2px solid #dee2e6",
                          }}
                        >
                          Teléfono
                        </th>
                        <th
                          className="text-center fw-medium letter-color bg-color-icon"
                          style={{
                            backgroundColor: "#f8f9fa",
                            borderBottom: "2px solid #dee2e6",
                          }}
                        >
                          Email
                        </th>
                        <th
                          className="text-center fw-medium letter-color bg-color-icon"
                          style={{
                            backgroundColor: "#f8f9fa",
                            borderBottom: "2px solid #dee2e6",
                          }}
                        >
                          Estado
                        </th>
                      </tr>
                      </thead>
                      <tbody>
                      {prestadores.map((prestador) => (
                        <tr key={prestador.id_prestador}>
                          <td
                            className="text-center"
                            style={{
                              padding: "12px",
                              borderColor: "#dee2e6",
                            }}
                          >
                            <button
                              className="search-button p-1"
                              onClick={() => handleSelectPrestador(prestador)}
                            >
                              Seleccionar
                            </button>
                          </td>
                          <td
                            className="text-center"
                            style={{
                              padding: "12px",
                              borderColor: "#dee2e6",
                            }}
                          >
                            {prestador.nombre}
                          </td>
                          <td
                            className="text-center"
                            style={{
                              padding: "12px",
                              borderColor: "#dee2e6",
                            }}
                          >
                            {prestador.direccion}
                          </td>
                          <td
                            className="text-center"
                            style={{
                              padding: "12px",
                              borderColor: "#dee2e6",
                            }}
                          >
                            {prestador.telefonos}
                          </td>
                          <td
                            className="text-center"
                            style={{
                              padding: "12px",
                              borderColor: "#dee2e6",
                            }}
                          >
                            {prestador.email}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              borderColor: "#dee2e6",
                            }}
                            className={
                              prestador.estado === "Activo"
                                ? "text-center text-success"
                                : "text-center text-danger"
                            }
                          >
                            {prestador.estado === "Activo"
                              ? "Habilitado"
                              : "Deshabilitado"}
                          </td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Vista de tarjetas para móviles */}
                <div className="d-md-none">
                  {prestadores.map((prestador) => (
                    <div
                      key={prestador.id_prestador}
                      className="card mb-3 shadow-sm"
                    >
                      <div className="card-body">
                        <h5 className="card-title">{prestador.nombre}</h5>
                        <div className="card-text mb-2">
                          <strong>Dirección:</strong> {prestador.direccion}
                        </div>
                        <div className="card-text mb-2">
                          <strong>Teléfono:</strong> {prestador.telefonos}
                        </div>
                        <div className="card-text mb-2">
                          <strong>Email:</strong> {prestador.email}
                        </div>
                        <div className="card-text mb-3">
                          <strong>Estado:</strong>{" "}
                          <span
                            className={
                              prestador.estado === "Activo"
                                ? "text-success"
                                : "text-danger"
                            }
                          >
                            {prestador.estado === "Activo"
                              ? "Habilitado"
                              : "Deshabilitado"}
                          </span>
                        </div>
                        <button
                          className="search-button p-2 w-100"
                          onClick={() => handleSelectPrestador(prestador)}
                        >
                          Seleccionar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Controles de navegación responsivos */}
                <div className="row mt-3">
                  <div className="col-6 col-md-4">
                    <button
                      className="search-button p-2 w-100"
                      onClick={goToSearch}
                    >
                      <i className="bi bi-arrow-left d-inline d-md-none"></i>
                      <span className="d-none d-md-inline">
                        Volver a búsqueda
                      </span>
                      <span className="d-inline d-md-none"> Volver</span>
                    </button>
                  </div>

                  <div className="col-6 col-md-8">
                    <div className="pagination-controls d-flex justify-content-end align-items-center">
                      <button
                        className="search-button p-2"
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={pagination.currentPage === 1}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                      <span className="mx-2 text-nowrap">
                        {pagination.currentPage}/{pagination.totalPages}
                      </span>
                      <button
                        className="search-button p-2"
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={
                          pagination.currentPage === pagination.totalPages
                        }
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center my-5">
                <FiSearch className="text-muted" size={48} />
                <h4>No se encontraron prestadores</h4>
                <p>Realiza una nueva búsqueda</p>
                <button
                  className="btn btn-success mt-3"
                  onClick={goToSearch}
                >
                  Nueva búsqueda
                </button>
              </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsStep;
