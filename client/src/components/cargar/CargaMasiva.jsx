import '../../styles/cargar-cartilla.css'
import { MdSubdirectoryArrowLeft } from "react-icons/md";
import { CiCircleAlert } from "react-icons/ci";
import { MdNotStarted } from "react-icons/md";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { Footer } from '../../layouts/Footer';
import HeaderStaff from '../../layouts/HeaderStaff';


export default function CargaMasiva() {
  const navigate = useNavigate();

  const handleVolver = () => {
    navigate(-1);
  };


  return (
    <div >
       
       <HeaderStaff title="Cargar cartilla" />
      <p className="fs-3 font-p fw-bold ">Desde aquí podés subir una cartilla. </p>

      <div className="d-flex justify-content-center align-items-center min-vh-100">
              <div className="w-75 d-flex border mb-4 shadow-input border p-3 custom-height">
               
                <div className="border m-2 p-2 w-100 ">
                  <h2 className="title-dashboard"> <MdNotStarted className="me-3"/> Cargar </h2>
                  
                  <div className="m-4 justify-content-center drap-drop-style text-center">
                      <IoCloudUploadOutline className='cloud-icon' />

                    <span className="fs-4 fw-bold ">Drag & drop files</span>
                      
                    <p className='fw-bold fs-5 text-center'>Arrastrá y soltá el archivo que deseas subir</p>
                    <p className='text-center fw-light'>FORMATO ACEPTADO .CSV</p>
                  </div>

                  <div className="w-100 d-flex justify-content-center">
                      <div className="div-pautas-size text-center">
                        
                      <p className="fw-bold fs-6 mb-2">
                          Importante: los archivos deben cumplir con las siguientes pautas:
                        </p>
                        <div className="border m-2">
                          <div className="texto-y-icono">
                            <span className='p-2 fs-6'>El archivo debe estar en formato .csv</span>
                            <CiCircleAlert className="icono-verde" />
                          </div>
                          <div className="linea-verde"></div>
                        </div>


                        <div className="border m-2">
                          <div className="texto-y-icono">
                            <span className="p-2 fs-6">Respeta los estándares de grillas, columnas y filas</span>
                            <CiCircleAlert className="icono-verde" />
                          </div>
                          <div className="linea-verde"></div>
                        </div>

                        <div className="border m-2">
                          <div className="texto-y-icono">
                            <span className="fs-6">No debe tener fuentes incrustadas</span>
                            <CiCircleAlert className="icono-verde" />
                          </div>
                          <div className="linea-verde"></div>
                        </div>
                      </div>
                      </div>

                  <button
                    className="mt-5 btn btn-subir text-white text-center text-uppercase d-block mx-auto my-4"
                    type="submit">
                    Subir archivo
                  </button>

                  <p className="fw-bold  mb-0 text-center">
                    ¿Tenés dudas de cómo preparar tu archivo? [Consultá la guía]
                  </p>
                </div>
              </div>
        </div>

            <button className='btn btn-volver rounded-pill text-white text-center text-uppercase ' type='submit' onClick={handleVolver}>            
              <MdSubdirectoryArrowLeft className='text-white' /> Volver
            </button>

            <Footer/>
    </div>
  )
}
