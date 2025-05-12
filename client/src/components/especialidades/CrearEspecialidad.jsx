import { MdSubdirectoryArrowLeft } from "react-icons/md";
import HeaderStaff from "../../layouts/HeaderStaff";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { FaPlus } from "react-icons/fa6";
import LiveAlert from "../utils/LiveAlert";

const CrearEspecialidad = () => {

    const navigate = useNavigate();
    const handleVolver = () => {
        navigate(-1);
    };

    const { register, formState: { errors }, handleSubmit } = useForm();

    const confirmarCarga=()=>{
        //  e.preventDefault(); //evitar que recargue la página y aparezca el mensaje de carga completa
        Swal.fire({
            title: "¿Confirmás el alta de la nueva especialidad?",
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
                try {
                    // Acá llamaria a la API para crear el plan 
                    Swal.fire({
                        title: 'Especialidad creada correctamente',
                        icon: 'success',
                        color: "#64A70B",
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#64A70B'
                        });   
                    } catch (error) {
                        console.error("Error al crear la especialidad:", error);
                        Swal.fire({
                        title: 'Error al cargar la especialidad',
                        text: error.message || 'Ha ocurrido un error al intentar crear la especialidad.',
                        icon: 'error',
                        color: "#d33",
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#64A70B'
                        });
                    } 
                }
                  });
        }

    const onSubmit = handleSubmit(() => {
       confirmarCarga()      
   })

    return (
        <div>
              <HeaderStaff/>
                <h6 className="w-25 fs-4 text-center pb-2 rounded-top rounded-bottom fw-bold text-white p-container mb-0 ">
                    Alta de especialidad
                </h6>
                <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
                    <div className="w-100 d-flex flex-column border  shadow-input p-3 rounded-3 shadow ps-5">
                        <h1 className="fs-2 h1-titulo fw-bold ">
                            Añadí una especialidad, estará disponible para futuras ediciones y cargas.
                        </h1>
                    </div>
                </div>

                <button className="btn btn-volver rounded-pill text-white fw-bolder text-center text-uppercase mt-4 ms-4"
                        type="submit"
                        onClick={handleVolver}>
                        <MdSubdirectoryArrowLeft className="text-white"/> Volver
                </button>


             <div className="d-flex justify-content-center align-items-start min-vh-100">
                <div className="w-50 d-flex flex-column border shadow-input p-5 rounded-3 shadow mt-5 ">
                    
                    <form className="form-group mb-4 position-relative" onSubmit={onSubmit}>
                        <LiveAlert message="Usá mayúscula solo en la primera letra de cada palabra.
                                            No utilizar números innecesarios.
                                            No se permiten caracteres especiales" />
                            <label htmlFor="especialidad" className="fw-bold p-1 fs-6">
                                Nombre de la nueva especialidad:
                            </label>
                            <input type="text"
                                {...register('especialidad', {
                                    required: true,
                                    minLength: 3,
                                    pattern: {
                                    value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/, 
                                    message: 'Sólo se permiten letras, números y espacios.'
                                    }
                                    })}
                                    className="form-control p-2 mt-2"
                                    id="especialidad"
                                    placeholder="Ingresá la nueva especialidad"/>

                            {errors.especialidad?.type === 'required' &&
                            (<span className='ms-3 text-danger fw-bold'>El nombre de la especialidad es requerida.</span>)}
                            {errors.especialidad?.type === 'minLength' &&
                            (<span className='ms-3 text-danger fw-bold'>El nombre de la especialidad debe tener mínimo 3 caracteres.</span>)}
                            {errors.especialidad?.type === 'pattern' && 
                            (<span className='ms-3 text-danger fw-bold'>{errors.especialidad.message}</span>)}

                        <div className="d-flex justify-content-center mt-4">
                            <button className="btn btn-volver rounded-pill text-white text-center text-uppercase w-md-auto white-space-nowrap"
                                    type="submit">
                                <FaPlus className="text-white pe-1" /> Agregar
                            </button>
                        </div>
                    </form>


                </div>
             </div>
        </div>
    );
}

export default CrearEspecialidad;
