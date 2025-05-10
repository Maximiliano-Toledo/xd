import { useState, useEffect } from "react";
import { useCartillaApi } from "../hooks/useCartillaApi";
import CustomSelect from "./CustomSelect";
import Pagination from "./Pagination"; // Cambiado a importación por defecto

// Iconos - Reemplazamos BsMedical con otros iconos disponibles
import { FiSearch, FiMapPin, FiPhone, FiMail, FiInfo } from "react-icons/fi";
import { BsArrowLeft, BsHospital, BsGlobe } from "react-icons/bs";
// Agregamos estos iconos de Font Awesome como alternativas para BsMedical
import { FaStethoscope, FaHospital, FaMedkit } from "react-icons/fa";
import { MdMedicalServices, MdHealthAndSafety } from "react-icons/md";

export const FormCartilla = () => {
  const {
    formData,
    options,
    loading,
    prestadores,
    showResults,
    pagination,
    handleChange,
    handleSubmit: apiHandleSubmit,
    handlePageChange,
    handlePageSizeChange,
  } = useCartillaApi();

  // Estado para controlar la vista actual
  const [isResultsView, setIsResultsView] = useState(false);

  // Adaptar opciones para CustomSelect
  const adaptarOpciones = (opciones, idKey, nombreKey) => {
    return opciones.map((opcion) => ({
      id: opcion[idKey],
      nombre: opcion[nombreKey],
    }));
  };

  // Manejador de formulario
  const handleSubmit = async (e) => {
    await apiHandleSubmit(e);
    setIsResultsView(true);
  };

  // Volver a la vista de búsqueda
  const handleBackToSearch = () => {
    setIsResultsView(false);
  };

  // Verificar si el formulario está completo
  const isFormComplete = () => {
    return (
      formData.plan &&
      formData.provincia &&
      formData.localidad &&
      formData.categoria &&
      formData.especialidad
    );
  };

  // Calcular el estado de cargando general
  const isLoading = Object.values(loading).some((status) => status);

  return (
    <div className="cartilla-container">
      {/* Sidebar - siempre visible */}
      <aside className="cartilla-sidebar">
        <div className="sidebar-header">
          <h4 className="sidebar-title">Servicios</h4>
        </div>

        <div className="sidebar-links">
          <a href="#" className="sidebar-link">
            <div className="sidebar-icon">
              <MdMedicalServices />
            </div>
            <span>Médico en línea</span>
          </a>

          <a href="#" className="sidebar-link">
            <div className="sidebar-icon">
              <BsHospital />
            </div>
            <span>Centros médicos propios</span>
          </a>

          <a href="#" className="sidebar-link">
            <div className="sidebar-icon">
              <BsGlobe />
            </div>
            <span>Quiero afiliarme</span>
          </a>

          <a href="#" className="sidebar-link">
            <div className="sidebar-icon">
              <MdHealthAndSafety />
            </div>
            <span>Beneficios</span>
          </a>
        </div>
      </aside>

      {/* Contenido principal - cambia según la vista */}
      <main className="cartilla-content">
        {!isResultsView ? (
          /* Vista de búsqueda */
          <div className="search-view">
            <div className="content-header">
              <h2 className="content-title">Buscar prestadores</h2>
              <p className="content-subtitle">
                Consultá profesionales, centros de salud y servicios médicos disponibles en tu zona
              </p>
            </div>

            <form onSubmit={handleSubmit} className="search-form">
              <div className="form-card">
                <div className="card-header">
                  <FiSearch className="card-icon" />
                  <h3 className="card-title">Ingresá tus criterios de búsqueda</h3>
                </div>

                <div className="card-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Plan:</label>
                      <CustomSelect
                        options={adaptarOpciones(options.planes, "id_plan", "nombre")}
                        value={formData.plan}
                        onChange={handleChange}
                        name="plan"
                        placeholder="Seleccioná un plan"
                        disabled={loading.planes}
                        loading={loading.planes}
                      />
                    </div>

                    <div className="form-group">
                      <label>Provincia:</label>
                      <CustomSelect
                        options={adaptarOpciones(options.provincias, "id_provincia", "nombre")}
                        value={formData.provincia}
                        onChange={handleChange}
                        name="provincia"
                        placeholder="Seleccioná una provincia"
                        disabled={!formData.plan || loading.provincias}
                        loading={loading.provincias}
                      />
                    </div>

                    <div className="form-group">
                      <label>Localidad:</label>
                      <CustomSelect
                        options={adaptarOpciones(options.localidades, "id_localidad", "nombre")}
                        value={formData.localidad}
                        onChange={handleChange}
                        name="localidad"
                        placeholder="Seleccioná una localidad"
                        disabled={!formData.provincia || loading.localidades}
                        loading={loading.localidades}
                      />
                    </div>

                    <div className="form-group">
                      <label>Categoría:</label>
                      <CustomSelect
                        options={adaptarOpciones(options.categorias, "id_categoria", "nombre")}
                        value={formData.categoria}
                        onChange={handleChange}
                        name="categoria"
                        placeholder="Seleccioná una categoría"
                        disabled={!formData.localidad || loading.categorias}
                        loading={loading.categorias}
                      />
                    </div>

                    <div className="form-group">
                      <label>Especialidad:</label>
                      <CustomSelect
                        options={adaptarOpciones(options.especialidades, "id_especialidad", "nombre")}
                        value={formData.especialidad}
                        onChange={handleChange}
                        name="especialidad"
                        placeholder="Seleccioná una especialidad"
                        disabled={!formData.categoria || loading.especialidades}
                        loading={loading.especialidades}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn-search"
                      disabled={!isFormComplete() || isLoading}
                    >
                      {loading.prestadores ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Buscando...
                        </>
                      ) : (
                        <>
                          <FiSearch className="btn-icon" /> Buscar prestadores
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* Vista de resultados */
          <div className="results-view">
            <div className="results-header">
              <button className="btn-back" onClick={handleBackToSearch}>
                <BsArrowLeft /> Volver a la búsqueda
              </button>
              <h2 className="results-title">Resultados de la búsqueda</h2>
              <div className="search-summary">
                <span className="search-tag">{options.planes.find(p => p.id_plan.toString() === formData.plan)?.nombre || 'Plan'}</span>
                <span className="search-tag">{options.provincias.find(p => p.id_provincia.toString() === formData.provincia)?.nombre || 'Provincia'}</span>
                <span className="search-tag">{options.especialidades.find(e => e.id_especialidad.toString() === formData.especialidad)?.nombre || 'Especialidad'}</span>
              </div>
            </div>

            <div className="results-container">
              {loading.prestadores ? (
                <div className="loading-container">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p>Cargando prestadores...</p>
                </div>
              ) : prestadores.length > 0 ? (
                <>
                  <div className="results-count">
                    <strong>{pagination.totalItems}</strong> prestadores encontrados
                  </div>

                  <div className="results-list">
                    {prestadores.map((prestador) => (
                      <div key={prestador.id_prestador} className="prestador-card">
                        <div className="prestador-type">
                          {/* Reemplazamos BsMedical con FaStethoscope */}
                          <FaStethoscope />
                        </div>
                        <div className="prestador-content">
                          <h3 className="prestador-name">{prestador.nombre}</h3>

                          <div className="prestador-details">
                            {prestador.direccion && (
                              <div className="prestador-detail">
                                <FiMapPin className="detail-icon" />
                                <span>{prestador.direccion}</span>
                              </div>
                            )}

                            {prestador.telefonos && (
                              <div className="prestador-detail">
                                <FiPhone className="detail-icon" />
                                <span>{prestador.telefonos}</span>
                              </div>
                            )}

                            {prestador.email && (
                              <div className="prestador-detail">
                                <FiMail className="detail-icon" />
                                <a href={`mailto:${prestador.email}`}>{prestador.email}</a>
                              </div>
                            )}
                          </div>

                          {prestador.informacion_adicional && (
                            <div className="prestador-info">
                              <FiInfo className="info-icon" />
                              <p>{prestador.informacion_adicional}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pagination-wrapper">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={pagination.itemsPerPage}
                      onItemsPerPageChange={(newSize) => {
                        console.log("Nuevo tamaño de página seleccionado:", newSize);
                        handlePageSizeChange(newSize);
                      }}
                      totalItems={pagination.totalItems}
                    />
                  </div>
                </>
              ) : (
                <div className="no-results">
                  <div className="no-results-icon">
                    <FiSearch />
                  </div>
                  <h3>No se encontraron prestadores</h3>
                  <p>No hay prestadores que coincidan con los criterios de búsqueda seleccionados.</p>
                  <button className="btn-retry" onClick={handleBackToSearch}>
                    Modificar la búsqueda
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};