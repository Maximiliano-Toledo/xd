import HeaderStaff from '../../layouts/HeaderStaff';
import { Footer } from '../../layouts/Footer';
import { FaRegArrowAltCircleRight } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router';
import { FaPlus } from 'react-icons/fa6';
import { MdSubdirectoryArrowLeft } from 'react-icons/md';
import { GoPencil } from 'react-icons/go';
import Card from '../plan/Card';

const EspecialidadDashboard = () => {

    const navigate = useNavigate();
    const handleVolver = () => {
        navigate(-1);
    };

    const cardEditarEspecialidad = {
    title: "Editar, habilitar o deshabilitar especialidades",
    link: "/editar-especialidad",
    description:
        "Seleccioná una especialidad para cambiar su nombre, modificar su visibilidad o volver a habilitar los que estén disponibles.",
     icon: GoPencil,
    };

    const cardCrearEspecialidad = {
        title: "Nueva especialidad",
        link: "/crear-especialidad",
        description:
            "Creá y agregá una especialidad para luego realizar la carga correspondiente.",
        icon: FaPlus,
    };


    return (
        <div>
           <HeaderStaff />
             <h1 className=" w-25 fs-4 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 m-4 ">
                Gestión de especialidades
             </h1>
            <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
                <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5 ms-4 me-4 ">
                    <h6 className="fs-2 h1-titulo fw-bold ">Agregá, modificá o eliminá las especialidades disponibles</h6>
                </div>
            </div>

           <button className='btn btn-volver rounded-pill text-white text-center fw-bolder text-uppercase m-4' type='submit' onClick={handleVolver}>            
                <MdSubdirectoryArrowLeft className='text-white' /> Volver
            </button>
               
           <div className="d-flex justify-content-center align-items-start min-vh-75">
                <div className="w-75 d-flex flex-column border mb-4 shadow-input p-4 custom-height shadow rounded-3">
                    
                    <h4 className='mb-4 subtitle-dashboard'>Configuración de especialidades</h4>

                    <Card {...cardEditarEspecialidad} />

                    <h4 className='mb-4 subtitle-dashboard'>Crear una nueva especialidad</h4>
                     <Card {...cardCrearEspecialidad} />
                   
                </div>
            </div>

                
            <Footer/>
        </div>
    );
}

export default EspecialidadDashboard;
