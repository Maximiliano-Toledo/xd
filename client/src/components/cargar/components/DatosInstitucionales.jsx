import React from "react";
import CustomSelect from "../../CustomSelect";
import LiveAlert from "../../utils/LiveAlert";

const DatosInstitucionales = ({
                                formData,
                                planes,
                                categorias,
                                especialidades,
                                loading,
                                handleChange,
                                register,
                                errors
                              }) => {
  // Adaptar opciones para CustomSelect
  const adaptarOpciones = (opciones, idKey, nombreKey) => {
    return opciones.map((opcion) => ({
      id: opcion[idKey],
      nombre: opcion[nombreKey],
    }));
  };

  return (
    <div className="d-flex justify-content-between m-3">
      {/* Columna izquierda */}
      <div className="w-50 pe-3">
        <div className="form-group mb-4">
          <label htmlFor="plan" className="fw-bold p-1 fs-6">
            Plan:
          </label>
          <CustomSelect
            options={adaptarOpciones(planes, "id_plan", "nombre")}
            value={formData.plan}
            onChange={handleChange}
            name="plan"
            placeholder={loading.planes ? "Cargando planes..." : "Seleccione uno o más planes"}
            disabled={loading.planes}
            loading={loading.planes}
            multiple={true}
          />
          {errors.plan && <span className="ms-3 text-danger fw-bold">Al menos un plan es requerido</span>}
        </div>

        <div className="form-group mb-4">
          <LiveAlert
            message={
              <>
                Ingresá el nombre con mayúscula inicial en cada palabra. <b>Ejemplo:</b> Clínica Médica. <br />
                Puedes seleccionar múltiples especialidades.
              </>
            }
          />

          <label htmlFor="especialidad" className="fw-bold p-1 fs-6">
            Especialidad:
          </label>
          <CustomSelect
            options={adaptarOpciones(especialidades, "id_especialidad", "nombre")}
            value={formData.especialidad}
            onChange={handleChange}
            name="especialidad"
            placeholder={
              loading.especialidades ? "Cargando especialidades..." : "Seleccione una o más especialidades"
            }
            disabled={loading.especialidades}
            loading={loading.especialidades}
            multiple={true}
          />
          {errors.especialidad && (
            <span className="ms-3 text-danger fw-bold">Al menos una especialidad es requerida</span>
          )}
        </div>
      </div>

      {/* Columna derecha */}
      <div className="w-50 ps-3">
        <div className="form-group mb-4">
          <label htmlFor="categoria" className="fw-bold p-1 fs-6">
            Categoría:
          </label>
          <CustomSelect
            options={adaptarOpciones(categorias, "id_categoria", "nombre")}
            value={formData.categoria}
            onChange={handleChange}
            name="categoria"
            placeholder={loading.categorias ? "Cargando categorías..." : "Seleccione una categoría"}
            disabled={loading.categorias}
            loading={loading.categorias}
          />
          {errors.categoria && <span className="ms-3 text-danger fw-bold">La categoría es requerida</span>}
        </div>

        <div className="form-group mb-4 position-relative">
          <LiveAlert
            message={
              <>
                Cada palabra debe iniciar con mayúscula. <b>Ejemplo</b>: Policlínico Regional Avellaneda.
                <br />
                Ingresá un único prestador por vez.
              </>
            }
          />

          <label htmlFor="nombre" className="fw-bold p-1 fs-6">
            Nombre del prestador:
          </label>
          <input
            type="text"
            {...register("nombre", {
              required: true,
              minLength: 2,
              onChange: (e) => handleChange(e),
            })}
            className="form-control p-2"
            id="nombre"
            placeholder="Ingresá el nombre completo del prestador"
          />
          {errors.nombre?.type === "required" && (
            <span className="ms-3 text-danger fw-bold">El nombre del prestador es requerido</span>
          )}
          {errors.nombre?.type === "minLength" && (
            <span className="ms-3 text-danger fw-bold">El nombre debe tener mínimo 2 caracteres</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatosInstitucionales;