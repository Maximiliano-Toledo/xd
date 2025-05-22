import React from "react";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import LiveAlert from "../../utils/LiveAlert";
import PhoneInput from "../../../utils/PhoneInput";
import PhoneNormalizationAlert from "./components/PhoneNormalizationAlert.jsx";

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

        <section className="d-flex flex-column flex-md-row justify-content-between w-100 gap-4 mb-0">
          <div className="w-100 w-md-50">
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

          <div className="w-100 w-md-50">
            {/* Sección de teléfono con normalización */}
            <div className="form-group mb-5 position-relative">
              <label
                htmlFor="telefono"
                className="text-success-label fw-bold fs-6"
              >
                Teléfono:
              </label>

              {phonesNeedNormalization && (
                <PhoneNormalizationAlert
                  originalPhones={selectedPrestador?.telefonos}
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
                  required={true}
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
                <option value="" selected hidden>
                  Seleccionar un estado
                </option>
                {editForm.estado === "Activo" ? (
                  <option value="Inactivo">Deshabilitar</option>
                ) : (
                  <option value="Activo">Habilitar</option>
                )}
              </select>
            </div>
          )}
        </div>

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
            disabled={!hasChanges() || (phonesNeedNormalization && !phoneNormalizationDone)}
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