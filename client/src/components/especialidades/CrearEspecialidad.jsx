import { MdSubdirectoryArrowLeft } from "react-icons/md";
import HeaderStaff from "../../layouts/HeaderStaff";
import { useNavigate } from "react-router";

const CrearEspecialidad = () => {

    const navigate = useNavigate();
    const handleVolver = () => {
        navigate(-1);
    };

    return (
        <div>
              <HeaderStaff/>
                <h6 className="w-25 fs-4 text-center pb-2 rounded-top rounded-bottom fw-bold text-white p-container mb-0 ">
                    Alta de plan
                </h6>
                <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
                    <div className="w-100 d-flex flex-column border  shadow-input p-3 rounded-3 shadow ps-5">
                        <h1 className="fs-2 h1-titulo fw-bold ">
                            Añadí una especialidad, estará disponible para futuras ediciones y cargas.
                        </h1>
                    </div>
                </div>

             <div className="d-flex justify-content-center align-items-start min-vh-100">
                <div className="w-100 d-flex flex-column border shadow-input p-5 rounded-3 shadow mt-5 ">
                    


                <button className='btn btn-volver rounded-pill text-white text-center text-uppercase' 
                        type='submit' 
                        onClick={handleVolver}>            
                <MdSubdirectoryArrowLeft className='text-white'/> Volver
                </button>    
                </div>
             </div>

            

        </div>
    );
}

export default CrearEspecialidad;
