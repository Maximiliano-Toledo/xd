import { MdSubdirectoryArrowLeft } from "react-icons/md";
import { useNavigate } from "react-router";
import HeaderStaff from "../../layouts/HeaderStaff";
import LiveAlert from "../utils/LiveAlert";
import { useEffect, useState } from "react";
import { useAbmApi } from "../../hooks/useAbmApi";
import CustomSelect from "../CustomSelect";
import { FaPlus } from "react-icons/fa6";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";

const EditarEspecialidad = () => {

  const navigate = useNavigate();
  const handleVolver = () => {
      navigate(-1);
  };

  const { handleSubmit } = useForm();

  const [isEnabled, setIsEnabled] = useState(true)
  const [especialidadName, setEspecialidadName] = useState("")
  const [formData, setFormData] = useState({especialidad: ""});
        
  // Hook para api especialidad
    const {
        data: especialidades,
        loading: loadingEspecialidades,
        getAll: getEspecialidades
    } = useAbmApi('especialidades');
    
  // Cargar datos al montar el componente
      useEffect(() => {
          getEspecialidades();
      }, []);
    
  // Adaptar opciones para CustomSelect
    const adaptarOpciones = (opciones, idKey, nombreKey) => {
        return opciones.map((opcion) => ({
              id: opcion[idKey],
              nombre: opcion[nombreKey],
              }));
    };
    
    const handleChange = (e) => {
      const { name, value } = e.target;
       setFormData((prev) => ({ ...prev, [name]: value }));        
    };


  //el mensaje de confirmar editar
  const confirmarEditar=()=>{
        Swal.fire({
            title: "¿Editar el nombre de la especialidad?",
            icon: "warning",
            color: "#64A70B",
            showCancelButton: true,
            cancelButtonText: 'Cancelar y volver',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#64A70B'
      }).then((result) => {
          if (result.isConfirmed) {       
            try {
              // Acá llamaria a la API para editar el nombre del plan
               Swal.fire({
                    title: 'Nombre editado correctamente',
                    icon: 'success',
                    color: "#64A70B",
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#64A70B'
                  });    
            } catch (error) {
                  console.error("Error al editar la especialidad:", error);
                  Swal.fire({
                  title: 'Error al editar la especialidad',
                  text: error.message || 'Ha ocurrido un error al intentar editar la especialidad.',
                  icon: 'error',
                  color: "#d33",
                  confirmButtonText: 'Aceptar',
                  confirmButtonColor: '#64A70B'
                  });
            } 
        }
      });
  }

  const onSubmit = handleSubmit(() => {
       confirmarEditar()      
   })

    return (
        <div>
              <HeaderStaff/>
                <h6 className="w-25 fs-4 text-center pb-2 rounded-top rounded-bottom fw-bold text-white p-container mb-0 ">
                    Editar especialidad
                </h6>
                <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
                    <div className="w-100 d-flex flex-column border  shadow-input p-3 rounded-3 shadow ps-5">
                        <h1 className="fs-2 h1-titulo fw-bold ">
                        Edita una especialidad disponible
                        </h1>
                    </div>
                </div>


                <div className="d-flex justify-content-center align-items-start min-vh-75">
                    <div className="w-100 d-flex flex-column border shadow-input p-5 rounded-3 shadow mt-5 ">

                    <form className="mb-4" onSubmit={onSubmit}>   
                             {/**Select de Especialidad */}      
                        <div className="form-group mb-4 w-50 mx-auto">
                             <label htmlFor="especialidad" className="p-1 fs-6 text-uppercase">
                                Especialidad:
                              </label>
                              <CustomSelect
                                options={adaptarOpciones(especialidades, "id_especialidad", "nombre")}
                                value={formData.especialidad}
                                onChange={handleChange}
                                name="especialidad"
                                placeholder="Buscar..."
                                disabled={loadingEspecialidades}
                                loading={loadingEspecialidades} /> 
                        </div>


                        <div className="container py-4">
                            <div className=" mb-4">
                              <div className="card-body p-0">
                                <div className="table-responsive">
                                  <table className="table table-bordered mb-0">
                                      <thead>
                                        <tr>
                                          <th className="text-center align-middle fs-6">Nombre</th>
                                          <th className="text-center align-middle fs-6">Estado</th>
                                          <th className="text-center fs-6">
                                            Habilitar
                                            <LiveAlert
                                                message={(
                                                  <span style={{ fontWeight: 'normal' }}>
                                                    Habilitar una especialidad:
                                                    Esta acción reactiva la visibilidad del
                                                    especialidad.
                                                    La especialidad volverá a estar disponible para
                                                    los afiliados y podrá utilizarse
                                                    nuevamente.
                                                    Asegurate de que los datos estén
                                                    actualizados antes de habilitarlo.
                                                  </span>
                                                )}
                                              />
                                            
                                          </th>
                                          <th className="text-center fs-6">
                                              Deshabilitar
                                              <LiveAlert
                                                message={(
                                                  <span style={{ fontWeight: 'normal' }}>
                                                    Deshabilitar una especialidad:
                                                    Esta acción oculta la especialidad
                                                    seleccionado para los afiliados.
                                                    La especialidad no será visible ni estará
                                                    disponible para su uso, pero se
                                                    conservará en el sistema por si necesita
                                                    volver a habilitarlo más adelante.
                                                    No se elimina ningún dato. Solo cambia
                                                    el estado de visibilidad.
                                                  </span>
                                                )}
                                              />
                                            </th>

                                        </tr>
                                      </thead>

                                    <tbody>
                                      <tr>
                                        <td className="align-middle">Acá Iria el nombre seleccionado</td>
                                        <td className="text-center align-middle">Su estado</td>
                                        <td className="text-center align-middle">
                                          <div className="form-check d-flex justify-content-center" onClick={() => setIsEnabled(true)}>
                                            <input
                                              type="checkbox"
                                              className="form-check-input"
                                              checked={isEnabled}
                                              onChange={() => {}}
                                              style={{ backgroundColor: isEnabled ? "#3c6e29" : "", borderColor: isEnabled ? "#3c6e29" : "" }}
                                            />
                                          </div>
                                        </td>
                                        <td className="text-center align-middle">
                                          <div className="form-check d-flex justify-content-center" onClick={() => setIsEnabled(false)}>
                                            <input
                                              type="checkbox"
                                              className="form-check-input"
                                              checked={!isEnabled}
                                              onChange={() => {}}
                                              style={{
                                                backgroundColor: !isEnabled ? "#3c6e29" : "",
                                                borderColor: !isEnabled ? "#3c6e29" : "",
                                              }}
                                            />
                                          </div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>

                                
                            <div className="card-body mb-4">
                              <p className="fw-bold fs-5 h1-titulo text-start">Modificar el nombre de la especialidad.</p>
                            </div>
                                

                              
                            <div className="card-body">
                                <h2 className="text-center mb-4" style={{ color: "#3c6e29" }}>
                                    EDICIÓN NOMBRE DE LA ESPECIALIDAD
                                </h2>
                                  <div className="row justify-content-center">
                                      <div className="col-md-8">
                                        <input
                                          type="text"
                                          className="form-control p-3"
                                          placeholder="Ingresá el nombre de la especialidad"
                                          value={especialidadName}
                                          onChange={(e) => setEspecialidadName(e.target.value)}
                                        />
                                      </div>
                                  </div>
                            </div>
                              
                        </div>
                        
                         <div className="d-flex justify-content-center mt-4">
                            <button className="btn btn-volver rounded-pill text-white text-center text-uppercase w-md-auto white-space-nowrap"
                                     type="submit">
                                   Editar nombre
                            </button>
                         </div>

                    </form> 
                        
 
                        <button className='btn btn-volver rounded-pill text-white text-center text-uppercase ' 
                                type='submit' onClick={handleVolver}>            
                        <MdSubdirectoryArrowLeft className='text-white' /> Volver
                        </button>  

                    </div>
                </div>

            

            
            
                            
        </div>
    );
}

export default EditarEspecialidad;
