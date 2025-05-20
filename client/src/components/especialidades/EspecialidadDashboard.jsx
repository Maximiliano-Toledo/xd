import HeaderStaff from '../../layouts/HeaderStaff';
import { Footer } from '../../layouts/Footer';
import { FaRegArrowAltCircleRight } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router';
import { FaPlus } from 'react-icons/fa6';
import { MdSubdirectoryArrowLeft } from 'react-icons/md';
import { GoPencil } from 'react-icons/go';
import Card from '../plan/Card';
import '../../styles/panel-usuario-nuevo.css'

const EspecialidadDashboard = () => {

    const navigate = useNavigate();
    const handleVolver = () => {
        navigate(-1);
    };

    const cardEditarEspecialidad = {
    title: "Editar, habilitar o deshabilitar especialidad",
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
             <h1 className="w-50 fs-6 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 m-4">
                Gestión de especialidades
             </h1>
            <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
                <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5 ms-4 me-4 ">
                    <h6 className="fs-3 h1-titulo fw-bold ">Agregá, modificá o eliminá las especialidades disponibles</h6>
                </div>
            </div>

               
           <div className="d-flex justify-content-center align-items-start min-vh-75 mt-5">
                <div className="w-75 d-flex flex-column border mb-4 shadow-input p-4 custom-height shadow rounded-3">
                    
                    <h4 className='mb-4 subtitle-dashboard'>Configuración de especialidades</h4>

                    <Card {...cardEditarEspecialidad} />

                    <h4 className='mb-4 subtitle-dashboard'>Crear una nueva especialidad</h4>
                     <Card {...cardCrearEspecialidad} />
                   
                </div>
            </div>

                 <div className="back-button-container">
                    <button className="back-button" onClick={handleVolver}>
                        <MdSubdirectoryArrowLeft />
                        <span>Volver</span>
                    </button>
                </div>
                
            <Footer/>
        </div>
    );
}

export default EspecialidadDashboard;
