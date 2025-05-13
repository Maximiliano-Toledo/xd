import React, { useEffect, useState } from 'react';
import { Footer } from '../../layouts/Footer';
import HeaderStaff from '../../layouts/HeaderStaff';
import { MdSubdirectoryArrowLeft } from 'react-icons/md';
import '../../styles/cargar-cartilla.css'
import '../../styles/dashboard.css'
import { useNavigate } from 'react-router';
import { FaArrowTurnUp } from "react-icons/fa6";
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import CustomSelect from '../CustomSelect';
import { useAbmApi } from '../../hooks/useAbmApi';
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import LiveAlert from '../utils/LiveAlert';


const EditarPrestador = () => {

    //boton volver
    const navigate = useNavigate();
    const handleVolver = () => {
      navigate(-1);
    };

      //react-hook-form
    const { setValue,  } = useForm({
        mode: "onChange",
    });

    //esto para reusar el cutomselect
     const adaptarOpciones = (opciones, idKey, nombreKey) => {
        return opciones.map((opcion) => ({
        id: opcion[idKey],
        nombre: opcion[nombreKey],
        }));
    };

   const [formData, setFormData] = useState({
      plan: "",
      categoria: "",
      especialidad: "",
      provincia: "",
      localidad: "" 
    });



// Hooks para traerme cada entidad
    const {
        data: planes,
        loading: loadingPlanes,
        getAll: getPlanes
    } = useAbmApi('planes');

    const {
        data: provincias,
        loading: loadingProvincias,
        getAll: getProvincias
    } = useAbmApi('provincias');

    const {
        data: localidades,
        loading: loadingLocalidades,
        getLocalidadesByProvincia
   } = useAbmApi('localidades');

   const {
        data: especialidades,
        loading: loadingEspecialidades,
        getAll: getEspecialidades
   } = useAbmApi('especialidades');

   const {
        data: categorias,
        loading: loadingCategorias,
        getAll: getCategorias
   } = useAbmApi('categorias');


// Cargar localidades cuando se selecciona una provincia
  useEffect(() => {
    if (formData.provincia) {
      getLocalidadesByProvincia(formData.provincia);
    }
  }, [formData.provincia]);


  // Cargar datos al montar el componente
    useEffect(() => {
      getPlanes();
      getCategorias();
      getEspecialidades();
      getProvincias();
    }, []);
    

    const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValue(name, value); // Actualiza react-hook-form
    
    // Limpiar el valor de localidad cuando cambia la provincia
    if (name === 'provincia') {
      setFormData((prev) => ({ ...prev, localidad: "" }));
      setValue('localidad', "");
    }
  };

  
    //mensaje de confirmar
    const confirmarEdicion=()=>{
          Swal.fire({
            title: "¿Confirmás la edición?",
            text: "Una vez confirmado, no podrás editar esta información desde aquí",
            icon: "warning",
            color: "#64A70B",
            showCancelButton: true,
            cancelButtonText: 'Cancelar y volver',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#64A70B'
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: 'Cartilla editada correctamente',
                icon: 'success',
                color: "#64A70B",
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#64A70B'
              });
            }
          });
    }


    return (
        <div>
            <HeaderStaff/>
                <h1 className="w-25 fs-4 text-center p-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 m-4">
                    Edición individual
                </h1>
                <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
                    <div className="w-100 d-flex flex-column border  shadow-input p-3 rounded-3 shadow ps-5">
                        <h6 className="fs-2 h1-titulo fw-bold ">
                            Verificá los datos actuales del prestador. Podés modificar la información en el formulario.

                        </h6>
                    </div>
                </div>

                <div className="d-flex justify-content-center align-items-start min-vh-100">
                    <div className="w-100 d-flex flex-column border shadow-input p-5 rounded-3 shadow mt-5 mb-3">
                    {/*---------------- Busquedas de arriba ----------------------*/}
                    <div>
                        {/* Plan centrado arriba */}
                        <label htmlFor="plan" className="d-flex justify-content-center p-1 text-success-label fw-medium fs-6">Plan</label>
                        <div className="d-flex justify-content-center ">
                            <div className="w-50">
                                <CustomSelect 
                                    options={adaptarOpciones(planes, "id_plan", "nombre")}
                                    value={formData.plan}
                                    onChange={handleChange}
                                    name="plan"
                                    placeholder={loadingPlanes ? "Cargando planes..." : "Seleccione un plan"}
                                    disabled={loadingPlanes}
                                    loading={loadingPlanes}
                                    className='border border-success rounded'
                                />
                            </div>
                        </div>


                        <div className="d-flex flex-column flex-md-row justify-content-between w-100 gap-4 mb-0">
                            {/* Columna izquierda */}
                            <div className="w-100 w-md-50 m-5">
                                <div className="form-group mb-5">
                                    <label htmlFor="provincia" className="p-1 text-success-label fw-medium fs-6">Provincia:</label>
                                        <CustomSelect
                                            options={adaptarOpciones(provincias, "id_provincia", "nombre")}
                                            value={formData.provincia}
                                            onChange={handleChange}
                                            name="provincia"
                                            placeholder={loadingProvincias ? "Cargando provincias..." : "Seleccione una provincia"}
                                            disabled={loadingProvincias}
                                            loading={loadingProvincias}
                                            className='border border-success rounded'
                                        />
                                </div>

                                <div className="form-group position-relative ">
                                    <label htmlFor="categoria" className="p-1 text-success-label fw-medium fs-6">
                                        Categoría:
                                    </label>
                                    <CustomSelect
                                                options={adaptarOpciones(categorias, "id_categoria", "nombre")}
                                                value={formData.categoria}
                                                onChange={handleChange}
                                                name="categoria"
                                                placeholder={loadingCategorias ? "Cargando categorías..." : "Seleccione una categoría"}
                                                disabled={loadingCategorias}
                                                loading={loadingCategorias}
                                                className='border border-success rounded'
                                    />
                                </div>
                            </div>

                            {/* Columna derecha */}
                            <div className="w-100 w-md-50 m-5">
                                 <div className="form-group mb-5 ">
                                    <label htmlFor="localidad" className="p-1 text-success-label fw-medium fs-6">Localidad:</label>
                                        <CustomSelect
                                            options={adaptarOpciones(localidades, "id_localidad", "nombre")}
                                            value={formData.localidad}
                                            onChange={handleChange}
                                            name="localidad"
                                            placeholder={loadingLocalidades ? "Cargando localidades..." : "Seleccione una localidad"}
                                            disabled={loadingLocalidades || !formData.provincia}
                                            loading={loadingLocalidades}
                                            className='border border-success rounded'
                                            />
                                                        
                                  </div>

                                 <div className="form-group mb-5 ">
                                    <label htmlFor="nombre" className="p-1 text-success-label fw-medium fs-6">
                                        Nombre del prestador:
                                    </label> 
                                    
                                    
              
                                 </div>
                            </div>
                        </div>

                     {/* Especialidad centrado abajo */}
                       <div className="d-flex justify-content-center mt-0 mb-5">
                            <div className="w-50">
                            <label htmlFor="especialidad" className="text-success-label fw-medium fs-6 p-1">Especialidad:</label>
                                <CustomSelect
                                            options={adaptarOpciones(especialidades, "id_especialidad", "nombre")}
                                            value={formData.especialidad}
                                            onChange={handleChange}
                                            name="especialidad"
                                            placeholder={loadingEspecialidades ? "Cargando especialidades..." : "Seleccione una especialidad"}
                                            disabled={loadingEspecialidades}
                                            loading={loadingEspecialidades}
                                            className='border border-success rounded'
                                />
                            </div>
                                            
                        </div>

                        {/**Botón de aceptar */}
                        <div className="d-flex justify-content-center">
                            <button className="btn btn-volver rounded-pill text-white text-center text-uppercase mt-2"
                                type="submit"
                               >
                                <FaArrowTurnUp className="text-white pe-1" />
                                Aceptar
                            </button>
                        </div>
                    </div>


                     {/*----------------Resultados para editar ---------------------*/}
                    <div>            
                        {/*la tabla */}
                        <div className="row mb-4 mt-4">
                            <div className="col-12">
                            <div className="table-responsive">
                                <table className="table table-bordered shadow">
                                {/*Titulos de cada columna */}
                                <thead>
                                    <tr>
                                    <th className="text-center fw-medium letter-color bg-color-icon">
                                        Plan
                                    </th>
                                    <th className="text-center fw-medium letter-color bg-color-icon">
                                        Categoría del prestador
                                    </th>
                                    <th className="text-center fw-medium letter-color bg-color-icon">
                                        Especialidades
                                    </th>
                                    <th className="text-center fw-medium letter-color bg-color-icon">
                                    Provincia
                                    </th>
                                    <th className="text-center fw-medium letter-color bg-color-icon">
                                        Localidad
                                    </th>
                                    <th className="text-center fw-medium letter-color bg-color-icon">
                                        Nombre del prestador
                                    </th>
                                    <th className="text-center fw-medium letter-color bg-color-icon">
                                        Dirección
                                    </th>
                                    <th className="text-center fw-medium letter-color bg-color-icon">
                                        Teléfono
                                    </th>
                                    <th className="text-center fw-medium letter-color bg-color-icon">
                                        Mail
                                    </th>
                                    <th className="text-center fw-medium letter-color bg-color-icon">
                                        Informacíon adicional
                                    </th>
                                    <th className="text-center fw-medium letter-color bg-color-icon">
                                        Estado
                                    </th>
                                    </tr>
                                </thead>

                                {/*Información */}
                                <tbody>
                                    <tr>
                                    <td>Acá va el plan</td>
                                    <td>Categoria</td>
                                    <td>Especialidad</td>
                                    <td>Provincia</td>
                                    <td>Localidad</td>
                                    <td>Nombre del prestador</td>
                                    <td>Dirección</td>
                                    <td>Telefono</td>
                                    <td>e-mail</td>
                                    <td>Info adicional</td>
                                    <td>Estado</td>
                                    </tr>
                                </tbody>
                                </table>
                            </div>
                            </div>
                        </div>

                         <div className="d-flex flex-column flex-md-row justify-content-between w-100 gap-4 mb-0">
                            {/* Columna izquierda */}
                            <div className="w-100 w-md-50 m-5">
                                  <div className="form-group mb-5">
                                     
                                    <label htmlFor="direccion" className="text-success-label fw-bold fs-6 ">
                                        Dirección:
                                    </label>
                                    
                                    <input
                                        type="text"
                                        className="form-control p-2"
                                        id="direccion"
                                        placeholder="Ingrese una dirección (Calle, Altura)"
                                    />

                                  </div>

                                  <div className="form-group  position-relative">
                                        <label htmlFor="email" className="text-success-label fw-bold fs-6">
                                            E-mail:
                                        </label>
                                        <input
                                            className="form-control p-2"
                                            id="email"
                                            placeholder="ejemplo@correo.com"
                                        />
                                  </div>

                            </div>

                            {/**Columna derecha */}
                             <div className="w-100 w-md-50 m-5">

                                <div className="form-group mb-5 position-relative">
                                    <label htmlFor="telefono" className="text-success-label fw-bold fs-6">
                                        Teléfono:
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control p-2"
                                        id="telefono"
                                        placeholder="Ingrese el número de teléfono (ej: 011 12345678)"
                                    />
                                </div>



                                 <div className="form-group ">
                                    <label htmlFor="informacion" className="text-success-label fw-bold fs-6">
                                        Información adicional:
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control p-2"
                                        id="informacion"
                                        placeholder="Observaciones"
                                    />
                                </div>

                             </div>
                         </div>

                          {/* Estado centrado abajo */}
                           <div className="d-flex justify-content-center mt-0 mb-5">
                                <div className="w-50">
                                 <LiveAlert message="Permite habilitar o deshabilitar al prestador.
                                            Solo modificá el estado si es necesario. Si el prestador mantiene su estado
                                            actual, no realices cambios. Podés
                                            verificar el estado vigente en la
                                            parte superior." />
                                <label htmlFor="especialidad" className="text-success-label fw-medium fs-6 p-1">Estado:</label>
                                
                               <div class="custom-select-container">
                                        <select class="form-select custom-select border border-success rounded" id="estado">
                                            <option value="deshabilitar" selected>Deshabilitar</option>
                                            <option value="habilitar">Habilitar</option>
                                        </select>
                                </div>
                                        


                                </div>
                            </div>



                          {/**Botón de Editar */}
                        <div className="d-flex justify-content-center">
                            <button className="btn btn-volver rounded-pill text-white text-center text-uppercase mt-2"
                                type="submit"
                                onClick={confirmarEdicion}>
                                <IoIosCheckmarkCircleOutline className="text-white pe-1 fs-3" />
                                Editar
                                
                            </button>
                        </div>

                    </div>
                    

                   </div>
               </div>

            <button className='btn btn-volver rounded-pill text-white text-center text-uppercase mt-2' 
                            type='submit'
                            onClick={handleVolver}>            
                            <MdSubdirectoryArrowLeft className='text-white pe-1 arrow-style'/> 
                                 Volver
            </button>

            <Footer/>
        </div>
    );
}

export default EditarPrestador;
