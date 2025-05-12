"use client"

import { useState, useEffect } from "react"
import { useCartillaApi } from "../hooks/useCartillaApi"
import CustomSelect from "./CustomSelect"
import Pagination from "./Pagination"

// Iconos
import { FiSearch, FiMapPin, FiPhone, FiMail, FiInfo } from "react-icons/fi"
import { BsArrowLeft, BsHospital, BsGlobe } from "react-icons/bs"
import { FaStethoscope } from "react-icons/fa"
import { MdMedicalServices, MdHealthAndSafety } from "react-icons/md"

// Iconos para categorías
import { BsBuilding } from "react-icons/bs" // Instituciones
import { FaUserMd } from "react-icons/fa" // Profesionales
import { RiMedicineBottleLine } from "react-icons/ri" // Farmacias
import { IoGlassesOutline } from "react-icons/io5" // Ópticas

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
    handleSearchMethodChange,
  } = useCartillaApi()

  // Estado para controlar la vista actual
  const [isResultsView, setIsResultsView] = useState(false)
  // Estado para controlar la categoría seleccionada
  const [selectedCategory, setSelectedCategory] = useState(null)
  // Estado para categorías disponibles
  const [availableCategories, setAvailableCategories] = useState([])
  // Estado para verificar si se han seleccionado los criterios previos
  const [criteriosSeleccionados, setCriteriosSeleccionados] = useState(false)

  // Función para adaptar las opciones al formato requerido por CustomSelect
  const adaptarOpciones = (opciones, idKey, nombreKey) => {
    // Caso especial para prestadores: guardamos el nombre como valor en lugar del ID
    if (idKey === "id_prestador") {
      return opciones.map((opcion) => ({
        id: opcion[nombreKey], // Usamos el nombre como ID/valor
        nombre: opcion[nombreKey],
        originalId: opcion[idKey], // Guardamos el ID original por si lo necesitamos
      }))
    }

    // Caso normal para el resto de opciones
    return opciones.map((opcion) => ({
      id: opcion[idKey],
      nombre: opcion[nombreKey],
    }))
  }

  // Definición de las categorías con sus IDs reales
  const categories = [
    {
      id: "1",
      name: "Instituciones",
      icon: <BsBuilding size={30} />,
      value: "1",
    },
    {
      id: "2",
      name: "Profesionales",
      icon: <FaUserMd size={30} />,
      value: "2",
    },
    {
      id: "3",
      name: "Farmacias",
      icon: <RiMedicineBottleLine size={30} />,
      value: "3",
    },
    {
      id: "4",
      name: "Ópticas",
      icon: <IoGlassesOutline size={30} />,
      value: "4",
    },
  ]

  // Efecto para verificar si se han seleccionado todos los criterios previos
  useEffect(() => {
    setCriteriosSeleccionados(
      formData.plan &&
        formData.provincia &&
        formData.localidad &&
        !loading.planes &&
        !loading.provincias &&
        !loading.localidades,
    )
  }, [formData.plan, formData.provincia, formData.localidad, loading.planes, loading.provincias, loading.localidades])

  // Efecto para actualizar el estado visual de categoría seleccionada cuando cambia formData.categoria
  useEffect(() => {
    if (!formData.categoria) {
      setSelectedCategory(null)
    } else {
      const category = categories.find((cat) => cat.value === formData.categoria)
      setSelectedCategory(category ? category.id : null)
    }
  }, [formData.categoria])

  // Efecto para determinar categorías disponibles basadas en plan, provincia y localidad
  useEffect(() => {
    if (!formData.plan || !formData.provincia || !formData.localidad) {
      // Si no se han seleccionado los criterios básicos, todas las categorías están disponibles pero deshabilitadas
      setAvailableCategories([])
      return
    }

    // Suponemos que las categorías disponibles vienen del backend en options.categorias
    if (options.categorias && options.categorias.length > 0) {
      // Extraer los IDs de las categorías disponibles
      const availableCategoryIds = options.categorias.map((cat) => cat.id_categoria.toString())
      setAvailableCategories(availableCategoryIds)
    } else {
      setAvailableCategories([])
    }
  }, [formData.plan, formData.provincia, formData.localidad, options.categorias])

  // Efecto para actualizar la vista de resultados cuando cambia showResults
  useEffect(() => {
    if (showResults && prestadores.length > 0) {
      setIsResultsView(true)
    }
  }, [showResults, prestadores])

  // Manejar clic en categoría
  const handleCategoryClick = (category) => {
    // No hacer nada si no se han seleccionado los criterios previos
    if (!criteriosSeleccionados) {
      return
    }

    // Verificar si la categoría está disponible
    if (!isCategoryAvailable(category.value)) {
      return // No hacer nada si la categoría no está disponible
    }

    // Si la categoría ya está seleccionada, deseleccionarla
    const newSelectedCategory = category.id === selectedCategory ? null : category.id
    setSelectedCategory(newSelectedCategory)

    // Actualizar formData con la categoría seleccionada o null si se deseleccionó
    const event = {
      target: {
        name: "categoria",
        value: newSelectedCategory ? category.value : "",
      },
    }
    handleChange(event)
  }

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault()

    const requiredFields = ["plan", "provincia", "localidad", "categoria", "especialidad"]

    // Para búsqueda por nombre, también se requiere nombrePrestador
    if (formData.searchMethod === "porNombre") {
      requiredFields.push("nombrePrestador")
    }

    if (requiredFields.some((field) => !formData[field])) {
      alert("Complete todos los campos obligatorios")
      return
    }

    apiHandleSubmit(e)
    // No establecemos isResultsView aquí, lo haremos en el efecto cuando showResults sea true
  }

  // Volver a la vista de búsqueda
  const handleBackToSearch = () => {
    setIsResultsView(false)
  }

  // Verificar si una categoría está disponible
  const isCategoryAvailable = (categoryValue) => {
    if (!criteriosSeleccionados) {
      return false // Deshabilitada si no se han seleccionado los criterios básicos
    }
    return availableCategories.includes(categoryValue)
  }

  // Extendido manejador de cambio para monitorear cuando cambian provincia o localidad
  const handleFormChange = (e) => {
    const { name, value } = e.target

    // Si cambia provincia o localidad, asegurarse de resetear la selección visual de categoría
    if (name === "provincia" || name === "localidad") {
      setSelectedCategory(null)
    }

    // Pasar el evento al manejador original
    handleChange(e)
  }

  // Manejador para cambiar el método de búsqueda
  const handleMethodChange = (method) => {
    handleSearchMethodChange(method)
    setIsResultsView(false)
    setSelectedCategory(null)
    
    // Resetear los campos específicos del formulario
    handleChange({
      target: {
        name: "plan",
        value: ""
      }
    })
    handleChange({
      target: {
        name: "categoria",
        value: ""
      }
    })
    handleChange({
      target: {
        name: "especialidad",
        value: ""
      }
    })
    handleChange({
      target: {
        name: "nombrePrestador",
        value: ""
      }
    })
  }

  // Función para depurar
  const logDebugInfo = () => {
    console.log("Estado actual:", {
      isResultsView,
      showResults,
      prestadoresLength: prestadores.length,
      loading: loading.prestadores,
    })
  }

  return (
    <div className="cartilla-container">
      {/* Botón de depuración - Quitar en producción */}
      <button onClick={logDebugInfo} style={{ position: "absolute", top: 0, right: 0, zIndex: 1000 }}>
        Debug
      </button>

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
          /* Vista de búsqueda mejorada */
          <div className="search-view">
            <div className="content-header">
              <h2 className="content-title">Buscar prestadores</h2>
              <p className="content-subtitle">
                Consultá profesionales, centros de salud y servicios médicos disponibles en tu zona
              </p>
            </div>

            <div className="search-form-container">
              <div className="search-form-card">
                <div className="search-form-header">
                  <h2>Encontrá profesionales de la salud</h2>
                  <p>Seleccioná los criterios para buscar prestadores en tu zona</p>
                </div>

                {/* Botones para cambiar el método de búsqueda */}
                <div className="search-method-tabs">
                  <button
                    className={`search-method-tab ${formData.searchMethod === "normal" ? "active" : ""}`}
                    onClick={() => handleMethodChange("normal")}
                  >
                    <FiSearch /> Búsqueda
                  </button>
                  <button
                    className={`search-method-tab ${formData.searchMethod === "porNombre" ? "active" : ""}`}
                    onClick={() => handleMethodChange("porNombre")}
                  >
                    <FiSearch /> Búsqueda por nombre
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="search-form-selects">
                    <div className="search-select-group">
                      <CustomSelect
                        options={adaptarOpciones(options.planes, "id_plan", "nombre")}
                        value={formData.plan}
                        onChange={handleFormChange}
                        name="plan"
                        placeholder="Seleccioná tu plan"
                        disabled={loading.planes}
                        loading={loading.planes}
                        className="search-select"
                      />
                    </div>

                    <div className="search-select-row">
                      <div className="search-select-group">
                        <CustomSelect
                          options={adaptarOpciones(options.provincias, "id_provincia", "nombre")}
                          value={formData.provincia}
                          onChange={handleFormChange}
                          name="provincia"
                          placeholder="Seleccioná la provincia"
                          disabled={!formData.plan || loading.provincias}
                          loading={loading.provincias}
                          className="search-select"
                        />
                      </div>

                      <div className="search-select-group">
                        <CustomSelect
                          options={adaptarOpciones(options.localidades, "id_localidad", "nombre")}
                          value={formData.localidad}
                          onChange={handleFormChange}
                          name="localidad"
                          placeholder="Seleccioná la localidad"
                          disabled={!formData.provincia || loading.localidades}
                          loading={loading.localidades}
                          className="search-select"
                        />
                      </div>
                    </div>

                    {/* Sección de categorías - Común para ambos métodos de búsqueda */}
                    <div className="search-categories">
                      <div className="search-categories-label">Seleccioná una categoría</div>
                      <div className="search-categories-grid">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className={`search-category-item 
                              ${selectedCategory === category.id ? "active" : ""} 
                              ${!criteriosSeleccionados ? "disabled" : !isCategoryAvailable(category.value) ? "disabled unavailable" : ""}`}
                            onClick={() => handleCategoryClick(category)}
                          >
                            <div className="search-category-icon">{category.icon}</div>
                            <div className="search-category-name">{category.name}</div>
                            {/* Solo mostrar el cartel de No disponible cuando los criterios están seleccionados y la categoría no está disponible */}
                            {criteriosSeleccionados && !isCategoryAvailable(category.value) && (
                              <div className="category-unavailable-overlay">No disponible</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Campos específicos según el método de búsqueda */}
                    {formData.searchMethod === "normal" ? (
                      <div className="search-select-group speciality-select">
                        <CustomSelect
                          options={adaptarOpciones(options.especialidades, "id_especialidad", "nombre")}
                          value={formData.especialidad}
                          onChange={handleFormChange}
                          name="especialidad"
                          placeholder="Seleccioná la especialidad"
                          disabled={!formData.categoria || loading.especialidades}
                          loading={loading.especialidades}
                          className="search-select"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="search-select-group">
                          <CustomSelect
                            options={adaptarOpciones(options.nombresPrestadores, "id_prestador", "nombre")}
                            value={formData.nombrePrestador}
                            onChange={handleFormChange}
                            name="nombrePrestador"
                            placeholder="Seleccioná el prestador"
                            disabled={!formData.categoria || loading.nombresPrestadores}
                            loading={loading.nombresPrestadores}
                            className="search-select"
                          />
                        </div>

                        <div className="search-select-group">
                          <CustomSelect
                            options={adaptarOpciones(options.especialidadesPrestador, "id_especialidad", "nombre")}
                            value={formData.especialidad}
                            onChange={handleFormChange}
                            name="especialidad"
                            placeholder="Seleccioná la especialidad"
                            disabled={!formData.nombrePrestador || loading.especialidadesPrestador}
                            loading={loading.especialidadesPrestador}
                            className="search-select"
                          />
                        </div>
                      </>
                    )}

                    <div className="search-button-container">
                      <button
                        type="submit"
                        className="search-button"
                        disabled={
                          formData.searchMethod === "normal"
                            ? !formData.plan ||
                              !formData.provincia ||
                              !formData.localidad ||
                              !formData.categoria ||
                              !formData.especialidad ||
                              Object.values(loading).some(Boolean)
                            : !formData.plan ||
                              !formData.provincia ||
                              !formData.localidad ||
                              !formData.categoria ||
                              !formData.nombrePrestador ||
                              !formData.especialidad ||
                              Object.values(loading).some(Boolean)
                        }
                      >
                        {Object.values(loading).some(Boolean) ? (
                          <>Cargando...</>
                        ) : (
                          <>
                            <FiSearch className="search-button-icon" /> Buscar prestadores
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
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
                <span className="search-tag">
                  {options.planes.length > 0 && formData.plan
                    ? (
                        options.planes.find((p) => p.id_plan == formData.plan) ||
                        options.planes.find((p) => String(p.id_plan) === String(formData.plan))
                      )?.nombre || "Plan"
                    : "Plan"}
                </span>

                <span className="search-tag">
                  {options.provincias.length > 0 && formData.provincia
                    ? (
                        options.provincias.find((p) => p.id_provincia == formData.provincia) ||
                        options.provincias.find((p) => String(p.id_provincia) === String(formData.provincia))
                      )?.nombre || "Provincia"
                    : "Provincia"}
                </span>

                <span className="search-tag">
                  {options.especialidades.length > 0 && formData.especialidad
                    ? (
                        options.especialidades.find((e) => e.id_especialidad == formData.especialidad) ||
                        options.especialidades.find((e) => String(e.id_especialidad) === String(formData.especialidades))
                      )?.nombre || "Especialidad"
                    : (
                      options.especialidadesPrestador.length > 0 && formData.especialidad
                        ? (
                            options.especialidadesPrestador.find((e) => e.id_especialidad == formData.especialidad) ||
                            options.especialidadesPrestador.find((e) => String(e.id_especialidad) === String(formData.especialidades))
                          )?.nombre || "Especialidad"
                        : "Especialidad"
                      )
                  }
                </span>
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
                      <div key={prestador.id_prestador || `prestador-${Math.random()}`} className="prestador-card">
                        <div className="prestador-type">
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
                      onItemsPerPageChange={handlePageSizeChange}
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
  )
}