import HeaderStaff from '../../layouts/HeaderStaff';
import { MdSubdirectoryArrowLeft } from 'react-icons/md';
import { useNavigate } from 'react-router';
import CustomSelect from '../CustomSelect';
import { useAbmApi } from '../../hooks/useAbmApi';
import { useEffect, useState } from 'react';
import LiveAlert from '../utils/LiveAlert';

const EditarPlan = () => {

  //volver atrás
    const navigate = useNavigate();
    const handleVolver = () => {
        navigate(-1);
    };


    const [formData, setFormData] = useState({plan: ""});
    
    // Hook para api plan
    const {
      data: planes,
      loading: loadingPlanes,
      getAll: getPlanes
    } = useAbmApi('planes');

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

   const handleChange = (selectedOption) => {
  setFormData((prevData) => ({
    ...prevData,
    plan: selectedOption.value, // si `value` es el id del plan
  }));
};

//esto para habilitar / deshabilitar
  const [isEnabled, setIsEnabled] = useState(true)
  const [planName, setPlanName] = useState("")



    return (
        <div>
            <HeaderStaff/>
                <h6 className="w-25 fs-4 text-center pb-2 rounded-top rounded-bottom fw-bold text-white p-container mb-0 ">
                    Editar plan
                </h6>
                <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
                    <div className="w-100 d-flex flex-column border  shadow-input p-3 rounded-3 shadow ps-5">
                        <h1 className="fs-4 h1-titulo fw-bold ">
                        Seleccioná un plan para cambiar su nombre, modificar su visibilidad o volver a habilitar los que
                        estén disponibles.
                        </h1>
                    </div>
                </div>

             <div className="d-flex justify-content-center align-items-start min-vh-75">
                <div className="w-100 d-flex flex-column border shadow-input p-5 rounded-3 shadow mt-5 ">

                  <form className="mb-4">
                    {/**Select de Plan */}      
                      <div className="form-group mb-4 w-50 mx-auto">
                        <label htmlFor="plan" className="p-1 fs-6 text-uppercase">
                          Plan:
                        </label>
                          <CustomSelect
                             options={adaptarOpciones(planes, "id_plan", "nombre")}
                              value={formData.plan}
                              onChange={handleChange}
                              name="plan"
                              placeholder="Buscar..."
                              disabled={loadingPlanes}
                              loading={loadingPlanes} /> 
                      </div>


                       {/**Tabla */}  
                      <div className="container py-4">
                          <div className=" mb-4">
                            <div className="card-body p-0">
                              <div className="table-responsive">
                                <table className="table table-bordered mb-0">
                                    <thead>
                                      <tr>
                                        <th className="text-center align-middle fs-6">Nombre</th>
                                        <th className="text-center align-middle fs-6">Estado</th>
                                        <th className="text-center">
                                          Habilitar
                                          <LiveAlert message={(
                                                <span style={{ fontWeight: 'normal' }}>
                                                  Habilitar un plan:
                                                  Esta acción reactiva la visibilidad del
                                                  plan.
                                                  El plan volverá a estar disponible para
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
                                                  Deshabilitar un plan:
                                                  Esta acción oculta el plan
                                                  seleccionado para los afiliados.
                                                  El plan no será visible ni estará
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


                         {/*Modificar el nombre */}   
                          <div className="card-body mb-4">
                            <p className="fw-bold fs-5 h1-titulo text-start">Modificar el nombre del Plan.</p>
                          </div>     
                          <div className="card-body">
                              <h2 className="text-center mb-4" style={{ color: "#3c6e29" }}>
                                  EDICIÓN NOMBRE DEL PLAN
                              </h2>
                              <div className="row justify-content-center">
                                  <div className="col-md-8">
                                    <input
                                        type="text"
                                        className="form-control p-3"
                                        placeholder="Ingresá el nombre del plan"
                                        value={planName}
                                        onChange={(e) => setPlanName(e.target.value)}
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
                       
                <button className='btn btn-volver rounded-pill text-white text-center text-uppercase ' type='submit' onClick={handleVolver}>            
                <MdSubdirectoryArrowLeft className='text-white' /> Volver
                </button>  

                </div>
             </div>

           

          
        </div>
    );
}

export default EditarPlan;
