import HeaderStaff from '../../layouts/HeaderStaff';
import { MdSubdirectoryArrowLeft } from 'react-icons/md';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import LiveAlert from '../utils/LiveAlert';
import Swal from 'sweetalert2';
import { FaPlus } from 'react-icons/fa6';

const CrearPlan = () => {

    const navigate = useNavigate();
    const handleVolver = () => {
        navigate(-1);
    };

    //react hook form   
    const { register, formState: { errors }, handleSubmit } = useForm();

    const confirmarCarga=(data)=>{
      //  e.preventDefault(); //evitar que recargue la página y aparezca el mensaje de carga completa
        Swal.fire({
            title: "¿Confirmás el alta del nuevo plan?",
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
                // Acá llamaria a la API para crear el plan y le paso (data)

                    Swal.fire({
                        title: 'Plan creado correctamente',
                        icon: 'success',
                        color: "#64A70B",
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#64A70B'
                    });
                    
                } catch (error) {
                    console.error("Error al crear el plan:", error);
                    Swal.fire({
                    title: 'Error al cargar el plan',
                    text: error.message || 'Ha ocurrido un error al intentar crear el plan.',
                    icon: 'error',
                    color: "#d33",
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#64A70B'
                    });
                } 
            }
              });
    }
 
   const onSubmit = handleSubmit((data) => {
       confirmarCarga(data)      
   })


    return (
        <div>
            <HeaderStaff/>
                <h6 className="w-25 fs-4 text-center pb-2 rounded-top rounded-bottom fw-bold text-white p-container mb-0 ">
                    Alta de plan
                </h6>
                <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0 mb-0">
                    <div className="w-100 d-flex flex-column border  shadow-input p-3 rounded-3 shadow ps-5">
                        <h1 className="fs-2 h1-titulo fw-bold ">
                            Añadí un plan, estará disponible para futuras ediciones y cargas.
                        </h1>
                    </div>
                </div>

                <button className="btn btn-volver rounded-pill text-white fw-bolder text-center text-uppercase mt-4 ms-4"
                        type="submit"
                        onClick={handleVolver}>
                        <MdSubdirectoryArrowLeft className="text-white " /> Volver
                </button>

             <div className="d-flex justify-content-center align-items-start min-vh-100">
                <div className="w-50 d-flex flex-column border shadow-input p-5 rounded-3 shadow mt-5 ">
                    <form className="form-group mb-4 position-relative" onSubmit={onSubmit}>
                        <LiveAlert message="Usá mayúscula solo en la primera letra de cada palabra.
                                            No utilizar números innecesarios.
                                            No se permiten caracteres especiales" />
                        <label htmlFor="plan" className="fw-bold p-1 fs-6">
                            Nombre del nuevo plan:
                        </label>
                        <input type="text"
                            {...register('plan', {
                                required: true,
                                minLength: 3,
                                pattern: {
                                value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/, 
                                message: 'Sólo se permiten letras, números y espacios.'
                                }
                            })}
                                className="form-control p-2 mt-2"
                                id="plan"
                                placeholder="Ingresá el nuevo nombre del plan"/>
                            {errors.plan?.type === 'required' &&
                            (<span className='ms-3 text-danger fw-bold'>El nombre del plan es requerido.</span>)}
                            {errors.plan?.type === 'minLength' &&
                            (<span className='ms-3 text-danger fw-bold'>El nombre debe tener mínimo 3 caracteres.</span>)}
                            {errors.plan?.type === 'pattern' && 
                            (<span className='ms-3 text-danger fw-bold'>{errors.plan.message}</span>)}
                        
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

export default CrearPlan;
