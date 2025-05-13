import { MdSubdirectoryArrowLeft } from "react-icons/md";
import HeaderStaff from "../../layouts/HeaderStaff";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { FaPlus } from "react-icons/fa6";
import LiveAlert from "../utils/LiveAlert";
import { useAbmApi } from '../../hooks/useAbmApi';

const CrearEspecialidad = () => {
    const navigate = useNavigate();
    const handleVolver = () => {
        navigate(-1);
    };

    // Usamos el hook useAbmApi para especialidades
    const {
        loading: loadingCrearEspecialidad,
        create: createEspecialidad
    } = useAbmApi('especialidades');

    const { register, formState: { errors }, handleSubmit, reset } = useForm();

    const confirmarCarga = async (data) => {
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
        }).then(async (result) => {
            if (result.isConfirmed) {       
                try {
                    // Llamamos a la API para crear la especialidad
                    await createEspecialidad({ nombre: data.especialidad });
                    
                    Swal.fire({
                        title: 'Especialidad creada correctamente',
                        icon: 'success',
                        color: "#64A70B",
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#64A70B'
                    });
                    
                    // Limpiamos el formulario después de crear
                    reset({ especialidad: '' });
                    
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
    };

    const onSubmit = handleSubmit((data) => {
        confirmarCarga(data);
    });

    return (
        <div>
            <HeaderStaff/>
            <h1 className="w-25 fs-4 text-center pb-2 rounded-top rounded-bottom fw-bold text-white p-container mb-0 p-1">
                Alta de especialidad
            </h1>
            <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
                <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5">
                    <h6 className="fs-2 h1-titulo fw-bold ">
                        Añadí una especialidad, estará disponible para futuras ediciones y cargas.
                    </h6>
                </div>
            </div>

            <button className="btn btn-volver rounded-pill text-white fw-bolder text-center text-uppercase mt-4 ms-4"
                    type="button"
                    onClick={handleVolver}>
                    <MdSubdirectoryArrowLeft className="text-white"/> Volver
            </button>

            <div className="d-flex justify-content-center align-items-start min-vh-100">
                <div className="w-50 d-flex flex-column border shadow-input p-5 rounded-3 shadow mt-5 ">
                    
                    <form className="form-group mb-4 position-relative" onSubmit={onSubmit}>
                        <div className="d-flex align-items-center">
                            <label htmlFor="especialidad" className="fw-bold m-1 fs-6 ms-3">
                                Nombre de la nueva especialidad:
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
                            placeholder="Ingresá la nueva especialidad"
                            disabled={loadingCrearEspecialidad}
                        />

                        {errors.especialidad?.type === 'required' &&
                        (<span className='ms-3 text-danger fw-bold'>El nombre de la especialidad es requerida.</span>)}
                        {errors.especialidad?.type === 'minLength' &&
                        (<span className='ms-3 text-danger fw-bold'>El nombre de la especialidad debe tener mínimo 3 caracteres.</span>)}
                        {errors.especialidad?.type === 'pattern' && 
                        (<span className='ms-3 text-danger fw-bold'>{errors.especialidad.message}</span>)}

                        <div className="d-flex justify-content-center mt-4">
                            <button 
                                className="btn btn-volver rounded-pill text-white text-center text-uppercase w-md-auto white-space-nowrap"
                                type="submit"
                                disabled={loadingCrearEspecialidad}
                            >
                                {loadingCrearEspecialidad ? (
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

export default CrearEspecialidad;