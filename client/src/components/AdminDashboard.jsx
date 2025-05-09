import { Link } from 'react-router'
import { Footer } from '../layouts/Footer'
import HeaderStaff from '../layouts/HeaderStaff'
import '../styles/dashboard.css'
import { FaRegArrowAltCircleRight } from "react-icons/fa";

export default function AdminDashboard() {
  return (
    <div>
        <HeaderStaff title="Gestión de cartilla"/>
        <p className="fs-3 font-p fw-bold w-75">Desde aquí podés agregar un nuevo archivo, editar registros existentes o eliminar lo que ya no necesitás. </p>
        
        
        <div className="d-flex justify-content-center align-items-start min-vh-75">
            <div className="w-100 d-flex flex-column border  shadow-input p-3 rounded-3 shadow m-4">
              
              <h6 className='subtitulo-dashboard fs-4 fw-bold ps-4 pb-5'>
                Accedé a todas las herramientas disponibles
              </h6>
                
              <div className='shadow-sm p-4 d-flex flex-column flex-md-row gap-4 justify-content-center '>
                  
                  <div className="card ms-2 me-2 backound-color text-white fw-bolder rounded-5" style={{ width: '20rem'}}>
                      <div className="card-body div-background rounded-5 ">
                        <span className="d-flex justify-content-between fs-5 pt-3 pb-3">
                          <p className='p-0 m-0 '>Carga individual</p>
                          <Link to="/carga-individual" className="text-uppercase text-decoration-none link-card">
                              Ir <FaRegArrowAltCircleRight />
                          </Link>
                        </span>

                        <span className="d-flex justify-content-between fs-5 ">
                        <p className='p-0 m-0'>Carga masiva</p>
                          <Link to="/carga-masiva" className="text-uppercase text-decoration-none link-card">
                            Ir <FaRegArrowAltCircleRight />
                          </Link>
                        </span>
                      </div>

                      <div className="card-body ">
                          <p className="card-text border-bottom border-top p-3">
                               Seleccioná si querés ingresar una cartilla con una carga individual por prestador.
                          </p>
                           <h5 className="card-title text-uppercase fs-3 fw-bold p-2 text-center">Cargar cartilla</h5>
                      </div>
                  </div>

                  

                  <div className="card ms-2 me-2 backound-color text-white fw-bolder rounded-5" style={{ width: '20rem' }}>
                      <div className="card-body div-background rounded-5">
                          <span className='d-flex justify-content-between fs-5 pt-3 pe-1'> 
                            <p className='p-0 m-0'>Modificar registro</p> 
                          <Link to="/editar-cartilla" className=" text-uppercase text-decoration-none link-card">
                            Ir <FaRegArrowAltCircleRight />
                          </Link>
                          </span>
                      </div>

                      <div className="card-body">
                          <p className="card-text border-bottom border-top p-4">Modificá registros de manera individual. </p>
                          <h5 className="card-title text-uppercase p-3 fs-3 fw-bold text-center">Editar cartilla</h5>
                      </div>
                  </div>


                  <div className="card ms-2 me-2 backound-color text-white fw-bolder rounded-5" style={{ width: '20rem' }}>
                      <div className="card-body div-background rounded-5">
                          <span className='d-flex justify-content-between  pt-3 pb-3'> 
                            <p className='p-0 m-0 fs-5'>Baja individual </p>
                            <Link to="/baja-individual" className="ps-5 text-uppercase text-decoration-none link-card">
                              Ir <FaRegArrowAltCircleRight />
                            </Link>
                          </span>
                          <span className='d-flex justify-content-between '>
                            <p className='p-0 m-0 fs-6'>Solicitar baja masiva</p>
                            <Link to="/baja-masiva" className="ps-5 text-uppercase text-decoration-none link-card">
                              Ir <FaRegArrowAltCircleRight />
                            </Link>
                          </span>
                      </div>

                      <div className="card-body">
                          <p className="card-text border-bottom border-top p-4">Eliminá el prestador de una cartilla o solicitá una baja masiva.</p>
                          <h5 className="card-title text-uppercase fw-bold p-2 fs-3 text-center">Baja de registros</h5>
                      </div>
                  </div>

                </div>
            </div>
        </div>

        <Footer/>
    </div>
  )
}
