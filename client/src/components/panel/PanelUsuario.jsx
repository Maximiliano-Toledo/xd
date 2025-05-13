import { MdSubdirectoryArrowLeft } from "react-icons/md";
import { Footer } from "../../layouts/Footer";
import HeaderStaff from "../../layouts/HeaderStaff";
import { Link, useNavigate } from "react-router";
import { LuCircleUser } from "react-icons/lu";
import '../../styles/panel-usuario.css'
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";

const PanelUsuario = () => {

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
                    <h6 className="fs-2 h1-titulo fw-bold">Desde aquí podés modificar tu Usuario y revisar las últimas acciones realizadas.</h6>
                </div>
            </div>

            <div className="d-flex justify-content-center align-items-start min-vh-75">
                <div className="w-100 d-flex flex-column border  shadow-input p-3 rounded-3 shadow m-4">

                    <div className="d-flex flex-column flex-md-row gap-5 justify-content-center m-4">
                        <div className="border m-3 p-3 rounded-3 shadow" style={{ width: '25rem', height: '15rem' }} >
                            <div className="card-body">
                                <h6 className="subtitle-style fs-5 mb-3">Mi perfil</h6>
                                <div className="d-flex align-items-start mb-2">
                                    <LuCircleUser className="me-2 user-style" />
                                    <div className="ms-1">
                                        <h5 className="title-style fs-4 mb-0 mt-1">Usuario:</h5>
                                        <p className="mb-0 fs-5">Acá va el nombre de usuario</p>
                                    </div>
                                </div>
                            </div>
                        </div>



                        <div className="border m-4 p-3 rounded-3 shadow" style={{ width: '29rem' }}>
                            <div className="card-body">
                                <h5 className="title-style fs-3">Centro de control</h5>

                                <div className="border rounded p-3 shadow m-2 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <div className='rounded-color d-flex justify-content-center align-items-center me-4'>
                                            <MdOutlineKeyboardDoubleArrowRight className="fs-4 text-white " />
                                        </div>
                                        <h6 className="h6-color fs-5 mb-0">Editar contraseña</h6>
                                    </div>
                                    <Link to="/cambiar-contraseña" className="ms-4 text-uppercase text-decoration-none text-white border fw-bold link-card-2 d-flex align-items-center">
                                        Ir <FaRegArrowAltCircleRight className="ms-1" />
                                    </Link>
                                </div>


                                <div className="border rounded p-3 shadow m-2 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <div className='rounded-color d-flex justify-content-center align-items-center me-4'>
                                            <MdOutlineKeyboardDoubleArrowRight className="fs-4 text-white" />
                                        </div>
                                        <h6 className="h6-color fs-5 mb-0">Historial de actividad</h6>
                                    </div>
                                    <Link to="/historial-actividad" className="ms-4 text-uppercase text-decoration-none text-white border fw-bold link-card-2 d-flex align-items-center">
                                        Ir <FaRegArrowAltCircleRight className="ms-1" />
                                    </Link>
                                </div>

                                <div className="border rounded p-3 shadow m-2 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <div className='rounded-color d-flex justify-content-center align-items-center me-4'>
                                            <MdOutlineKeyboardDoubleArrowRight className="fs-4 text-white" />
                                        </div>
                                        <h6 className="h6-color fs-5 mb-0">Cerrar sesión</h6>
                                    </div>
                                    <Link to="/logout" className="ms-4 text-uppercase text-decoration-none text-white border fw-bold link-card-2 d-flex align-items-center">
                                        Ir <FaRegArrowAltCircleRight className="ms-1" />
                                    </Link>
                                </div>

                            </div>


                        </div>
                    </div>

                </div>
            </div>

            <button className='btn btn-volver rounded-pill text-white text-center text-uppercase'
                type='submit' onClick={handleVolver}>
                <MdSubdirectoryArrowLeft className='text-white' /> Volver
            </button>
            <Footer />

        </div>
    );
}

export default PanelUsuario;