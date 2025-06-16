import React, { useEffect, useRef } from "react";
import { LuLaptop } from 'react-icons/lu';
import CustomSelect from "../../CustomSelect";
import LiveAlert from "../../utils/LiveAlert";
import PhoneInput from "../../../utils/PhoneInput";
import AtencionVirtualCheckbox from "./AtencionVirtualCheckbox";
import "../../../styles/atencion-virtual-checkbox.css";

const DatosUbicacionContacto = ({
                                  formData,
                                  setFormData,
                                  provincias,
                                  localidades,
                                  categorias,
                                  loading,
                                  getLocalidadesByProvincia,
                                  esProfesional,
                                  handleChange,
                                  register,
                                  errors,
                                  watch,
                                  setValue,
                                  validarTelefono,
                                  validarEmail
                                }) => {
  const lastProvinciaLoaded = useRef(null);

  useEffect(() => {
    if (formData.provincia &&
      formData.provincia !== "" &&
      formData.provincia !== lastProvinciaLoaded.current &&
      !loading.localidades) {

      lastProvinciaLoaded.current = formData.provincia;
      getLocalidadesByProvincia(formData.provincia);
    }
  }, [formData.provincia, loading.localidades, getLocalidadesByProvincia]);

  useEffect(() => {
    if (!formData.provincia || formData.provincia === "") {
      lastProvinciaLoaded.current = null;
    }
  }, [formData.provincia]);

  const atencionVirtual = watch("atencionVirtual", false);

  const adaptarOpciones = (opciones, idKey, nombreKey) => {
    return opciones.map((opcion) => ({
      id: opcion[idKey],
      nombre: opcion[nombreKey],
    }));
  };

  // Determinar las reglas de validación según el contexto
  const profesional = esProfesional();
  const esAtencionVirtual = profesional && atencionVirtual;

  // Función para determinar si un campo es requerido
  const esRequerido = (campo) => {
    if (campo === 'direccion') {
      // Dirección es opcional solo para profesionales con atención virtual
      return !esAtencionVirtual;
    }
    if (campo === 'telefono' || campo === 'email') {
      // Para profesionales con atención virtual, al menos uno debe estar presente
      // Para otros, ambos son opcionales
      return false; // La validación se hace a nivel de formulario
    }
    return false;
  };

  // Función de validación personalizada para teléfono y email en atención virtual
  const validarContactoAtencionVirtual = () => {
    if (!esAtencionVirtual) return true;

    const telefonoValido = validarTelefono(formData.telefono);
    const emailValido = validarEmail(formData.email);

    return telefonoValido || emailValido;
  };

  return (
    <div className="d-flex justify-content-between m-3">
      {/* Columna izquierda */}
      <div className="w-50 pe-3 pt-4">
        <div className="form-group mb-5">
          <label htmlFor="provincia" className="fw-bold p-1 fs-6">
            Provincia:
          </label>
          <CustomSelect
            options={adaptarOpciones(provincias, "id_provincia", "nombre")}
            value={formData.provincia}
            onChange={handleChange}
            name="provincia"
            placeholder={loading.provincias ? "Cargando provincias..." : "Seleccione una provincia"}
            disabled={loading.provincias}
            loading={loading.provincias}
          />
          {errors.provincia && <span className="ms-3 text-danger fw-bold">La provincia es requerida</span>}
        </div>

        <div className="form-group mb-3">
          <label htmlFor="localidad" className="fw-bold p-1 fs-6">
            Localidad:
          </label>
          <CustomSelect
            options={adaptarOpciones(localidades, "id_localidad", "nombre")}
            value={formData.localidad}
            onChange={handleChange}
            name="localidad"
            placeholder={loading.localidades ? "Cargando localidades..." : "Seleccione una localidad"}
            disabled={loading.localidades || !formData.provincia}
            loading={loading.localidades}
          />
          {errors.localidad && <span className="ms-3 text-danger fw-bold">La localidad es requerida</span>}
        </div>

        {/* Checkbox para atención virtual */}
        <AtencionVirtualCheckbox
          formData={formData}
          categorias={categorias}
          register={register}
          handleChange={handleChange}
        />

        <div className="form-group position-relative mb-5">
          <label htmlFor="direccion" className="fw-bold p-1 fs-6">
            Dirección:
            {esAtencionVirtual && (
              <span className="ms-2 badge text-black">Opcional (Atención Virtual)</span>
            )}
            {!esAtencionVirtual && (
              <span className="ms-2 badge text-black">Obligatorio</span>
            )}
          </label>

          <input
            type="text"
            {...register("direccion", {
              required: esRequerido('direccion'),
              minLength: esRequerido('direccion') ? 4 : 0,
              onChange: (e) => handleChange(e),
            })}
            className="form-control p-2 mt-2"
            id="direccion"
            placeholder={esAtencionVirtual ?
              "Dirección física (opcional para atención virtual)" :
              "Ingrese una dirección (Calle, Altura)"}
          />
          {errors.direccion?.type === "required" && (
            <span className="ms-3 text-danger fw-bold">La dirección es requerida</span>
          )}
          {errors.direccion?.type === "minLength" && (
            <span className="ms-3 text-danger fw-bold">La dirección debe tener mínimo 4 caracteres</span>
          )}
        </div>
      </div>

      {/* Columna derecha */}
      <div className="w-50 ps-3">
        <div className="form-group mb-3 position-relative">
          <LiveAlert
            message={
              esAtencionVirtual ? (
                <>
                  <strong>Atención Virtual:</strong> Debe proporcionar al menos un teléfono o un email de contacto.<br />
                  Ingresá primero el código de área, seguido del número. No uses símbolos como ( ) ni /.<br />
                  Si hay interno, escribí int: seguido del número. <b>Ejemplo:</b> 011 43211234 int:11.<br />
                  Si son varios teléfonos, separalos con coma (,).
                </>
              ) : (
                <>
                  Teléfono opcional. Ingresá primero el código de área, seguido del número.<br />
                  No uses símbolos como ( ) ni /. Si hay interno, escribí int: seguido del número.<br />
                  <b>Ejemplo:</b> 011 43211234 int:11. Si son varios teléfonos, separalos con coma (,).
                </>
              )
            }
          />

          <label htmlFor="telefono" className="fw-bold fs-6">
            Teléfono:
            {esAtencionVirtual && (
              <span className="ms-2 badge text-black">Teléfono O Email requerido</span>
            )}
            {!esAtencionVirtual && (
              <span className="ms-2 badge text-black">Opcional</span>
            )}
          </label>

          <PhoneInput
            value={formData.telefono}
            onChange={(value) => {
              const phoneValue = typeof value === 'string' ? value : JSON.stringify([]);
              setFormData(prev => ({ ...prev, telefono: phoneValue }));
              setValue("telefono", phoneValue);
            }}
            disabled={false}
            required={false} // La validación se hace a nivel de formulario
            ubicacionContext={{
              provincia: provincias.find(p =>
                String(p.id_provincia) === String(formData.provincia)
              )?.nombre || null,
              localidad: localidades.find(l =>
                String(l.id_localidad) === String(formData.localidad)
              )?.nombre || null
            }}
          />

          {/* Mensaje de validación para atención virtual */}
          {esAtencionVirtual && !validarContactoAtencionVirtual() && (
            <span className="ms-3 badge text-black">
              Debe proporcionar al menos un teléfono o un email
            </span>
          )}
        </div>

        <div className="form-group pt-1 mb-5 position-relative">
          <LiveAlert
            message={
              esAtencionVirtual ? (
                <>
                  <strong>Atención Virtual:</strong> Debe proporcionar al menos un teléfono o un email de contacto.<br />
                  Ingresá la dirección de correo electrónico en minúsculas. No uses espacios.<br />
                  Para múltiples correos, separalos con /.<br />
                  <b>Ejemplo:</b> contacto@contacto.com / consultas@consultas.com.ar
                </>
              ) : (
                <>
                  Email opcional. Ingresá la dirección de correo electrónico en minúsculas.<br />
                  No uses espacios. Para múltiples correos, separalos con /.<br />
                  <b>Ejemplo:</b> contacto@contacto.com / consultas@consultas.com.ar
                </>
              )
            }
          />

          <label htmlFor="email" className="fw-bold fs-6">
            E-mail:
            {esAtencionVirtual && (
              <span className="ms-2 badge text-black">Teléfono O Email requerido</span>
            )}
            {!esAtencionVirtual && (
              <span className="ms-2 badge text-black">Opcional</span>
            )}
          </label>
          <input
            type="email"
            {...register("email", {
              required: false, // La validación se hace a nivel de formulario
              onChange: (e) => handleChange(e),
            })}
            className="form-control p-2 mt-2"
            id="email"
            placeholder="ejemplo@correo.com"
          />
        </div>

        <div className="form-group mb-5">
          <label htmlFor="informacion" className="fw-bold fs-6 pb-2">
            Información adicional:
          </label>
          <input
            type="text"
            {...register("informacion", {
              onChange: (e) => handleChange(e),
            })}
            className="form-control p-2"
            id="informacion"
            placeholder="Observaciones"
          />
        </div>
      </div>
    </div>
  );
};

export default DatosUbicacionContacto;