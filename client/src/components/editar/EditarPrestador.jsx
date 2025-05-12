import React, { useEffect, useState } from 'react';
import { Footer } from '../../layouts/Footer';
import HeaderStaff from '../../layouts/HeaderStaff';
import { MdSubdirectoryArrowLeft } from 'react-icons/md';
import '../../styles/cargar-cartilla.css'
import { useNavigate } from 'react-router';
import { FaArrowTurnUp } from "react-icons/fa6";
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import CustomSelect from '../CustomSelect';
import { useAbmApi } from '../../hooks/useAbmApi';


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
                <h6 className="w-25 fs-4 text-center p-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 m-4">
                    Edición individual
                </h6>
                <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
                    <div className="w-100 d-flex flex-column border  shadow-input p-3 rounded-3 shadow ps-5">
                        <h1 className="fs-2 h1-titulo fw-bold ">
                            Verificá los datos actuales del prestador. Podés modificar la información en el formulario.

                        </h1>
                    </div>
                </div>

                <div className="d-flex justify-content-center align-items-start min-vh-100">
                    <div className="w-100 d-flex flex-column border shadow-input p-5 rounded-3 shadow mt-5">
                    
                    <form>
                        {/* Plan centrado arriba */}
                        <label htmlFor="plan" className="d-flex justify-content-center p-1 text-success-label fw-medium fs-5">Plan</label>
                        <div className="d-flex justify-content-center ">
                            <div className="w-25">
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


                        <div className="d-flex flex-column flex-md-row justify-content-between w-100 gap-4">
                            {/* Columna izquierda */}
                                <div className="w-100 w-md-50 m-5">

                                    <div className="form-group mb-5">
                                        <label htmlFor="provincia" className="p-1 text-success-label fw-medium fs-5">Provincia:</label>
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



                                    <div className="form-group mb-5 position-relative ">
                                            <label htmlFor="direccion" className="p-1 text-success-label fw-medium fs-5 ">
                                                Dirección:
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control p-2 mt-2 border border-success rounded"
                                                id="direccion" 
                                            />   
                                    </div>


                                    <div className="form-group mb-4 ">
                                        <label htmlFor="especialidad" className="text-success-label fw-medium fs-5 p-1">Especialidad:</label>
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





                            {/* Columna derecha */}
                            <div className="w-100 w-md-50 m-5">

                                    <div className="form-group mb-5 ">
                                        <label htmlFor="localidad" className="p-1 text-success-label fw-medium fs-5">Localidad:</label>
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
                                                    <label htmlFor="categoria" className="p-1 text-success-label fw-medium fs-5">
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

                                     <div className="form-group mb-4 position-relative ">
                                            <label htmlFor="nombre" className="p-1 text-success-label fw-medium fs-5">
                                            Nombre del prestador:
                                            </label>
                                            <input type="text"
                                            
                                            className="form-control p-2 mt-2 border border-success"
                                            id="nombre"
                                            />
               
                                     </div>

                            </div>

                        </div>
                      



                        {/**Botón de aceptar */}
                        <div className="d-flex justify-content-center">
                            <button className="btn btn-volver rounded-pill text-white text-center text-uppercase mt-2"
                                type="submit"
                                onClick={confirmarEdicion}>
                                <FaArrowTurnUp className="text-white pe-1" />
                                Aceptar
                            </button>
                        </div>

                    </form>


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
