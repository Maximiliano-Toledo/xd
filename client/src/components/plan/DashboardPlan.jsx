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
import Card from './Card';

const DashboardPlan = () => {

    const navigate = useNavigate();
    const handleVolver = () => {
        navigate(-1);
    };

    /**Info de las cards de plan */
    const cardEditarPlan = {
    title: "Editar, habilitar o deshabilitar planes",
    link: "/editar-plan",
    description:
        "Seleccioná un plan para cambiar su nombre, modificar su visibilidad o volver a habilitar los que estén disponibles.",
     icon: GoPencil,
    };

    const cardCrearPlan = {
        title: "Nuevo plan",
        link: "/crear-plan",
        description:
            "Creá y agregá un plan nuevo para luego realizar la carga correspondiente.",
         icon: FaPlus,
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

             <button className='btn btn-volver rounded-pill text-white fw-bolder text-center text-uppercase m-4' type='submit' onClick={handleVolver}>            
                <MdSubdirectoryArrowLeft className='text-white' /> Volver
            </button>

             <div className="d-flex justify-content-center align-items-start min-vh-74">
                <div className="w-75 d-flex flex-column border mb-4 shadow-input border p-4 custom-height shadow rounded-3">
                    <h4 className='mb-4 subtitle-dashboard'>Configuración de planes</h4>
                        <Card {...cardEditarPlan} />

                    <h4 className='mb-4 subtitle-dashboard'>Crear un nuevo plan</h4>
                        <Card {...cardCrearPlan} />
                  </div>
            </div>

             <Footer/>
                           
        </div>
    );
}

export default DashboardPlan;
