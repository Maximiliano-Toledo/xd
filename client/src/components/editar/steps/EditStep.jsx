import React from "react";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import LiveAlert from "../../utils/LiveAlert";
import PhoneInput from "../../../utils/PhoneInput";
import PhoneNormalizationAlert from "./components/PhoneNormalizationAlert.jsx";
import AtencionVirtualEditCheckbox from "./components/AtencionVirtualEditCheckbox.jsx";

const EditStep = ({
                    selectedPrestador,
                    editForm,
                    formData,
                    options,
                    handleEditChange,
                    confirmarEdicion,
                    mostrarOpcionesEstado,
                    handleOcultarOpciones,
                    goToResults,
                    hasChanges,
                    phonesNeedNormalization,
                    phoneNormalizationDone,
                    handleNormalizePhones,
                    setPhonesNeedNormalization,
                    setPhoneNormalizationDone,
                    setEditForm
                  }) => {

  // Verificar si es un profesional
  const esProfesional = () => {
    if (!selectedPrestador?.categorias || !Array.isArray(selectedPrestador.categorias)) {
      return false;
    }

    return selectedPrestador.categorias.some(cat =>
      cat.nombre === "Profesionales" || cat.categoria_nombre === "Profesionales"
    );
  };

  const categoriaSeleccionada = options.categorias.find(
    (c) => String(c.id_categoria) === String(formData.categoria)
  );

  const esCategoriaProfesional = categoriaSeleccionada?.nombre === "Profesionales";

  // CORREGIDO: Verificar si la atención virtual está habilitada SOLO desde el formulario actual
  const isAtencionVirtualEnabled = () => {
    return editForm.atencion_virtual === "Si";
  };

  // NUEVA FUNCIÓN: Validar contactos para atención virtual
  const validarContactosAtencionVirtual = () => {
    if (!esCategoriaProfesional || !isAtencionVirtualEnabled()) {
      return true; // No aplica validación especial
    }

    // Para profesionales con atención virtual, validar que tenga al menos teléfono o email
    const tieneEmail = editForm.email && editForm.email.trim() !== "";
    const tieneTelefono = (() => {
      try {
        if (!editForm.telefonos) return false;
        const phones = JSON.parse(editForm.telefonos);
        return Array.isArray(phones) && phones.length > 0;
      } catch (e) {
        return editForm.telefonos && editForm.telefonos.trim() !== "";
      }
    })();

    return tieneEmail || tieneTelefono;
  };

  // NUEVA FUNCIÓN: Validar dirección según tipo de prestador
  const validarDireccion = () => {
    if (esCategoriaProfesional && isAtencionVirtualEnabled()) {
      return true; // Dirección opcional para profesionales con atención virtual
    }

    // Para todos los demás casos, dirección es obligatoria
    return editForm.direccion && editForm.direccion.trim() !== "";
  };

  // NUEVA FUNCIÓN: Verificar si se puede guardar según las reglas de validación
  const puedeGuardar = () => {
    if (!hasChanges()) return false;
    if (phonesNeedNormalization && !phoneNormalizationDone) return false;

    // Validaciones específicas según tipo de prestador
    if (esCategoriaProfesional && isAtencionVirtualEnabled()) {
      // Profesional con atención virtual: al menos teléfono o email
      return validarContactosAtencionVirtual();
    } else {
      // Otros casos: dirección obligatoria
      return validarDireccion();
    }
  };

  // NUEVA FUNCIÓN: Obtener mensaje de validación
  const obtenerMensajeValidacion = () => {
    if (esCategoriaProfesional && isAtencionVirtualEnabled()) {
      if (!validarContactosAtencionVirtual()) {
        return "Para profesionales con atención virtual debe proporcionar al menos un teléfono o email de contacto.";
      }
    } else {
      if (!validarDireccion()) {
        return "La dirección es obligatoria para este tipo de prestador.";
      }
    }
    return null;
  };

  return (
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

        {/* Checkbox para atención virtual - solo para profesionales */}
        {esCategoriaProfesional && (
          <AtencionVirtualEditCheckbox
            selectedPrestador={selectedPrestador}
            editForm={editForm}
            onChange={handleEditChange}
            esProfesional={() => true}
          />
        )}

        {/* CORREGIDO: Mensaje de validación condicional - solo mostrar si atención virtual está ACTUALMENTE habilitada */}
        {esCategoriaProfesional && isAtencionVirtualEnabled() && (
          <div className="alert alert-info mb-4">
            <strong>Atención Virtual:</strong> Para este tipo de prestador debe proporcionar al menos un teléfono o email de contacto. La dirección física es opcional.
          </div>
        )}

        <section className="d-flex flex-column flex-md-row justify-content-between w-100 gap-4 mb-0">
          <div className="w-100 w-md-50">
            <div className="form-group mb-5">
              <label
                htmlFor="direccion"
                className="text-success-label fw-bold fs-6"
              >
                Dirección:
                {/* CORREGIDO: Mostrar badges según el estado ACTUAL del formulario */}
                {esCategoriaProfesional && isAtencionVirtualEnabled() ? (
                  <span className="ms-2 badge text-dark">Opcional (Atención Virtual)</span>
                ) : (
                  <span className="ms-2 badge text-dark">Obligatorio</span>
                )}
              </label>
              <input
                type="text"
                className="form-control p-2"
                id="direccion"
                name="direccion"
                value={editForm.direccion}
                onChange={handleEditChange}
                placeholder={
                  esCategoriaProfesional && isAtencionVirtualEnabled()
                    ? "Dirección física (opcional para atención virtual)"
                    : "Ingrese una dirección"
                }
              />
              {!validarDireccion() && !(esCategoriaProfesional && isAtencionVirtualEnabled()) && (
                <span className="ms-3 text-danger fw-bold">La dirección es requerida</span>
              )}
            </div>

            <div className="form-group position-relative">
              <label
                htmlFor="email"
                className="text-success-label fw-bold fs-6"
              >
                E-mail:
                {/* CORREGIDO: Mostrar badges según el estado ACTUAL del formulario */}
                {esCategoriaProfesional && isAtencionVirtualEnabled() ? (
                  <span className="ms-2 badge text-dark">Teléfono O Email requerido</span>
                ) : (
                  <span className="ms-2 badge text-dark">Opcional</span>
                )}
              </label>
              <input
                className="form-control p-2"
                id="email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                placeholder="ejemplo@correo.com"
              />
              {esCategoriaProfesional && isAtencionVirtualEnabled() && !validarContactosAtencionVirtual() && (
                <span className="ms-3 text-success-label">
                  Debe proporcionar al menos un teléfono o email
                </span>
              )}
            </div>
          </div>

          <div className="w-100 w-md-50">
            {/* Sección de teléfono con normalización */}
            <div className="form-group mb-5 position-relative">
              <label
                htmlFor="telefono"
                className="text-success-label fw-bold fs-6"
              >
                Teléfono:
                {/* CORREGIDO: Mostrar badges según el estado ACTUAL del formulario */}
                {esCategoriaProfesional && isAtencionVirtualEnabled() ? (
                  <span className="ms-2 badge text-dark">Teléfono O Email requerido</span>
                ) : (
                  <span className="ms-2 badge text-dark">Opcional</span>
                )}
              </label>

              {phonesNeedNormalization && (
                <PhoneNormalizationAlert
                  originalPhones={selectedPrestador?.telefonos}
                  prestadorUbicacion={{
                    provincia: options.provincias.find(p =>
                      String(p.id_provincia) === String(formData.provincia)
                    )?.nombre || null,
                    localidad: options.localidades.find(l =>
                      String(l.id_localidad) === String(formData.localidad)
                    )?.nombre || null
                  }}
                  onNormalizeClick={handleNormalizePhones}
                  onManualEdit={() => {
                    setPhonesNeedNormalization(false);
                    setPhoneNormalizationDone(false);
                  }}
                />
              )}

              {(!phonesNeedNormalization || phoneNormalizationDone) && (
                <PhoneInput
                  value={editForm.telefonos}
                  onChange={(value) => {
                    setEditForm(prev => ({ ...prev, telefonos: value }));
                  }}
                  disabled={false}
                  required={false}
                />
              )}
            </div>

            <div className="form-group mb-5">
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

        <div className="d-flex flex-column align-items-center text-center mt-5">
          <LiveAlert
            message={
              <span>
                <b>Habilitar:</b> Visible para los afiliados. <br />
                <b>Deshabilitar:</b> Seguirá disponible en el sistema para editar
                o actualizar, pero no será visible para los afiliados. <br />
                Modificar el estado solo si es necesario.
              </span>
            }
          />
          <button
            className="search-button p-2"
            onClick={handleOcultarOpciones}
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
                <option defaultValue={""} hidden>
                  Seleccionar un estado
                </option>
                {selectedPrestador.estado === "Activo" ? (
                  <option value="Inactivo">Deshabilitar</option>
                ) : (
                  <option value="Activo">Habilitar</option>
                )}
              </select>
            </div>
          )}
        </div>

        {/* CORREGIDO: Mensaje de validación si no cumple requisitos - solo mostrar según estado ACTUAL */}
        {(() => {
          const mensajeValidacion = obtenerMensajeValidacion();
          return mensajeValidacion ? (
            <div className="alert alert-danger mt-3 text-center">
              {mensajeValidacion}
            </div>
          ) : null;
        })()}

        <div className="d-flex justify-content-between mt-3">
          <button
            className="search-button p-2"
            onClick={goToResults}
          >
            Volver a resultados
          </button>

          <button
            className="search-button p-2"
            onClick={confirmarEdicion}
            disabled={!puedeGuardar()}
          >
            <IoIosCheckmarkCircleOutline className="text-white pe-1 fs-3" />
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStep;