import React from 'react';
import { Footer } from '../../layouts/Footer';
import HeaderStaff from '../../layouts/HeaderStaff';
import { MdSubdirectoryArrowLeft } from 'react-icons/md';
import '../../styles/cargar-cartilla.css'
import { useNavigate } from 'react-router';
import { FaArrowTurnUp } from "react-icons/fa6";
import Swal from 'sweetalert2';

const EditarPrestador = () => {

    const navigate = useNavigate();

    const handleVolver = () => {
      navigate(-1);
    };
  
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
                <h6 className="w-25 fs-4 text-center p-2 rounded-top rounded-bottom fw-bold text-white p-container mb-0 mb-0 m-4">
                    Edición individual
                </h6>
                <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
                    <div className="w-100 d-flex flex-column border  shadow-input p-3 rounded-3 shadow ps-5">
                        <h1 className="fs-2 h1-titulo fw-bold ">
                        Seleccioná el prestador para editar su información.
                        </h1>
                    </div>
                </div>

                <div className="d-flex justify-content-center align-items-start min-vh-100">
                    <div className="w-100 d-flex flex-column border shadow-input p-5 rounded-3 shadow mt-5 ">

                        <label htmlFor="plan" className="d-flex justify-content-center p-1 text-success-label fw-medium">Plan</label>
                        <div className="d-flex justify-content-center">
                            <select className="form-select w-25 border border-success mb-5" aria-label="Default select example">  
                                <option value="1">Seleccione un plan</option>
                            </select>
                         </div>

                        <div className="container">
                        <div className="row mb-5">
                            <div className="col-md-4">
                            <label htmlFor="nombre" className=" text-success-label fw-medium">Categoría del prestador</label>
                                <select className="form-select border border-success" aria-label="Default select example">
                                    <option selected>Seleccione una categoría</option>
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label htmlFor="nombre" className=" text-success-label fw-medium">Especialidad</label>
                                <select className="form-select border border-success" aria-label="Default select example">
                                    <option selected>Seleccione una especialidad</option>
                                </select>
                            </div>

                            <div className="col-md-4">
                                <div className="mb-3">
                                    <label htmlFor="nombre" className=" text-success-label fw-medium">Nombre del prestador</label>
                                    <input type="text" className="form-control border border-success" id="nombre"
                                            placeholder='Ingresá el nombre del prestador' />
                                </div>
                            </div>
                        </div>

                        <div className="row mb-5">
                            <div className="col-md-4">
                            <label htmlFor="provincia" className="text-success-label fw-medium">Provincia</label>
                                <select className="form-select border border-success" aria-label="Default select example">
                                    <option selected>Buenos Aires</option>
                                    
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label htmlFor="localidad" className="text-success-label fw-medium">Localidad</label>
                                <select className="form-select border border-success" aria-label="Default select example">
                                    <option selected>Seleccione una localidad</option>
                                    
                                </select>
                            </div>

                            <div className="col-md-4">
                                <div className="mb-3">
                                    <label htmlFor="direccion" className="text-success-label fw-medium">Dirección</label>
                                    <input type="text" className="form-control border border-success" id="direccion"
                                             />
                                </div>
                            </div>
                        </div>

                        <div className="row mb-5">
                            <div className="col-md-4">
                                <div className="mb-3 ">
                                    <label htmlFor="email1" className="text-success-label fw-medium">Email</label>
                                    <input type="email" class="form-control border border-success" id="email1" 
                                        placeholder="Escribí el correo electrónico" />
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="mb-3">
                                    <label htmlFor="tel" className="text-success-label fw-medium">Teléfono</label>
                                    <input type="text" className="form-control border border-success" id="tel"
                                        placeholder='Indicá el núm con código de área (Ej: 341 4567890)' />
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="mb-3">
                                    <label htmlFor="info-adicional" className="text-success-label fw-medium">Información adicional</label>
                                    <input type="text" className="form-control border border-success" id="email2" />
                                </div>
                            </div>
                        </div>
                        </div>

                    <div className="d-flex justify-content-center">
                        <button className="btn btn-volver rounded-pill text-white text-center text-uppercase mt-2"
                            type="submit"
                            onClick={confirmarEdicion}>
                            <FaArrowTurnUp className="text-white pe-1" />
                            Editar
                        </button>
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
