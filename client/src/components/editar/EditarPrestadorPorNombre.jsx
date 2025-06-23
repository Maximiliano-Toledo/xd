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

const EditarPrestadorPorNombre = () => {
  const navigate = useNavigate();
  const handleVolver = () => {
    navigate(-1);
  };
  const { handleSubmit } = useForm();

  const [formData, setFormData] = useState({ prestador: "", nombre: "" });
  const [prestadorSeleccionado, setPrestadorSeleccionado] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [mostrarOpcionesEstado, setMostrarOpcionesEstado] = useState(false);

  const handleOcultarOpciones = () => {
    if (mostrarOpcionesEstado) {
      setEstadoSeleccionado(null);
    }
    setMostrarOpcionesEstado(!mostrarOpcionesEstado);
  };

  const {
    data: prestadores,
    loading: loadingPrestadores,
    getAllPrestadores,
    updatePrestadorStatus,
  } = useAbmApi("prestadores");

  // Cargar datos al montar el componente
  useEffect(() => {
    getAllPrestadores();
  }, []);

  // Adaptar opciones para CustomSelect
  const adaptarOpciones = (opciones) => {
    return opciones.map((opcion) => ({
      id: opcion.nombre, // Usamos el nombre como ID ya que es lo único que tenemos
      nombre: opcion.nombre,
    }));
  };

  const handleChange = async (selectedOption) => {
    const nombrePrestador = selectedOption.target["value"];

    if (!nombrePrestador) {
      setFormData({
        prestador: "",
        nombre: "",
      });
      setPrestadorSeleccionado(null);
      setEstadoSeleccionado(null);
      setMostrarOpcionesEstado(false);
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      prestador: nombrePrestador,
      nombre: nombrePrestador // Como solo tenemos el nombre, lo usamos en ambos campos
    }));

    setPrestadorSeleccionado({
      nombre: nombrePrestador,
      estado: "Activo"
    });
    setEstadoSeleccionado(null);
    setMostrarOpcionesEstado(false);
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
    // No hay prestador seleccionado
    if (!prestadorSeleccionado) return false;
    
    // Verificar si el nombre cambió
    const nombreCambio = formData.nombre !== prestadorSeleccionado.nombre && formData.nombre.trim() !== "";
    
    // Verificar si hay un cambio de estado seleccionado
    const estadoCambio = !!estadoSeleccionado;
    
    return nombreCambio || estadoCambio;
  }, [prestadorSeleccionado, formData.nombre, estadoSeleccionado]);

  const confirmarEditar = async () => {
    try {
      // Verificar si se seleccionó cambiar el estado
      if (estadoSeleccionado) {
        try {
          await updatePrestadorStatus({
            nombre: prestadorSeleccionado.nombre,
            estado: estadoSeleccionado
          });
          
          // Actualizar el estado mostrado
          setPrestadorSeleccionado(prev => ({
            ...prev,
            estado: estadoSeleccionado
          }));
        } catch (error) {
          throw error;
        }
      }

      // Si no hay cambios
      if (!estadoSeleccionado) {
        Swal.fire({
          title: "No se realizaron cambios",
          text: "No se detectaron modificaciones para guardar",
          icon: "info",
          confirmButtonColor: "#64A70B",
        });
        return;
      }

      Swal.fire({
        title: "Prestador actualizado correctamente",
        icon: "success",
        confirmButtonColor: "#64A70B",
      });

      // Refrescar datos
      setEstadoSeleccionado(null);
      setMostrarOpcionesEstado(false);
    } catch (error) {
      Swal.fire({
        title: "Error al editar el prestador",
        text:
          error.message || "Ha ocurrido un error al intentar editar el prestador.",
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

  // Verificar si hay un prestador seleccionado
  const hayPrestadorSeleccionado = !!prestadorSeleccionado;

  return (
   <div className="container-fluid px-2 px-md-4">
      <HeaderStaff/>
      <h1 className="w-50 w-md-75 fs-5 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mb-0">
        Editar prestador
      </h1>
    <div className="d-flex justify-content-center align-items-start mt-0">
      <div className="w-100 d-flex flex-column border shadow-input p-3  rounded-3 shadow ps-2 ps-md-5">
        <h6 className="fs-5 fs-md-5 h1-titulo fw-bold text-wrap">
          Visualización del prestador seleccionado. Gestioná su estado (habilitado/deshabilitado) y actualizá su
          nombre desde la sección inferior.
        </h6>
      </div>
    </div>

    <div className="d-flex justify-content-center align-items-start min-vh-75">
      <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow mt-4">
        {/*Seleccionar el prestador */}
        <div className="border m-1 rounded">
          {/**Select de Prestador */}
          <div className="form-group mb-4 w-50 w-md-50 mx-auto px-3">
            <label
              htmlFor="prestador"
              className="mt-3 fs-6 text-uppercase text-success-label"
            >
              Prestador:
            </label>
            <CustomSelect
              options={adaptarOpciones(prestadores)}
              value={formData.prestador}
              onChange={handleChange}
              name="prestador"
              placeholder="Seleccioná el prestador que querés editar"
              disabled={loadingPrestadores}
              loading={loadingPrestadores}
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
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className="align-middle">
                        {prestadorSeleccionado?.nombre || "Nombre del prestador seleccionado"}
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
              Modificar el estado del prestador.
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
                  Esta acción cambia la visibilidad del prestador. <br />
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
              disabled={!hayPrestadorSeleccionado}
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
                  disabled={!hayPrestadorSeleccionado}
                >
                  <option value="">Seleccionar acción...</option>
                  <option value="Activo">Habilitar</option>
                  <option value="Inactivo">Deshabilitar</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="d-flex justify-content-center mt-4">
          <button
            className="btn btn-search rounded-pill text-white text-center text-uppercase w-md-auto white-space-nowrap mx-3"
            type="submit"
            onClick={onSubmit}
            disabled={!hayPrestadorSeleccionado || !hayCambios}
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

export default EditarPrestadorPorNombre;