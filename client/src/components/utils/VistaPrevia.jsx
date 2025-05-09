import '../../styles/cargar-cartilla.css'
import { MdOutlineCancel } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import HeaderAdmin from '../../layouts/HeaderStaff';
import Swal from 'sweetalert2'

const VistaPrevia = () => {

  const mostrarAlerta=()=>{
    Swal.fire({
      title: "¿Confirmás la carga?",
      text: "Una vez confirmado, no podrás editar esta información desde aquí",
      icon: "warning",
      color: "#64A70B",
      showCancelButton: true,
      cancelButtonText: 'Cancelar y volver',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#64A70B'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Cartilla subida correctamente',
          icon: 'success',
          color: "#64A70B",
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#64A70B'
        });
      }
    });
  }


  return (
    <div>
        <HeaderAdmin title="Vista previa de archivos" />

      <p className="fs-3 fw-bold font-p">
        Visualizando los archivos que subiste. Verifica que la información sea la esperada antes de seguir.
      </p>

      <div className="d-flex justify-content-center align-items-start min-vh-100">
        <div className="w-75 border bg-white shadow-input border p-4 custom-height">
          <div className="border m-2 p-3 w-100">
            <h6 className='p-style'>Archivo: nombre del archivo</h6>
          
          </div>


          <div className="d-flex justify-content-between mt-5 px-4">
              <button className="btn btn-subir rounded-pill text-white text-center text-uppercase">
                <MdOutlineCancel className="fs-3"/> Cancelar </button>

              <button className="btn btn-subir rounded-pill text-white text-center text-uppercase"
                         onClick={mostrarAlerta}>
                <FaCheckCircle className="fs-4" 
                /> Aceptar </button>
          </div>


        </div>
      </div>
    </div>
  )
}

export default VistaPrevia;
