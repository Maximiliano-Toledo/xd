import HeaderStaff from "../../layouts/HeaderStaff";
import { MdSubdirectoryArrowLeft } from "react-icons/md";
import { useNavigate } from "react-router";
import CustomSelect from "../CustomSelect";
import { useAbmApi } from "../../hooks/useAbmApi";
import { useEffect, useState, useMemo } from "react";
import LiveAlert from "../utils/LiveAlert";
import "../../styles/cargar-cartilla.css";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import '../../styles/panel-usuario-nuevo.css'

const EditarPlan = () => {
  const navigate = useNavigate();
  const handleVolver = () => {
    navigate(-1);
  };
  const { handleSubmit } = useForm();

  const [formData, setFormData] = useState({ plan: "", nombre: "" });
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [mostrarOpcionesEstado, setMostrarOpcionesEstado] = useState(false);

  const handleOcultarOpciones = () => {
    if (mostrarOpcionesEstado) {
      setEstadoSeleccionado(null);
    }
    setMostrarOpcionesEstado(!mostrarOpcionesEstado);
  };

  const {
    data: planes,
    loading: loadingPlanes,
    getAll: getPlanes,
    getById: getPlanById,
    update: updatePlan,
    toggleStatus: togglePlanStatus,
  } = useAbmApi("planes");

  // Cargar datos al montar el componente
  useEffect(() => {
    getPlanes();
  }, []);

  // Adaptar opciones para CustomSelect
  const adaptarOpciones = (opciones, idKey, nombreKey) => {
    return opciones.map((opcion) => ({
      id: opcion[idKey],
      nombre: opcion[nombreKey],
    }));
  };

  const handleChange = async (selectedOption) => {
    const idPlan = selectedOption.target["value"];

    if (!idPlan) {
      setFormData({
        plan: "",
        nombre: "",
      });
      setPlanSeleccionado(null);
      setEstadoSeleccionado(null);
      setMostrarOpcionesEstado(false);
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      plan: idPlan,
    }));

    try {
      const plan = await getPlanById(idPlan);
      setPlanSeleccionado(plan);
      setFormData((prev) => ({
        ...prev,
        nombre: plan.nombre,
      }));
      setEstadoSeleccionado(null);
      setMostrarOpcionesEstado(false);
    } catch (error) {
      console.error("Error al cargar el plan:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo cargar la información del plan",
        icon: "error",
        confirmButtonColor: "#64A70B",
      });
    }
  };

  const handleEstadoChange = (e) => {
    setEstadoSeleccionado(e.target.value);
  };

  const handleNombreChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      nombre: e.target.value,
    }));
  };

  // Determinar si hay cambios para habilitar/deshabilitar el botón de guardar
  const hayCambios = useMemo(() => {
    // No hay plan seleccionado
    if (!planSeleccionado) return false;
    
    // Verificar si el nombre cambió
    const nombreCambio = formData.nombre !== planSeleccionado.nombre && formData.nombre.trim() !== "";
    
    // Verificar si hay un cambio de estado seleccionado
    const estadoCambio = !!estadoSeleccionado;
    
    return nombreCambio || estadoCambio;
  }, [planSeleccionado, formData.nombre, estadoSeleccionado]);

  const confirmarEditar = async () => {
    try {
      const cambios = {};
      let necesitaActualizar = false;

      // Verificar si cambió el nombre
      if (formData.nombre !== planSeleccionado.nombre && formData.nombre.trim() !== "") {
        cambios.nombre = formData.nombre;
        necesitaActualizar = true;
      }

      // Verificar si se seleccionó cambiar el estado
      if (estadoSeleccionado) {
        try {
          await togglePlanStatus(formData.plan);
          // Refrescar datos después de cambiar el estado
          const planActualizado = await getPlanById(formData.plan);
          setPlanSeleccionado(planActualizado);
        } catch (error) {
          console.error("Error al cambiar el estado:", error);
          throw error;
        }
      }

      // Actualizar nombre si cambió
      if (necesitaActualizar) {
        await updatePlan(formData.plan, cambios);
      }

      // Si no hay cambios en nombre ni estado seleccionado
      if (!necesitaActualizar && !estadoSeleccionado) {
        Swal.fire({
          title: "No se realizaron cambios",
          text: "No se detectaron modificaciones para guardar",
          icon: "info",
          confirmButtonColor: "#64A70B",
        });
        return;
      }

      Swal.fire({
        title: "Plan actualizado correctamente",
        icon: "success",
        confirmButtonColor: "#64A70B",
      });

      // Refrescar datos
      const planActualizado = await getPlanById(formData.plan);
      setPlanSeleccionado(planActualizado);
      setFormData((prev) => ({
        ...prev,
        nombre: planActualizado.nombre,
      }));
      setEstadoSeleccionado(null);
      setMostrarOpcionesEstado(false);
    } catch (error) {
      console.error("Error al editar el plan:", error);
      Swal.fire({
        title: "Error al editar el plan",
        text:
          error.message || "Ha ocurrido un error al intentar editar el plan.",
        icon: "error",
        confirmButtonColor: "#64A70B",
      });
    }
  };

  const onSubmit = handleSubmit(() => {
      Swal.fire({
        title: "¿Confirmar cambios?",
        text: "¿Estás seguro de que deseas guardar los cambios realizados?",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        cancelButtonColor: "#d33",
        confirmButtonText: "Confirmar",
        confirmButtonColor: "#64A70B",
      }).then((result) => {
        if (result.isConfirmed) {
          confirmarEditar();
        }
      });
  });

  // Verificar si hay un plan seleccionado
  const hayPlanSeleccionado = !!planSeleccionado;

  return (
   <div className="container-fluid px-2 px-md-4">
      <HeaderStaff/>
      <h1 className="w-50 w-md-75 fs-5 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mb-0">
        Editar plan
      </h1>
    <div className="d-flex justify-content-center align-items-start mt-0">
      <div className="w-100 d-flex flex-column border shadow-input p-3  rounded-3 shadow ps-2 ps-md-5">
        <h6 className="fs-5 fs-md-5 h1-titulo fw-bold text-wrap">
          Visualización del plan seleccionado. Gestioná su estado (habilitado/deshabilitado) y actualizá su
          nombre desde la sección inferior.
        </h6>
      </div>
    </div>

    <div className="d-flex justify-content-center align-items-start min-vh-75">
      <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow mt-4">
        {/*Seleccionar el plan */}
        <div className="border m-1 rounded">
          {/**Select de Plan */}
          <div className="form-group mb-4 w-50 w-md-50 mx-auto px-3">
            <label
              htmlFor="plan"
              className="mt-3 fs-6 text-uppercase text-success-label"
            >
              Plan:
            </label>
            <CustomSelect
              options={adaptarOpciones(planes, "id_plan", "nombre")}
              value={formData.plan}
              onChange={handleChange}
              name="plan"
              placeholder="Seleccioná el plan que querés editar"
              disabled={loadingPlanes}
              loading={loadingPlanes}
            />
          </div>

          {/**Tabla */}
          <div className="container py-4">
            <div className="w-75 w-md-75 mx-auto mb-4">
              <div className="card-body p-0 table-responsive">
                <table className="table table-bordered mb-0">
                  <thead>
                    <tr>
                      <th className="text-center align-middle fs-6 bg-light letter-color">
                        Nombre
                      </th>
                      <th className="text-center align-middle fs-6 bg-light letter-color">
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          <span>Estado</span>
                          <LiveAlert
                            message={
                              <span
                                style={{
                                  fontWeight: "normal",
                                  fontSize: "0.8rem",
                                }}
                              >
                                <b>Activo:</b> visible para los afiliados.{" "}
                                <br />
                                <b>Desactivado:</b> seguirá disponible en el
                                sistema para editar o actualizar, pero no
                                será visible para los afiliados.
                              </span>
                            }
                          />
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className="align-middle">
                        {planSeleccionado?.nombre || "Nombre de la especialidad seleccionada"}
                      </td>
                      <td className={planSeleccionado?.estado ? (planSeleccionado.estado === "Activo" ? "text-center align-middle text-success" : "text-center align-middle text-danger") : "text-center align-middle"}>
                        {planSeleccionado?.estado ? (planSeleccionado.estado === "Activo" ? "Activo" : "Inactivo") : "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/*Modificar el Estado */}
        <div className="border m-1 rounded p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center px-2 px-md-5">
            <h6 className="fw-bold fs-5 fs-md-5 h1-titulo text-start mb-2 mb-md-0 me-0 me-md-3">
              Modificar el estado del plan.
            </h6>
            <LiveAlert
              message={
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "normal",
                    color: "#555",
                  }}
                >
                  Esta acción cambia la visibilidad del plan. <br />
                  <b>Habilitar</b>: lo hace visible para los afiliados. <br />
                  <b>Deshabilitar</b>: lo oculta, pero sigue disponible para
                  editar.
                  <br />
                  Si no necesitás cambiar el estado actual, no realices
                  ninguna acción.
                </span>
              }
            />
          </div>

          <div className="d-flex flex-column align-items-center text-center">
            <button
              className="btn-search p-2 mt-3"
              onClick={() => handleOcultarOpciones()}
              disabled={!hayPlanSeleccionado}
            >
              {mostrarOpcionesEstado ? "Conservar estado" : "Modificar estado"}
            </button>

            {mostrarOpcionesEstado && (
              <div className="custom-select-container w-100 w-md-50 mt-2 px-3">
                <select
                  className="form-select custom-select border border-success rounded"
                  id="estado"
                  value={estadoSeleccionado || ""}
                  onChange={handleEstadoChange}
                  disabled={!hayPlanSeleccionado}
                >
                  <option value="">Seleccionar acción...</option>
                  {planSeleccionado?.estado === "Activo" ? (
                    <option value="Inactivo">Deshabilitar</option>
                  ) : (
                    <option value="Activo">Habilitar</option>
                  )}
                </select>
              </div>
            )}
          </div>
        </div>

        {/*Modificar el nombre */}   
        <div className="border m-1 rounded p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center px-2 px-md-5">
            <h6 className="fw-bold fs-5 fs-md-5 h1-titulo text-start mb-2 mb-md-0 me-0 me-md-3">
              Modificar el nombre del plan.
            </h6>
            <LiveAlert message={
                <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#555' }}>
                 Modificá el nombre solo si es
                  necesario. <br/>Si no querés hacer
                  cambios, no es obligatorio
                  completar este campo.
                </span>
              }
            />
          </div>

          <div className="d-flex flex-column align-items-center text-center px-3">
            <label htmlFor="nombre" className="text-success-label fw-bold text-uppercase mb-2 mt-3">
              Edición del nombre del plan
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              className="form-control w-50 w-md-50"
              placeholder="Ingresá el nombre del plan"
              value={formData.nombre}
              onChange={handleNombreChange}
              disabled={!hayPlanSeleccionado}
            />
          </div>
        </div>

        <div className="d-flex justify-content-center mt-4">
          <button
            className="btn btn-search rounded-pill text-white text-center text-uppercase w-md-auto white-space-nowrap mx-3"
            type="submit"
            onClick={onSubmit}
            disabled={!hayPlanSeleccionado || !hayCambios}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>

    <div className="back-button-container mt-3 mb-4 px-3">
      <button className="back-button" onClick={handleVolver}>
        <MdSubdirectoryArrowLeft />
        <span>Volver</span>
      </button>
    </div>
  </div>
  );
};

export default EditarPlan;