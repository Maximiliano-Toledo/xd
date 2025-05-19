"use client";

import { useState, useEffect } from "react";
import { Footer } from "../../layouts/Footer";
import HeaderStaff from "../../layouts/HeaderStaff";
import { MdSubdirectoryArrowLeft } from "react-icons/md";
import "../../styles/cargar-cartilla.css";
import "../../styles/dashboard.css";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import CustomSelect from "../CustomSelect";
import { useAbmApi } from "../../hooks/useAbmApi";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import LiveAlert from "../utils/LiveAlert";
import { useCartillaApi } from "../../hooks/useCartillaApi";
import { FiSearch } from "react-icons/fi";
import SearchMethodTabs from "../cartilla/SearchMethodTabs";

const EditarPrestador = () => {
  const edit = true;
  const navigate = useNavigate();
  const handleVolver = () => navigate(-1);

  // Estados para el wizard
  const [currentStep, setCurrentStep] = useState(1); // 1: Búsqueda, 2: Resultados, 3: Edición
  const [selectedPrestador, setSelectedPrestador] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [mostrarOpcionesEstado, setMostrarOpcionesEstado] = useState(false);

  // Hook para la búsqueda de prestadores
  const {
    formData,
    options,
    loading,
    prestadores,
    showResults,
    pagination,
    handleChange,
    handleSubmit: handleSearchSubmit,
    handlePageChange,
    handlePageSizeChange,
    handleSearchMethodChange,
  } = useCartillaApi(edit);

  // Hook para actualizar prestador
  const { updatePrestador } = useAbmApi("prestadores");

  // Formulario de edición
  const [editForm, setEditForm] = useState({
    direccion: "",
    telefonos: "",
    email: "",
    informacion_adicional: "",
    estado: "",
  });

  // Adaptador de opciones para CustomSelect
  const adaptarOpciones = (opciones, idKey, nombreKey) => {
    if (idKey === "id_prestador") {
      return opciones.map((opcion) => ({
        id: opcion[nombreKey],
        nombre: opcion[nombreKey],
        originalId: opcion[idKey],
      }));
    }
    return opciones.map((opcion) => ({
      id: opcion[idKey],
      nombre: opcion[nombreKey],
    }));
  };

  // UseEffect para detectar cuando los prestadores han sido cargados
  useEffect(() => {
    // Cuando hay resultados disponibles y hay prestadores, y no está cargando
    if (showResults && prestadores.length > 0 && !loading.prestadores) {
      setCurrentStep(2); // Cambiar automáticamente al paso de resultados
    }
  }, [showResults, prestadores, loading.prestadores]);

  // Manejar búsqueda
  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSearchSubmit(e);
    // Ya no necesitamos cambiar el paso aquí, el useEffect se encargará de ello
  };

  // Limpiar campo estado si se oculta con el botón "Ocultar opciones"
  const handleOcultarOpciones = () => {
    if (mostrarOpcionesEstado) {
      setEditForm({ ...editForm, estado: selectedPrestador.estado });
    }
    setMostrarOpcionesEstado(!mostrarOpcionesEstado);
  };

  // Seleccionar prestador para editar
  const handleSelectPrestador = (prestador) => {
    setSelectedPrestador(prestador);
    setOriginalData({
      direccion: prestador.direccion || "",
      telefonos: prestador.telefonos || "",
      email: prestador.email || "",
      informacion_adicional: prestador.informacion_adicional || "",
      estado: prestador.estado,
    });

    setEditForm({
      direccion: prestador.direccion || "",
      telefonos: prestador.telefonos || "",
      email: prestador.email || "",
      informacion_adicional: prestador.informacion_adicional || "",
      estado: prestador.estado,
    });

    setCurrentStep(3); // Ir a edición
  };

  // Manejador para cambiar el método de búsqueda
  const handleMethodChange = (method) => {
    handleSearchMethodChange(method);

    // Resetear los campos específicos del formulario
    handleChange({
      target: {
        name: "plan",
        value: "",
      },
    });
    handleChange({
      target: {
        name: "categoria",
        value: "",
      },
    });
    handleChange({
      target: {
        name: "especialidad",
        value: "",
      },
    });
    handleChange({
      target: {
        name: "nombrePrestador",
        value: "",
      },
    });
  };

  // Manejar cambios en el formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const hasChanges = () => {
    return Object.keys(getChangedFields()).length > 0;
  };

  // Determinar qué campos han cambiado
  const getChangedFields = () => {
    const changes = {};
    Object.keys(editForm).forEach((key) => {
      if (editForm[key] !== originalData[key]) {
        changes[key] = editForm[key];
      }
    });
    return changes;
  };

  // Confirmar edición
  const confirmarEdicion = async () => {
    if (!selectedPrestador) return;

    const changedFields = getChangedFields();
    if (Object.keys(changedFields).length === 0) {
      Swal.fire({
        title: "Sin cambios",
        text: "No se detectaron cambios para guardar",
        icon: "info",
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: "¿Confirmás la edición?",
        text: `Vas a editar el prestador: ${selectedPrestador.nombre}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        await updatePrestador(selectedPrestador.id_prestador, changedFields);

        Swal.fire({
          title: "¡Editado!",
          text: "El prestador ha sido actualizado correctamente",
          icon: "success",
        });

        // Volver a la búsqueda
        setCurrentStep(1);
        setSelectedPrestador(null);
        setOriginalData(null);
      }
    } catch (error) {
      console.error("Error al actualizar prestador:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el prestador",
        icon: "error",
      });
    }
  };

  // Paso 1: Formulario de búsqueda
  const renderSearchStep = () => (
    <div>
      <h1 className="w-50 fs-5 text-center pt-2 pb-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0">
        Edición individual
      </h1>

      <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
        <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5">
          <h6 className="fs-2 h1-titulo fw-bold">
            Buscá el prestador que deseas editar
          </h6>
        </div>
      </div>

      <div className="d-flex justify-content-center align-items-start min-vh-100">
        <div className="w-100 d-flex flex-column border shadow-input p-5 rounded-3 shadow mt-5 mb-3">
          <form onSubmit={handleSubmit}>
            <SearchMethodTabs
                searchMethod={formData.searchMethod}
                onSearchMethodChange={handleMethodChange}
            />

            <div className="mb-4">
              <label
                htmlFor="plan"
                className="d-flex justify-content-center p-1 text-success-label fw-medium fs-6"
              >
                Plan
              </label>
              <div className="d-flex justify-content-center">
                <div className="w-50">
                  <CustomSelect
                    options={adaptarOpciones(
                      options.planes,
                      "id_plan",
                      "nombre"
                    )}
                    value={formData.plan}
                    onChange={handleChange}
                    name="plan"
                    placeholder={
                      loading.planes
                        ? "Cargando planes..."
                        : "Seleccione un plan"
                    }
                    disabled={loading.planes}
                    loading={loading.planes}
                  />
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <label
                  htmlFor="provincia"
                  className="p-1 text-success-label fw-medium fs-6"
                >
                  Provincia:
                </label>
                <CustomSelect
                  options={adaptarOpciones(
                    options.provincias,
                    "id_provincia",
                    "nombre"
                  )}
                  value={formData.provincia}
                  onChange={handleChange}
                  name="provincia"
                  placeholder={
                    loading.provincias
                      ? "Cargando provincias..."
                      : "Seleccione una provincia"
                  }
                  disabled={loading.provincias || !formData.plan}
                  loading={loading.provincias}
                />
              </div>
              <div className="col-md-6">
                <label
                  htmlFor="localidad"
                  className="p-1 text-success-label fw-medium fs-6"
                >
                  Localidad:
                </label>
                <CustomSelect
                  options={adaptarOpciones(
                    options.localidades,
                    "id_localidad",
                    "nombre"
                  )}
                  value={formData.localidad}
                  onChange={handleChange}
                  name="localidad"
                  placeholder={
                    loading.localidades
                      ? "Cargando localidades..."
                      : "Seleccione una localidad"
                  }
                  disabled={loading.localidades || !formData.provincia}
                  loading={loading.localidades}
                />
              </div>
            </div>

            {formData.searchMethod === "normal" ? (
              <div className="row mb-4">
                <div className="col-md-6">
                  <label
                    htmlFor="categoria"
                    className="p-1 text-success-label fw-medium fs-6"
                  >
                    Categoría:
                  </label>
                  <CustomSelect
                    options={adaptarOpciones(
                      options.categorias,
                      "id_categoria",
                      "nombre"
                    )}
                    value={formData.categoria}
                    onChange={handleChange}
                    name="categoria"
                    placeholder={
                      loading.categorias
                        ? "Cargando categorías..."
                        : "Seleccione una categoría"
                    }
                    disabled={loading.categorias || !formData.localidad}
                    loading={loading.categorias}
                  />
                </div>
                <div className="col-md-6">
                  <label
                    htmlFor="especialidad"
                    className="p-1 text-success-label fw-medium fs-6"
                  >
                    Especialidad:
                  </label>
                  <CustomSelect
                    options={adaptarOpciones(
                      options.especialidades,
                      "id_especialidad",
                      "nombre"
                    )}
                    value={formData.especialidad}
                    onChange={handleChange}
                    name="especialidad"
                    placeholder={
                      loading.especialidades
                        ? "Cargando especialidades..."
                        : "Seleccione una especialidad"
                    }
                    disabled={loading.especialidades || !formData.categoria}
                    loading={loading.especialidades}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label
                      htmlFor="categoria"
                      className="p-1 text-success-label fw-medium fs-6"
                    >
                      Categoría:
                    </label>
                    <CustomSelect
                      options={adaptarOpciones(
                        options.categorias,
                        "id_categoria",
                        "nombre"
                      )}
                      value={formData.categoria}
                      onChange={handleChange}
                      name="categoria"
                      placeholder={
                        loading.categorias
                          ? "Cargando categorías..."
                          : "Seleccione una categoría"
                      }
                      disabled={loading.categorias || !formData.localidad}
                      loading={loading.categorias}
                    />
                  </div>
                  <div className="col-md-6">
                    <label
                      htmlFor="nombrePrestador"
                      className="p-1 text-success-label fw-medium fs-6"
                    >
                      Nombre del prestador:
                    </label>
                    <CustomSelect
                      options={adaptarOpciones(
                        options.nombresPrestadores,
                        "id_prestador",
                        "nombre"
                      )}
                      value={formData.nombrePrestador}
                      onChange={handleChange}
                      name="nombrePrestador"
                      placeholder={
                        loading.nombresPrestadores
                          ? "Cargando prestadores..."
                          : "Seleccione un prestador"
                      }
                      disabled={
                        loading.nombresPrestadores || !formData.categoria
                      }
                      loading={loading.nombresPrestadores}
                    />
                  </div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-6 mx-auto">
                    <label
                      htmlFor="especialidad"
                      className="p-1 text-success-label fw-medium fs-6"
                    >
                      Especialidad:
                    </label>
                    <CustomSelect
                      options={adaptarOpciones(
                        options.especialidadesPrestador,
                        "id_especialidad",
                        "nombre"
                      )}
                      value={formData.especialidad}
                      onChange={handleChange}
                      name="especialidad"
                      placeholder={
                        loading.especialidadesPrestador
                          ? "Cargando especialidades..."
                          : "Seleccione una especialidad"
                      }
                      disabled={
                        loading.especialidadesPrestador ||
                        !formData.nombrePrestador
                      }
                      loading={loading.especialidadesPrestador}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="d-flex justify-content-center">
              <button
                className="btn btn-volver rounded-pill text-white text-center text-uppercase mt-2 p-1"
                type="submit"
                disabled={
                  !formData.plan ||
                  !formData.provincia ||
                  !formData.localidad ||
                  !formData.categoria ||
                  (formData.searchMethod === "normal"
                    ? !formData.especialidad
                    : !formData.nombrePrestador) ||
                  loading.prestadores
                }
              >
                {loading.prestadores ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Buscando...
                  </>
                ) : (
                  <>
                    <FiSearch className="text-white pe-1" />
                    Buscar prestadores
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Paso 2: Resultados de búsqueda
  const renderResultsStep = () => (
    <div className="d-flex justify-content-center align-items-start min-vh-100">
      <div className="w-100 d-flex flex-column border shadow-input p-5 rounded-3 shadow mt-5 mb-3">
        <h4 className="mb-4">Resultados de búsqueda</h4>

        {/* Resumen de búsqueda */}
        <div className="mb-4 p-3 bg-light rounded-3">
          <div className="d-flex flex-wrap gap-2">
            <span className="search-tag">
              Plan:{" "}
              {options.planes.length > 0 && formData.plan
                ? (
                    options.planes.find((p) => p.id_plan == formData.plan) ||
                    options.planes.find(
                      (p) => String(p.id_plan) === String(formData.plan)
                    )
                  )?.nombre || "No especificado"
                : "No especificado"}
            </span>

            <span className="search-tag">
              Provincia:{" "}
              {options.provincias.length > 0 && formData.provincia
                ? (
                    options.provincias.find(
                      (p) => p.id_provincia == formData.provincia
                    ) ||
                    options.provincias.find(
                      (p) =>
                        String(p.id_provincia) === String(formData.provincia)
                    )
                  )?.nombre || "No especificado"
                : "No especificado"}
            </span>

            <span className="search-tag">
              Localidad:{" "}
              {options.localidades.length > 0 && formData.localidad
                ? (
                    options.localidades.find(
                      (l) => l.id_localidad == formData.localidad
                    ) ||
                    options.localidades.find(
                      (l) =>
                        String(l.id_localidad) === String(formData.localidad)
                    )
                  )?.nombre || "No especificado"
                : "No especificado"}
            </span>

            <span className="search-tag">
              Categoria:{" "}
              {options.categorias.length > 0 && formData.categoria
                ? (
                    options.categorias.find(
                      (l) => l.id_categoria == formData.categoria
                    ) ||
                    options.categorias.find(
                      (l) =>
                        String(l.id_categoria) === String(formData.categoria)
                    )
                  )?.nombre || "No especificado"
                : "No especificado"}
            </span>

            <span className="search-tag">
              Especialidad:{" "}
              {options.especialidades.length > 0 && formData.especialidad
                ? (
                    options.especialidades.find(
                      (e) => e.id_especialidad == formData.especialidad
                    ) ||
                    options.especialidades.find(
                      (e) =>
                        String(e.id_especialidad) ===
                        String(formData.especialidad)
                    )
                  )?.nombre || "Especialidad"
                : options.especialidadesPrestador.length > 0 &&
                  formData.especialidad
                ? (
                    options.especialidadesPrestador.find(
                      (e) => e.id_especialidad == formData.especialidad
                    ) ||
                    options.especialidadesPrestador.find(
                      (e) =>
                        String(e.id_especialidad) ===
                        String(formData.especialidad)
                    )
                  )?.nombre || "Especialidad"
                : "Especialidad"}
            </span>
          </div>
        </div>

        {loading.prestadores ? (
          <div className="text-center my-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando prestadores...</p>
          </div>
        ) : prestadores.length > 0 ? (
          <>
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
                        style={{ padding: "12px", borderColor: "#dee2e6" }}
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
                        style={{ padding: "12px", borderColor: "#dee2e6" }}
                      >
                        {prestador.nombre}
                      </td>
                      <td
                        className="text-center"
                        style={{ padding: "12px", borderColor: "#dee2e6" }}
                      >
                        {prestador.direccion}
                      </td>
                      <td
                        className="text-center"
                        style={{ padding: "12px", borderColor: "#dee2e6" }}
                      >
                        {prestador.telefonos}
                      </td>
                      <td
                        className="text-center"
                        style={{ padding: "12px", borderColor: "#dee2e6" }}
                      >
                        {prestador.email}
                      </td>
                      <td
                        style={{ padding: "12px", borderColor: "#dee2e6" }}
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

            <div className="d-flex justify-content-between mt-3">
              <button
                className="search-button p-2"
                onClick={() => setCurrentStep(1)}
              >
                Volver a búsqueda
              </button>

              <div className="pagination-controls">
                <button
                  className="search-button p-2"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Anterior
                </button>
                <span className="mx-2">
                  Página {pagination.currentPage} de {pagination.totalPages}
                </span>
                <button
                  className="search-button p-2"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Siguiente
                </button>
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
              onClick={() => setCurrentStep(1)}
            >
              Nueva búsqueda
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Paso 3: Formulario de edición
  const renderEditStep = () => (
    <div className="d-flex justify-content-center align-items-start min-vh-100">
      <div className="w-100 d-flex flex-column border shadow-input p-5 rounded-3 shadow mt-5 mb-3">
        {/* Resumen de búsqueda */}
        <section className="mb-4 p-3 bg-light rounded-3">
          <div className="d-flex flex-wrap gap-2">
            <span className="search-tag">
              Plan:{" "}
              {options.planes.length > 0 && formData.plan
                ? (
                    options.planes.find((p) => p.id_plan == formData.plan) ||
                    options.planes.find(
                      (p) => String(p.id_plan) === String(formData.plan)
                    )
                  )?.nombre || "No especificado"
                : "No especificado"}
            </span>

            <span className="search-tag">
              Provincia:{" "}
              {options.provincias.length > 0 && formData.provincia
                ? (
                    options.provincias.find(
                      (p) => p.id_provincia == formData.provincia
                    ) ||
                    options.provincias.find(
                      (p) =>
                        String(p.id_provincia) === String(formData.provincia)
                    )
                  )?.nombre || "No especificado"
                : "No especificado"}
            </span>

            <span className="search-tag">
              Localidad:{" "}
              {options.localidades.length > 0 && formData.localidad
                ? (
                    options.localidades.find(
                      (l) => l.id_localidad == formData.localidad
                    ) ||
                    options.localidades.find(
                      (l) =>
                        String(l.id_localidad) === String(formData.localidad)
                    )
                  )?.nombre || "No especificado"
                : "No especificado"}
            </span>

            <span className="search-tag">
              Categoria:{" "}
              {options.categorias.length > 0 && formData.categoria
                ? (
                    options.categorias.find(
                      (l) => l.id_categoria == formData.categoria
                    ) ||
                    options.categorias.find(
                      (l) =>
                        String(l.id_categoria) === String(formData.categoria)
                    )
                  )?.nombre || "No especificado"
                : "No especificado"}
            </span>

            <span className="search-tag">
              Especialidad:{" "}
              {options.especialidades.length > 0 && formData.especialidad
                ? (
                    options.especialidades.find(
                      (e) => e.id_especialidad == formData.especialidad
                    ) ||
                    options.especialidades.find(
                      (e) =>
                        String(e.id_especialidad) ===
                        String(formData.especialidad)
                    )
                  )?.nombre || "Especialidad"
                : options.especialidadesPrestador.length > 0 &&
                  formData.especialidad
                ? (
                    options.especialidadesPrestador.find(
                      (e) => e.id_especialidad == formData.especialidad
                    ) ||
                    options.especialidadesPrestador.find(
                      (e) =>
                        String(e.id_especialidad) ===
                        String(formData.especialidad)
                    )
                  )?.nombre || "Especialidad"
                : "Especialidad"}
            </span>

            <span className="search-tag">
              Estado: {selectedPrestador.estado}
            </span>
          </div>
        </section>

        <h4 className="mb-4">
          Editando prestador: {selectedPrestador?.nombre}
        </h4>

        <section className="d-flex flex-column flex-md-row justify-content-between w-100 gap-4 mb-0">
          <div className="w-100 w-md-50 m-5">
            <div className="form-group mb-5">
              <label
                htmlFor="direccion"
                className="text-success-label fw-bold fs-6"
              >
                Dirección:
              </label>
              <input
                type="text"
                className="form-control p-2"
                id="direccion"
                name="direccion"
                value={editForm.direccion}
                onChange={handleEditChange}
                placeholder="Ingrese una dirección"
              />
            </div>

            <div className="form-group position-relative">
              <label
                htmlFor="email"
                className="text-success-label fw-bold fs-6"
              >
                E-mail:
              </label>
              <input
                className="form-control p-2"
                id="email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                placeholder="ejemplo@correo.com"
              />
            </div>
          </div>

          <div className="w-100 w-md-50 m-5">
            <div className="form-group mb-5 position-relative">
              <label
                htmlFor="telefono"
                className="text-success-label fw-bold fs-6"
              >
                Teléfono:
              </label>
              <input
                type="text"
                className="form-control p-2"
                id="telefono"
                name="telefonos"
                value={editForm.telefonos}
                onChange={handleEditChange}
                placeholder="Ingrese el número de teléfono"
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="informacion"
                className="text-success-label fw-bold fs-6"
              >
                Información adicional:
              </label>
              <input
                type="text"
                className="form-control p-2"
                id="informacion"
                name="informacion_adicional"
                value={editForm.informacion_adicional}
                onChange={handleEditChange}
                placeholder="Observaciones"
              />
            </div>
          </div>
        </section>

        <div className="d-flex flex-column align-items-center text-center">
            <button
            className="search-button p-2"
            onClick={() => handleOcultarOpciones()}
            >
            {mostrarOpcionesEstado ? "Conservar estado" : "Modificar estado"}
            </button>

            {mostrarOpcionesEstado && (
            <div className="custom-select-container w-50 text-center">
                <select
                className="form-select custom-select border border-success rounded mt-3"
                id="estado"
                name="estado"
                value={editForm.estado}
                onChange={handleEditChange}
                >
                <option value="" selected hidden>Seleccionar un estado</option>
                {originalData?.estado === "Activo" ? (
                  <option value="Inactivo">Deshabilitar</option>
                ) : (
                  <option value="Activo">Habilitar</option>
                )}
                </select>
            </div>
            )}
        </div>

        <div className="d-flex justify-content-between">
          <button
            className="search-button p-2"
            onClick={() => setCurrentStep(2)}
          >
            Volver a resultados
          </button>

          <button
            className="search-button p-2"
            onClick={confirmarEdicion}
            disabled={!hasChanges()}
          >
            <IoIosCheckmarkCircleOutline className="text-white pe-1 fs-3" />
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <HeaderStaff />

      {currentStep === 1 && renderSearchStep()}
      {currentStep === 2 && renderResultsStep()}
      {currentStep === 3 && renderEditStep()}

      <button
        className="btn btn-volver rounded-pill text-white text-center text-uppercase mt-2"
        type="button"
        onClick={handleVolver}
      >
        <MdSubdirectoryArrowLeft className="text-white pe-1 arrow-style" />
        Volver
      </button>

      <Footer />
    </div>
  );
};

export default EditarPrestador;
