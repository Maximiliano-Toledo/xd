import React from 'react';
import HeaderStaff from '../../layouts/HeaderStaff';
import { Footer } from '../../layouts/Footer';
import { MdSubdirectoryArrowLeft } from 'react-icons/md';
import { Link, useNavigate } from 'react-router';
import "../../styles/cargar-cartilla.css";
import '../../styles/dashboard.css'
import { GoPencil } from "react-icons/go";
import { FaPlus } from "react-icons/fa6";
import { AiOutlineDelete } from "react-icons/ai";
import { FaRegArrowAltCircleRight } from 'react-icons/fa';

const DashboardPlan = () => {

    const navigate = useNavigate();
    const handleVolver = () => {
        navigate(-1);
    };

    return (
        <div>
             <HeaderStaff />
             <h6 className=" w-25 fs-4 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 m-4 ">
                Gestión de planes
             </h6>
            <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
                <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5 ms-4 me-4 ">
                    <h1 className="fs-2 h1-titulo fw-bold ">Agregá, modificá o eliminá los planes disponibles</h1>
                </div>
            </div>

             <button className='btn btn-volver rounded-pill text-white fw-bolder text-center text-uppercase m-4 ' type='submit' onClick={handleVolver}>            
                <MdSubdirectoryArrowLeft className='text-white' /> Volver
            </button>

             <div className="d-flex justify-content-center align-items-start min-vh-74">
                <div className="w-75 d-flex flex-column border mb-4 shadow-input border p-4 custom-height shadow rounded-3">
                    
                    <h4 className='mb-4 subtitle-dashboard'>Configuración de planes</h4>

                <div className="w-75 mx-auto border rounded p-3 shadow mb-5 ">
                    <h6 className='fw-bold fs-5 text-center subtitle-dashboard'>
                        Editar, habilitar o deshabilitar planes
                    </h6>
                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center ms-md-5 mt-3 mt-md-0">
                        <div className='bg-color-icon p-2 rounded me-md-2 mb-2 mb-md-0'
                                style={{
                                position: "relative",
                                top: "-18px",
                                marginLeft: "-14px"
                                }}>
                            <GoPencil className='icon-size subtitle-dashboard ms-1' />
                        </div>

                        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center">
                            <p className="text-center text-md-start p-color mb-2 mb-md-0 ps-4">
                                Seleccioná un plan para cambiar su nombre, modificar su visibilidad o volver a habilitar los que estén disponibles.
                            </p>

                            <Link to="/editar-plan" 
                                className="ms-md-4 mt-2 mt-md-0 text-uppercase text-decoration-none border fw-bold link-card-2"> 
                                Ir <FaRegArrowAltCircleRight />
                            </Link>
                        </div>
                    </div>
                </div>


                <h4 className='mb-4 subtitle-dashboard'>Crear un nuevo plan</h4>

                <div className="w-75 mx-auto border rounded p-3 shadow mb-5">
                    <h6 className='fw-bold fs-5 text-center subtitle-dashboard'>Plan Nuevo</h6>
                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center ms-md-5 mt-3 mt-md-0">
                    <div className='bg-color-icon p-2 rounded me-md-2 mb-2 mb-md-0'
                            style={{
                                position: "relative",
                                top: "-18px",
                                marginLeft: "-14px"
                            }}> 

                        <FaPlus className='icon-size subtitle-dashboard ms-1' />
                    </div>

                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center">
                        <p className="text-center text-md-start p-color mb-2 mb-md-0 ps-4 ">
                            Creá y agregá un plan nuevo para luego realizar la carga correspondiente</p>
                        <Link to="/crear-plan" className="ms-4 text-uppercase text-decoration-none border fw-bold link-card-2 ">
                              Ir <FaRegArrowAltCircleRight />
                        </Link>
                        </div>
                    </div>
                </div>
                </div>
            </div>



           
             <Footer/>
                           
        </div>
    );
}

export default DashboardPlan;
