import { FaRegArrowAltCircleRight } from 'react-icons/fa';
import { Footer } from '../layouts/Footer'
import HeaderStaff from '../layouts/HeaderStaff'
import '../styles/admin-dashboard.css'
import { Link } from 'react-router-dom';
import '../styles/carga-individual.css'


export default function AdminDashboard() {

  return (
    <div className="w-100">
        <HeaderStaff/>
       
        <div className="container-fluid px-3 px-md-4">
          <h1 className="w-50 w-md-50 fs-5 fs-md-4 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mb-0">
                Gestión de cartilla
          </h1>
          
          <div className="row justify-content-center align-items-start">
              <div className="col-12">
                  <div className="border shadow-input p-3 rounded-3 shadow mb-4">
                      <h6 className="fs-3 h1-titulo fw-bold">Desde aquí podés agregar un nuevo archivo, editar registros existentes o dar de baja lo que ya no necesitás.</h6>
                  </div>
              </div>
          </div>

        
          <div className="row justify-content-center align-items-start">
              <div className="col-12">
                  <div className="border shadow-input p-3 rounded-3 shadow mb-4">
                    
                      <h6 className='subtitulo-dashboard fs-4 fw-bold pb-4'>
                        Accedé a todas las herramientas disponibles
                      </h6>
                      
                      
                      <div className='cards-row'>

                          {/* Card de cargar un prestador de manera individual */}
                          <div className="card backound-color text-white fw-bolder rounded-5 card-fixed-width mb-3">
                              <div className="card-body div-background rounded-5">
                                  <div className="d-flex justify-content-between fs-5 pt-3 pb-3">
                                      <p className='p-0 m-0'>Carga individual</p>
                                      <div className="flex-grow-0">
                                          <Link to="/carga-individual" className="text-uppercase text-decoration-none link-card">
                                              Ir <FaRegArrowAltCircleRight />
                                          </Link>
                                      </div>
                                  </div>

                                  <div className="d-flex justify-content-between fs-5">
                                      <p className='p-0 m-0'>Carga masiva</p>
                                      <div className="flex-grow-0">
                                          <Link to="/carga-masiva" className="text-uppercase text-decoration-none link-card">
                                              Ir <FaRegArrowAltCircleRight />
                                          </Link>
                                      </div>
                                  </div>
                              </div>

                              <div className="card-body">
                                  <p className="card-text border-bottom border-top p-3">
                                      Seleccioná si querés ingresar una cartilla con una carga individual por prestador.
                                  </p>
                                  <h5 className="card-title text-uppercase fs-3 fw-bold p-2 text-center">Cargar cartilla</h5>
                              </div>
                          </div>

                          {/* Card de editar un prestador */}
                          <div className="card backound-color text-white fw-bolder rounded-5 card-fixed-width mb-3">
                              <div className="card-body div-background rounded-5">
                                  <span className='d-flex justify-content-between fs-5 pt-3 pe-1'> 
                                      <p className='p-0 m-0 pe-1'>Modificar registro</p> 
                                      <div className="flex-grow-0">
                                          <Link to="/editar-prestador" className="text-uppercase text-decoration-none link-card">
                                              Ir <FaRegArrowAltCircleRight />
                                          </Link>
                                      </div>
                                  </span>
                              </div>

                              <div className="card-body">
                                  <p className="card-text border-bottom border-top p-4">Modificá registros de manera individual.</p>
                                  <h5 className="card-title text-uppercase p-3 fs-3 fw-bold text-center">Editar cartilla</h5>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        </div>

        <Footer/>
    </div>
  )
}