import HeaderStaff from '../../layouts/HeaderStaff';
import { MdSubdirectoryArrowLeft } from 'react-icons/md';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import LiveAlert from '../utils/LiveAlert';
import Swal from 'sweetalert2';
import { FaPlus } from 'react-icons/fa6';
import { useAbmApi } from '../../hooks/useAbmApi';
import '../../styles/cargar-cartilla.css'

const CrearPlan = () => {
    const navigate = useNavigate();
    const handleVolver = () => {
        navigate(-1);
    };

    // Usamos el hook useAbmApi para planes
    const {
        loading: loadingCrearPlan,
        create: createPlan
    } = useAbmApi('planes');

    // react-hook-form   
    const { register, formState: { errors }, handleSubmit, reset } = useForm();

    const confirmarCarga = async (data) => {
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
        }).then(async (result) => {
            if (result.isConfirmed) {       
                try {
                    // Llamamos a la API para crear el plan
                    await createPlan({ nombre: data.plan });
                    
                    Swal.fire({
                        title: 'Plan creado correctamente',
                        icon: 'success',
                        color: "#64A70B",
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#64A70B'
                    });
                    
                    // Limpiamos el formulario después de crear
                    reset({ plan: '' });
                    
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
    };

    const onSubmit = handleSubmit((data) => {
        confirmarCarga(data);
    });

    return (
        <div>
            <HeaderStaff/>
            <h1 className="w-50 fs-5 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mb-0 ">
                Alta de plan
            </h1>
            <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0 mb-0">
                <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5">
                    <h6 className="fs-2 h1-titulo fw-bold ">
                        Añadí un plan, estará disponible para futuras ediciones y cargas.
                    </h6>
                </div>
            </div>

            <button className="btn btn-volver rounded-pill text-white fw-bolder text-center text-uppercase mt-4 ms-4"
                    type="button"
                    onClick={handleVolver}>
                    <MdSubdirectoryArrowLeft className="text-white" /> Volver
            </button>

            <div className="d-flex justify-content-center align-items-start min-vh-100">
                <div className="w-75 w-md-75 w-lg-50 d-flex flex-column border shadow-input p-3 p-md-4 p-lg-5 rounded-3 shadow mt-5 ">
                    <form className="form-group mb-4 position-relative" onSubmit={onSubmit}>
                        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center">
                            <label htmlFor="plan" className="fw-bold subtitle-dashboard m-1 pe-md-2 fs-6">
                                Nombre del nuevo plan:
                            </label>
                            <LiveAlert message={
                                <>
                                Usá mayúscula solo en la primera letra de cada palabra.<br />
                                No utilizar números innecesarios.<br />
                                No se permiten caracteres especiales.
                                </>
                            } />
                        </div>

                        <input 
                            type="text"
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
                            placeholder="Ingresá el nuevo nombre"
                            disabled={loadingCrearPlan}
                        />
                        
                        {errors.plan?.type === 'required' &&
                        (<span className='ms-3 text-danger fw-bold'>El nombre del plan es requerido.</span>)}
                        {errors.plan?.type === 'minLength' &&
                        (<span className='ms-3 text-danger fw-bold'>El nombre debe tener mínimo 3 caracteres.</span>)}
                        {errors.plan?.type === 'pattern' && 
                        (<span className='ms-3 text-danger fw-bold'>{errors.plan.message}</span>)}
                        
                        <div className="d-flex justify-content-center mt-4">
                            <button 
                                className="btn btn-volver rounded-pill text-white fw-bolder text-center text-uppercase mt-4 ms-4 me-4 px-4"
                            style={{ minWidth: '150px', whiteSpace: 'nowrap' }}
                                type="submit"
                                disabled={loadingCrearPlan}
                            >
                                {loadingCrearPlan ? (
                                    <span>Cargando...</span>
                                ) : (
                                    <>
                                        <FaPlus className="text-white pe-1" /> Agregar
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CrearPlan;