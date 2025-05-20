import HeaderStaff from '../../layouts/HeaderStaff'
import { Footer } from '../../layouts/Footer'
import { Link, useNavigate } from 'react-router';
import { MdSubdirectoryArrowLeft } from 'react-icons/md';
import '../../styles/info.css'
import '../../styles/dashboard.css';
import { GrDocumentText } from "react-icons/gr";
import { FaRegArrowAltCircleRight } from 'react-icons/fa';
import '../../styles/panel-usuario-nuevo.css'

export const Info = () => {
  const navigate = useNavigate();
    const handleVolver = () => {
        navigate(-1);
    };

    
  return (
    <div>
        <HeaderStaff/>
            <h1 className="w-50 fs-4 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 m-4">
                Centro de ayuda
            </h1>
            <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
                <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5 ms-4 me-4">
                <h6 className="fs-3 h1-titulo fw-bold">Consultá la información si necesitás recordar cómo funciona alguna sección del sistema.</h6>
                </div>
            </div>

          

             <div className="d-flex justify-content-center align-items-start min-vh-75 mt-5">
                   <div className="w-75 d-flex flex-column border mb-4 shadow-input border p-4 shadow rounded-3">
                         <h4 className='mb-4 subtitle-dashboard ps-4'>Consultar manual de usuario</h4>
                          <div className="card shadow border-0 rounded-3 w-75 w-md-75 mx-auto mb-4">
                              <div className="card-body">
                                <div className="bg-light-success rounded p-3">
                                  <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-3">
                                    <div className="d-flex align-items-center mb-3 mb-md-0">
                                      <GrDocumentText className="fs-4 me-3 subtitle-dashboard" />
                                      <h5 className="subtitle-dashboard mb-0">Manual de usuario</h5>
                                    </div>

                                    
                                    <a
                                      href="/manual-de-usuario"
                                      rel="noopener noreferrer"
                                      className="text-uppercase text-decoration-none text-white fw-bold link-card-2"
                                    >
                                      Ir <FaRegArrowAltCircleRight />
                                    </a>

                                    
                                  </div>
                                </div>
                              </div>
                         </div>

            
                          <h4 className='mb-4 subtitle-dashboard ps-4'>Guía rápida</h4>
                          <div className="card shadow border-0 rounded-3 w-75 w-md-75 mx-auto mb-4">
                            <div className="card-body">
                              <div className="bg-light-success rounded p-3 ">
                                <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-3">
                                  <div className="d-flex align-items-center mb-3 mb-md-0">
                                    <GrDocumentText className='fs-4 me-4 subtitle-dashboard'/>
                                    <h5 className="subtitle-dashboard mb-0">Guía rápida</h5>
                                  </div>

                                    <a
                                      href=""
                                      rel="noopener noreferrer"
                                      className="text-uppercase text-decoration-none text-white fw-bold link-card-2"
                                    >
                                      Ir <FaRegArrowAltCircleRight />
                                    </a>

                                </div>
                              </div>
                            </div>
                         </div>
                             
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
  )
}
