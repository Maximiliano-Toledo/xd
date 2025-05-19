import { FaRegArrowAltCircleRight } from 'react-icons/fa';
import { Footer } from '../layouts/Footer'
import HeaderStaff from '../layouts/HeaderStaff'
import '../styles/admin-dashboard.css'
import { Link } from 'react-router-dom';


export default function AdminDashboard() {

  return (
    <div>
        <HeaderStaff/>
       
        
          <h1 className="w-50 fs-4 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 m-4 ">
                Gestión de cartilla
          </h1>
            <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
                <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5 ms-4 me-4 ">
                <h6 className="fs-3 h1-titulo fw-bold">Desde aquí podés agregar un nuevo archivo, editar registros existentes o dar de baja lo que ya no necesitás.</h6>
                </div>
            </div>

        
        <div className="d-flex justify-content-center align-items-start min-vh-75">
            <div className="w-100 d-flex flex-column border  shadow-input p-3 rounded-3 shadow m-4">
              
                <h6 className='subtitulo-dashboard fs-4 fw-bold ps-4 pb-5'>
                  Accedé a todas las herramientas disponibles
                </h6>
                
                
                  <div className='shadow-sm p-2 d-flex flex-wrap gap-4 justify-content-center'>

                    {/**Card de cargar un prestador de manera individual */}
                     <div className="card ms-2 me-2 backound-color text-white fw-bolder rounded-5" style={{ width: '23rem'}}>
                      <div className="card-body div-background rounded-5 ">
                        <div className="d-flex justify-content-between fs-5 pt-3 pb-3">
                            <p className='p-0 m-0'>Carga individual</p>
                            <div className="flex-grow-0">
                              <Link to="/carga-individual" className="text-uppercase text-decoration-none link-card">
                                Ir <FaRegArrowAltCircleRight />
                              </Link>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between fs-5 ">
                        <p className='p-0 m-0'>Carga masiva</p>
                        <div className="flex-grow-0">
                          <Link to="/carga-masiva" className="text-uppercase text-decoration-none link-card">
                            Ir <FaRegArrowAltCircleRight />
                          </Link>
                        </div>
                        </div>
                      </div>

                      <div className="card-body ">
                          <p className="card-text border-bottom border-top p-3">
                               Seleccioná si querés ingresar una cartilla con una carga individual por prestador.
                          </p>
                           <h5 className="card-title text-uppercase fs-3 fw-bold p-2 text-center">Cargar cartilla</h5>
                      </div>
                    </div>



                    {/*Card de editar un prestador */}
                    <div className="card ms-2 me-2 backound-color text-white fw-bolder rounded-5" style={{ width: '23rem' }}>
                        <div className="card-body div-background rounded-5">
                            <span className='d-flex justify-content-between fs-5 pt-3 pe-1'> 
                              <p className='p-0 m-0 pe-1'>Modificar registro</p> 
                              <div className="flex-grow-0">
                              <Link to="/editar-prestador" className="text-uppercase text-decoration-none link-card ">
                                Ir <FaRegArrowAltCircleRight />
                              </Link>
                              </div>
                            </span>
                        </div>

                        <div className="card-body">
                            <p className="card-text border-bottom border-top p-4">Modificá registros de manera individual. </p>
                            <h5 className="card-title text-uppercase p-3 fs-3 fw-bold text-center">Editar cartilla</h5>
                        </div>
                    </div>
                    

                  </div>
            </div>
        </div>

        <Footer/>
    </div>
  )
}
