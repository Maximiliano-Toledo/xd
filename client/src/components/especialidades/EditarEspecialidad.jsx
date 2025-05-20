import { MdSubdirectoryArrowLeft } from "react-icons/md";
import { useNavigate } from "react-router";
import HeaderStaff from "../../layouts/HeaderStaff";
import LiveAlert from "../utils/LiveAlert";
import { useEffect, useState, useMemo } from "react";
import { useAbmApi } from "../../hooks/useAbmApi";
import CustomSelect from "../CustomSelect";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import "../../styles/cargar-cartilla.css";
import '../../styles/panel-usuario-nuevo.css';

const EditarEspecialidad = () => {
  const navigate = useNavigate();
  const handleVolver = () => {
    navigate(-1);
  };
  const { handleSubmit } = useForm();

  const [formData, setFormData] = useState({ 
    especialidad: "",
    nombre: ""
  });
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [mostrarOpcionesEstado, setMostrarOpcionesEstado] = useState(false);

  const handleOcultarOpciones = () => {
    if (mostrarOpcionesEstado) {
      setEstadoSeleccionado(null);
    }
    setMostrarOpcionesEstado(!mostrarOpcionesEstado);
  };

  
  const {
    data: especialidades,
    loading: loadingEspecialidades,
    getAll: getEspecialidades,
    getById: getEspecialidadById,
    update: updateEspecialidad,
    toggleStatus: toggleEspecialidadStatus
  } = useAbmApi("especialidades");

  useEffect(() => {
    getEspecialidades();
  }, []);

  const adaptarOpciones = (opciones, idKey, nombreKey) => {
    return opciones.map((opcion) => ({
      id: opcion[idKey],
      nombre: opcion[nombreKey],
    }));
  };

  const handleChange = async (selectedOption) => {
    const idEspecialidad = selectedOption.target['value'];

    if (!idEspecialidad) {
      setFormData({
        especialidad: "",
        nombre: ""
      });
      setEspecialidadSeleccionada(null);
      setEstadoSeleccionado(null);
      setMostrarOpcionesEstado(false);
      return;
    }

    setFormData(prev => ({
      ...prev,
      especialidad: idEspecialidad
    }));
    
    try {
      const especialidad = await getEspecialidadById(idEspecialidad);
      setEspecialidadSeleccionada(especialidad);
      setFormData(prev => ({
        ...prev,
        nombre: especialidad.nombre
      }));
      setEstadoSeleccionado(null);
      setMostrarOpcionesEstado(false);
    } catch (error) {
      console.error("Error al cargar la especialidad:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo cargar la información de la especialidad",
        icon: "error",
        confirmButtonColor: "#64A70B",
      });
    }
  };

  const handleEstadoChange = (e) => {
    setEstadoSeleccionado(e.target.value);
  };

  const handleNombreChange = (e) => {
    setFormData(prev => ({
      ...prev,
      nombre: e.target.value
    }));
  };

  // Determinar si hay cambios para habilitar/deshabilitar el botón de guardar
  const hayCambios = useMemo(() => {
    // No hay especialidad seleccionada
    if (!especialidadSeleccionada) return false;
    
    // Verificar si el nombre cambió
    const nombreCambio = formData.nombre !== especialidadSeleccionada.nombre && formData.nombre.trim() !== "";
    
    // Verificar si hay un cambio de estado seleccionado
    const estadoCambio = !!estadoSeleccionado;
    
    return nombreCambio || estadoCambio;
  }, [especialidadSeleccionada, formData.nombre, estadoSeleccionado]);

  const confirmarEditar = async () => {
    try {
      const cambios = {};
      let necesitaActualizar = false;
      
      // Verificar si cambió el nombre
      if (formData.nombre !== especialidadSeleccionada.nombre && formData.nombre.trim() !== "") {
        cambios.nombre = formData.nombre;
        necesitaActualizar = true;
      }
      
      // Verificar si se seleccionó cambiar el estado
      if (estadoSeleccionado) {
        try {
          await toggleEspecialidadStatus(formData.especialidad);
          // Refrescar datos después de cambiar el estado
          const especialidadActualizada = await getEspecialidadById(formData.especialidad);
          setEspecialidadSeleccionada(especialidadActualizada);
        } catch (error) {
          console.error("Error al cambiar el estado:", error);
          throw error;
        }
      }
      
      // Actualizar nombre si cambió
      if (necesitaActualizar) {
        await updateEspecialidad(formData.especialidad, cambios);
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
        title: "Especialidad actualizada correctamente",
        icon: "success",
        confirmButtonColor: "#64A70B",
      });
      
      // Refrescar datos
      const especialidadActualizada = await getEspecialidadById(formData.especialidad);
      setEspecialidadSeleccionada(especialidadActualizada);
      setFormData(prev => ({
        ...prev,
        nombre: especialidadActualizada.nombre
      }));
      setEstadoSeleccionado(null);
      setMostrarOpcionesEstado(false);
      
    } catch (error) {
      console.error("Error al editar la especialidad:", error);
      Swal.fire({
        title: "Error al editar la especialidad",
        text: error.message || "Ha ocurrido un error al intentar editar la especialidad.",
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

  // Verificar si hay una especialidad seleccionada
  const hayEspecialidadSeleccionada = !!especialidadSeleccionada;

  return (
    <div className="container-fluid px-2 px-md-4">
      <HeaderStaff />
      <h1 className="w-50 w-md-75 fs-5 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mb-0">
        Editar especialidad
      </h1>

      <div className="d-flex justify-content-center align-items-start mt-0">
            <div className="w-100 d-flex flex-column border shadow-input p-3 p-md-4 rounded-3 shadow ps-2 ps-md-5">
              <h6 className="fs-5 fs-md-5 h1-titulo fw-bold text-wrap">
                Visualizá la especialidad seleccionada. Gestioná su estado
                (habilitada/deshabilitada) y actualizá su nombre desde la sección
                inferior.
              </h6>
            </div>
      </div>

  <div className="d-flex justify-content-center align-items-start min-vh-75">
    <div className="w-100 d-flex flex-column border shadow-input p-3 p-md-5 rounded-3 shadow mt-4">
      
      <div className="border m-1 rounded">
        <div className="form-group mb-4 w-50 w-md-50 mx-auto px-3">
          <label htmlFor="especialidad"
            className="mt-3 fs-6 text-uppercase text-success-label">
            Especialidad:
          </label>
          <CustomSelect
            options={adaptarOpciones(
              especialidades,
              "id_especialidad",
              "nombre"
            )}
            value={formData.especialidad}
            onChange={handleChange}
            name="especialidad"
            placeholder="Seleccioná la especialidad que querés editar"
            disabled={loadingEspecialidades}
            loading={loadingEspecialidades}
          />
        </div>

        {/* Tabla */}
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
                            <span style={{ fontWeight: "normal", fontSize: '0.8rem' }}>
                              <b>Activo:</b> visible para los afiliados. <br />
                              <b>Desactivado:</b> seguirá disponible en el sistema para 
                                editar o actualizar, pero no será visible para los afiliados.
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
                      {especialidadSeleccionada?.nombre || "Nombre de la especialidad seleccionada"}
                    </td>
                    <td className={especialidadSeleccionada?.estado ? (especialidadSeleccionada.estado === "Activo" ? "text-center align-middle text-success" : "text-center align-middle text-danger") : "text-center align-middle"}>
                      {especialidadSeleccionada?.estado ? (especialidadSeleccionada.estado === "Activo" ? "Activo" : "Inactivo") : "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modificar Estado */}
      <div className="border m-1 rounded p-3 p-md-4">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center px-2 px-md-5">
          <h6 className="fw-bold fs-5 fs-md-5 h1-titulo text-start mb-2 mb-md-0 me-0 me-md-3">
            Modificar el estado de la especialidad.
          </h6>
          <LiveAlert
            message={
              <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#555' }}>
                Esta acción cambia la visibilidad de la especialidad. <br />
                <b>Habilitar</b>: lo hace visible para los afiliados. <br />
                <b>Deshabilitar</b>: lo oculta, pero sigue disponible para editar.  
                <br />
                Si no necesitás cambiar el estado actual, no realices ninguna acción.
              </span>
            }
          />
        </div>

        <div className="d-flex flex-column align-items-center text-center mt-3 px-3">
          <button
            className="btn-search p-2 mt-1"
            onClick={() => handleOcultarOpciones()}
            disabled={!hayEspecialidadSeleccionada}
          >
            {mostrarOpcionesEstado ? "Conservar estado" : "Modificar estado"}
          </button>

          {mostrarOpcionesEstado && (
            <div className="custom-select-container w-100 w-md-50 mt-3">
              <select
                className="form-select custom-select border border-success rounded"
                id="estado"
                value={estadoSeleccionado || ""}
                onChange={handleEstadoChange}
                disabled={!hayEspecialidadSeleccionada}
              >
                <option value="">Seleccionar acción...</option>
                {especialidadSeleccionada?.estado === "Activo" ? (
                  <option value="Inactivo">Deshabilitar</option>
                ) : (
                  <option value="Activo">Habilitar</option>
                )}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Modificar Nombre */}
      <div className="border m-1 rounded p-3 p-md-4">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center px-2 px-md-5">
          <h6 className="fw-bold fs-5 fs-md-5 h1-titulo text-start mb-2 mb-md-0 me-0 me-md-3">
            Modificar el nombre de la especialidad.
          </h6>
          <LiveAlert message={
            <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#555' }}>
              Modificá el nombre solo si es
              necesario. <br/>Si no querés hacer
              cambios, no es obligatorio
              completar este campo.
            </span>
          }/>
        </div>
        <div className="d-flex flex-column align-items-center text-center px-3">
          <label
            htmlFor="especialidad"
            className="text-success-label fw-bold text-uppercase mb-2 mt-3"
          >
            Edición del nombre de la especialidad
          </label>

          <input
            type="text"
            className="form-control w-50 w-md-50"
            placeholder="Ingresá el nuevo nombre"
            value={formData.nombre}
            onChange={handleNombreChange}
            disabled={!hayEspecialidadSeleccionada}
          />
        </div>
      </div>

      <div className="d-flex justify-content-center mt-4">
        <button
          className="btn btn-search rounded-pill text-white text-center text-uppercase w-md-auto white-space-nowrap mx-3"
          type="submit"
          onClick={onSubmit}
          disabled={!hayEspecialidadSeleccionada || !hayCambios}
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

export default EditarEspecialidad;