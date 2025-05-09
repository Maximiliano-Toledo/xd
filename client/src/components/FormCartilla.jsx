import { useState, useEffect, useRef, useCallback } from "react"
import { LuFileSearch2 } from "react-icons/lu"
import { MdOutlineContactPhone } from "react-icons/md"
import { FaGlobeAmericas, FaRegBuilding, FaMapMarkerAlt, FaEnvelope, FaPhone, FaArrowRight } from "react-icons/fa"
import { useCartillaApi } from "../hooks/useCartillaApi"
import CustomSelect from "./CustomSelect"
import Pagination from "./Pagination"

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
    handlePageSizeChange
  } = useCartillaApi();

  // Estado para controlar la vista actual (formulario o resultados)
  const [isFlipped, setIsFlipped] = useState(false);

  // Función para adaptar las opciones al formato requerido por CustomSelect
  const adaptarOpciones = (opciones, idKey, nombreKey) => {
    return opciones.map((opcion) => ({
      id: opcion[idKey],
      nombre: opcion[nombreKey],
    }));
  };

  // Manejador de envío del formulario modificado
  const handleSubmit = async (e) => {
    await apiHandleSubmit(e);
    // Después de enviar el formulario y obtener resultados, volteamos la tarjeta
    setIsFlipped(true);
  };

  // Manejador para el botón volver
  const handleVolver = () => {
    setIsFlipped(false);
  };

  return (
    <div className="d-flex justify-content-between align-items-start m-5">
      {/* Sidebar con opciones */}
      <aside className="p-1 ms-4 text-center" style={{ width: "25%" }}>
        <section className="shadow-lg mt-3 mb-5">
          <div className="p-2 border">
            <div className="border p-1">
              <MdOutlineContactPhone style={{ fontSize: "4rem", color: "var(--color-green)" }} />
              <p className="text-center">MÉDICO EN LÍNEA</p>
            </div>
          </div>
        </section>

        <section className="shadow-lg mt-3 mb-5">
          <div className="p-2 border">
            <div className="border p-3">
              <FaRegBuilding style={{ fontSize: "4rem", color: "var(--color-green)" }} />
              <p className="text-center">CENTROS MÉDICOS PROPIOS</p>
            </div>
          </div>
        </section>

        <section className="shadow-lg mt-3 mb-5">
          <div className="p-2 border">
            <div className="border p-3">
              <FaGlobeAmericas style={{ fontSize: "4rem", color: "var(--color-green)" }} />
              <p className="text-center">QUIERO AFILIARME</p>
            </div>
          </div>
        </section>
      </aside>

      {/* Contenido principal con efecto flip */}
      <div className="d-flex flex-column justify-content-center w-100 p-4 me-4">
        <div className={`flip-container ${isFlipped ? "flipped" : ""}`}>
          <div className="flipper">
            {/* Cara frontal - Formulario */}
            <div className="front">
              <form className="p-3 rounded-3 bg-white" style={{ width: "100%" }} onSubmit={handleSubmit}>
                <p
                  className="fw-bold text-white w-25 w-sm-100 p-1 fs-5"
                  style={{ backgroundColor: "var(--color-green)" }}
                >
                  <LuFileSearch2 className="fs-3 text-white" /> Buscar
                </p>

                <div className="form-group mb-3">
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

                <div className="form-group mb-3">
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

                <div className="form-group mb-3">
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

                <div className="form-group mb-3">
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

                <div className="form-group mb-5">
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

                <div className="d-flex justify-content-center">
                  <button
                    type="submit"
                    className="border-0 p-2 text-white shadow-lg"
                    style={{
                      backgroundColor: "var(--color-green)",
                      borderRadius: "5px",
                    }}
                    disabled={Object.values(loading).some((status) => status)}
                  >
                    {loading.prestadores ? "Buscando..." : "Buscar"}
                  </button>
                </div>
              </form>
            </div>

            {/* Cara trasera - Resultados */}
            <div className="back">
              <div className="p-3 rounded-3 bg-white" style={{ width: "100%" }}>
                <div className="position-relative">
                  <h4
                    className="text-center mb-4 py-2 px-4 d-inline-block"
                    style={{
                      backgroundColor: "#8BC34A",
                      color: "white",
                      borderRadius: "5px",
                      position: "absolute",
                      top: "-20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    Resultados
                  </h4>
                  <div style={{ borderTop: "1px solid #8BC34A", marginTop: "10px", paddingTop: "20px" }}></div>
                </div>
                {prestadores.length > 0 ? (
                  <div className="mt-4">
                    {prestadores.map((prestador) => (
                      <div key={prestador.id_prestador} className="card mb-3 border shadow-sm">
                        <div className="card-body">
                          <div className="d-flex align-items-start">
                            <div className="me-2" style={{ color: "var(--color-green)" }}>
                              <FaArrowRight size={20} />
                            </div>
                            <div className="flex-grow-1">
                              <h5 className="card-title fw-bold">{prestador.nombre}</h5>

                              {/* Especialidad */}
                              <div className="d-flex align-items-center mb-2">
                                <span>{prestador.especialidad}</span>
                              </div>

                              <div className="d-flex align-items-center mb-2">
                                <FaMapMarkerAlt className="me-2" style={{ color: "var(--color-green)" }} />
                                <span>{prestador.direccion || "-"}</span>
                              </div>

                              {prestador.email && (
                                <div className="d-flex align-items-center mb-2">
                                  <FaEnvelope className="me-2" style={{ color: "var(--color-green)" }} />
                                  <a href={`mailto:${prestador.email}`}>{prestador.email}</a>
                                </div>
                              )}

                              {prestador.telefonos && (
                                <div className="d-flex align-items-center mb-2">
                                  <FaPhone className="me-2" style={{ color: "var(--color-green)" }} />
                                  <span>{prestador.telefonos}</span>
                                </div>
                              )}

                              {prestador.informacion_adicional && (
                                <p className="card-text mt-2 small text-muted">{prestador.informacion_adicional}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Componente de paginación */}
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={pagination.itemsPerPage}
                      onItemsPerPageChange={handlePageSizeChange}
                      totalItems={pagination.totalItems}
                    />
                  </div>
                ) : (
                  <div className="alert alert-info mt-4">
                    No se encontraron prestadores con los criterios de búsqueda seleccionados.
                  </div>
                )}

                {/* Botón Volver */}
                <div className="text-center mt-4">
                  <button
                    className="btn"
                    style={{
                      backgroundColor: "#8BC34A",
                      color: "white",
                      borderRadius: "15px",
                      padding: "5px 20px",
                    }}
                    onClick={handleVolver}
                  >
                    Volver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}