import { MdOutlineKeyboardDoubleArrowRight, MdSubdirectoryArrowLeft } from 'react-icons/md';
import HeaderStaff from '../../layouts/HeaderStaff';
import '../../styles/panel-usuario.css'
import { useNavigate } from 'react-router';

const Historial = () => {

    const navigate = useNavigate();
    const handleVolver = () => {
        navigate(-1);
    };

    return (
        <div>
            <HeaderStaff />
            <h1 className=" w-25 fs-3 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 m-4 ">
                Panel usuario
            </h1>
            <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
                <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5 ms-4 me-4 ">
                    <h6 className="fs-2 h1-titulo fw-bold border p-2 d-flex align-items-center">
                        <div className='rounded-color d-flex justify-content-center align-items-center me-4'>
                            <MdOutlineKeyboardDoubleArrowRight className="fs-1 text-white  " />
                        </div>
                        Historial actividad
                    </h6>
                    <h2 className="fs-2 h1-titulo p-2 fw-normal">
                        Visualizá las últimas acciones realizadas en el sistema.
                    </h2>
                </div>
            </div>

            <div className="d-flex justify-content-center align-items-start min-vh-75">
                <div className="w-100 d-flex flex-column border  shadow-input p-3 rounded-3 shadow m-4">
                    <div className="border m-3  p-3 rounded-3 shadow">
                        <div className="card-body ms-5">


                            <div className="mb-4">
                                <h5 className="title-style fs-3 mb-0 mt-1">Fecha:</h5>
                                <p className="dato-style mb-0 fs-5">Ingresar fecha</p>
                            </div>

                            <div className="mb-4">
                                <h5 className="title-style fs-6 mb-0 mt-1 text-uppercase fw-normal">Acción:</h5>
                                <p className="dato-style mb-0 fs-5 text-uppercase">Carga individual</p>
                            </div>

                            <div className="mb-4">
                                <h5 className="title-style fs-6 mb-0 mt-1 text-uppercase fw-normal">Descripción:</h5>
                                <p className="dato-style mb-0 fs-5 text-uppercase">descripción</p>
                            </div>
                            <div className="mb-2">
                                <h5 className="title-style fs-6 mb-0 mt-1 text-uppercase fw-normal">Usuario/user:</h5>
                                <p className="dato-style mb-0 fs-5 text-uppercase">ingresar usuario</p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            <button className='btn btn-volver rounded-pill text-white text-center text-uppercase'
                type='submit' onClick={handleVolver}>
                <MdSubdirectoryArrowLeft className='text-white' /> Volver
            </button>

        </div>
    );
}

export default Historial;