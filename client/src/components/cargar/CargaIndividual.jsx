import { MdSubdirectoryArrowLeft } from "react-icons/md";
import { Footer } from "../../layouts/Footer";
import HeaderStaff from "../../layouts/HeaderStaff";
import '../../styles/carga-individual.css';
import '../../styles/cargar-cartilla.css';
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import LiveAlert from "../utils/LiveAlert";
import { useAbmApi } from '../../hooks/useAbmApi';
import CustomSelect from '../CustomSelect';

export const CargaIndividual = () => {
  /**Validación para asegurarme que cargue todos los datos o no se activa el botón */
  const [formData, setFormData] = useState({
    plan: [], // Cambiado a array
    categoria: "",
    especialidad: [], // Cambiado a array
    provincia: "",
    localidad: "",
    direccion: "",
    nombre: "",
    telefono: "",
    email: "",
    informacion: ""
  });

  // Hooks para cada entidad ABM
  const {
    data: planes,
    loading: loadingPlanes,
    getAll: getPlanes
  } = useAbmApi('planes');

  const {
    data: categorias,
    loading: loadingCategorias,
    getAll: getCategorias
  } = useAbmApi('categorias');

  const {
    data: especialidades,
    loading: loadingEspecialidades,
    getAll: getEspecialidades
  } = useAbmApi('especialidades');

  const {
    data: provincias,
    loading: loadingProvincias,
    getAll: getProvincias
  } = useAbmApi('provincias');

  const {
    data: localidades,
    loading: loadingLocalidades,
    getLocalidadesByProvincia
  } = useAbmApi('localidades');

  // Hook para la creación de prestadores
  const {
    loading: loadingCrearPrestador,
    createPrestador
  } = useAbmApi('prestadores');

  // Cargar datos al montar el componente
  useEffect(() => {
    getPlanes();
    getCategorias();
    getEspecialidades();
    getProvincias();
  }, []);

  // Cargar localidades cuando se selecciona una provincia
  useEffect(() => {
    if (formData.provincia) {
      getLocalidadesByProvincia(formData.provincia);
    }
  }, [formData.provincia]);

  // Adaptar opciones para CustomSelect
  const adaptarOpciones = (opciones, idKey, nombreKey) => {
    return opciones.map((opcion) => ({
      id: opcion[idKey],
      nombre: opcion[nombreKey],
    }));
  };

  /*para volver atras*/
  const navigate = useNavigate();
  const handleVolver = () => {
    navigate(-1);
  };

  /**Mensaje de Confirmar Carga*/
  const confirmarCarga = (datosFormateados) => {
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Llamar a la API para crear el prestador
          await createPrestador(datosFormateados);
          
          Swal.fire({
            title: 'Prestador cargado correctamente',
            icon: 'success',
            color: "#64A70B",
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#64A70B'
          });
          
          limpiarFormulario();
          
        } catch (error) {
          console.error("Error al crear el prestador:", error);
          Swal.fire({
            title: 'Error al cargar el prestador',
            text: error.message || 'Ha ocurrido un error al intentar crear el prestador.',
            icon: 'error',
            color: "#d33",
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#64A70B'
          });
        }
      }
    });
  };

  const limpiarFormulario = () => {
    setFormData({
      plan: [],
      categoria: "",
      especialidad: [],
      provincia: "",
      localidad: "",
      direccion: "",
      nombre: "",
      telefono: "",
      email: "",
      informacion: ""
    });
    
    reset({
      plan: [],
      categoria: "",
      especialidad: [],
      provincia: "",
      localidad: "",
      direccion: "",
      nombre: "",
      telefono: "",
      email: "",
      informacion: ""
    });
    
    setFormStep(0);
  };

  // el wizard 
  const FormTitles = ["Datos institucionales", 'Datos de ubicación y contacto'];
  const [formStep, setFormStep] = useState(0);

  const completeFormStep = () => {
    setFormStep((currPage) => currPage + 1);
  };

  const backFormStep = () => {
    setFormStep((currPage) => currPage - 1);
  };

  /*react-hook-form */
  const { register, formState: { errors }, handleSubmit, watch, setValue, reset } = useForm({
    mode: "onChange",
  });

  const onSubmit = handleSubmit((data) => {
    // Formatear los datos para enviar al servidor según el formato requerido
    const datosFormateados = {
      nombre: data.nombre,
      direccion: data.direccion,
      telefonos: data.telefono || "",
      email: data.email || "",
      informacion_adicional: data.informacion || "",
      estado: "Activo",
      id_localidad: parseInt(formData.localidad),
      categorias: [parseInt(formData.categoria)],
      especialidades: formData.especialidad.map(id => parseInt(id)), // Convertir array de strings a array de números
      planes: formData.plan.map(id => parseInt(id)) // Convertir array de strings a array de números
    };
    
    console.log('Datos a enviar:', datosFormateados);
    confirmarCarga(datosFormateados);
  });

  // Manejar cambios en los inputs, incluyendo los selects múltiples
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si el valor es un array (para selects múltiples)
    if (Array.isArray(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setValue(name, value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setValue(name, value);
      
      // Limpiar el valor de localidad cuando cambia la provincia
      if (name === 'provincia') {
        setFormData((prev) => ({ ...prev, localidad: "" }));
        setValue('localidad', "");
      }
    }
  };

  // Verificar si los campos obligatorios están completos
  const camposObligatoriosCompletos = () => {
    const camposRequeridos = {
      plan: (value) => Array.isArray(value) && value.length > 0,
      categoria: (value) => value && value.toString().trim() !== "",
      especialidad: (value) => Array.isArray(value) && value.length > 0,
      nombre: (value) => value && value.toString().trim() !== "",
      provincia: (value) => value && value.toString().trim() !== "",
      localidad: (value) => value && value.toString().trim() !== "",
      direccion: (value) => value && value.toString().trim() !== ""
    };
    
    return Object.entries(camposRequeridos).every(([campo, validator]) => 
      validator(formData[campo])
    );
  };

  return (
    <div>
      <HeaderStaff />
      <h1 className=" w-25 fs-4 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 m-4 ">
        Carga individual
      </h1>
      <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
        <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5 ms-4 me-4 ">
          <h6 className="fs-2 h1-titulo fw-bold ">Cargar un prestador.</h6>
        </div>
      </div>

      <form className="d-flex justify-content-center align-items-start min-vh-75 mt-4"
        onSubmit={onSubmit}>
        <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow m-5 ">
          <h6 className="text-center fw-bold p-1 fs-5"> <FaCheckCircle className="check-style" /> {FormTitles[formStep]}</h6>

          {formStep === 0 && (<div className="d-flex justify-content-between m-3">
            {/* Columna izquierda */}
            <div className="w-50 pe-3">
              <div className="form-group mb-4">
                <label htmlFor="plan" className="fw-bold p-1 fs-6">
                  Plan:
                </label>
                <CustomSelect
                  options={adaptarOpciones(planes, "id_plan", "nombre")}
                  value={formData.plan}
                  onChange={handleChange}
                  name="plan"
                  placeholder={loadingPlanes ? "Cargando planes..." : "Seleccione uno o más planes"}
                  disabled={loadingPlanes}
                  loading={loadingPlanes}
                  multiple={true}
                />
                {errors.plan && (<span className='ms-3 text-danger fw-bold'>Al menos un plan es requerido</span>)}
              </div>

              <div className="form-group mb-4">
                  <LiveAlert message={
                            <>
                              Ingresá el nombre con mayúscula inicial en cada palabra. <b>Ejemplo:</b> Clínica Médica. <br />
                              Puedes seleccionar múltiples especialidades.
                            </>
                 }/>

                <label htmlFor="especialidad" className="fw-bold p-1 fs-6">Especialidad:</label>
                <CustomSelect
                  options={adaptarOpciones(especialidades, "id_especialidad", "nombre")}
                  value={formData.especialidad}
                  onChange={handleChange}
                  name="especialidad"
                  placeholder={loadingEspecialidades ? "Cargando especialidades..." : "Seleccione una o más especialidades"}
                  disabled={loadingEspecialidades}
                  loading={loadingEspecialidades}
                  multiple={true}
                />
                {errors.especialidad && (<span className='ms-3 text-danger fw-bold'>Al menos una especialidad es requerida</span>)}
              </div>
            </div>

            {/* Columna derecha */}
            <div className="w-50 ps-3">
              <div className="form-group mb-4">
                <label htmlFor="categoria" className="fw-bold p-1 fs-6">
                  Categoría:
                </label>
                <CustomSelect
                  options={adaptarOpciones(categorias, "id_categoria", "nombre")}
                  value={formData.categoria}
                  onChange={handleChange}
                  name="categoria"
                  placeholder={loadingCategorias ? "Cargando categorías..." : "Seleccione una categoría"}
                  disabled={loadingCategorias}
                  loading={loadingCategorias}
                />
                {errors.categoria && (<span className='ms-3 text-danger fw-bold'>La categoría es requerida</span>)}
              </div>

              <div className="form-group mb-4 position-relative">
                  <LiveAlert message={
                                <>
                                  Cada palabra debe iniciar con mayúscula. <b>Ejemplo</b>: Policlínico Regional Avellaneda.<br />
                                  Ingresá un único prestador por vez.
                                </>
                              } />

                <label htmlFor="nombre" className="fw-bold p-1 fs-6">
                  Nombre del prestador:
                </label>
                <input
                  type="text"
                  {...register('nombre', {
                    required: true,
                    minLength: 2,
                    onChange: (e) => handleChange(e)
                  })}
                  className="form-control p-2 mt-2"
                  id="nombre"
                  placeholder="Ingresá el nombre completo del prestador"
                />
                {errors.nombre?.type === 'required' &&
                  (<span className='ms-3 text-danger fw-bold'>El nombre del prestador es requerido</span>)}
                {errors.nombre?.type === 'minLength' &&
                  (<span className='ms-3 text-danger fw-bold'>El nombre debe tener mínimo 2 caracteres</span>)}
              </div>
            </div>
          </div>)}

          {formStep === 1 && (
            <div className="d-flex justify-content-between m-3">
              {/* Columna izquierda */}
              <div className="w-50 pe-3 pt-4">
                <div className="form-group mb-5">
                  <label htmlFor="provincia" className="fw-bold p-1 fs-6">Provincia:</label>
                  <CustomSelect
                    options={adaptarOpciones(provincias, "id_provincia", "nombre")}
                    value={formData.provincia}
                    onChange={handleChange}
                    name="provincia"
                    placeholder={loadingProvincias ? "Cargando provincias..." : "Seleccione una provincia"}
                    disabled={loadingProvincias}
                    loading={loadingProvincias}
                  />
                  {errors.provincia && (<span className='ms-3 text-danger fw-bold'>La provincia es requerida</span>)}
                </div>

                <div className="form-group mb-5">
                  <label htmlFor="localidad" className="fw-bold p-1 fs-6">Localidad:</label>
                  <CustomSelect
                    options={adaptarOpciones(localidades, "id_localidad", "nombre")}
                    value={formData.localidad}
                    onChange={handleChange}
                    name="localidad"
                    placeholder={loadingLocalidades ? "Cargando localidades..." : "Seleccione una localidad"}
                    disabled={loadingLocalidades || !formData.provincia}
                    loading={loadingLocalidades}
                  />
                  {errors.localidad && (<span className='ms-3 text-danger fw-bold'>La localidad es requerida</span>)}
                </div>

                <div className="form-group mb-5 position-relative">
                   <LiveAlert message={
                              <>
                                Usa mayúscula inicial. <br />
                                Para múltiples alturas, separalas con /. <b>Ejemplo:</b> 25 de Mayo 340/344. <br />
                                Ingresá una única dirección.
                              </>
                          }
                        />

                  <label htmlFor="direccion" className="fw-bold p-1 fs-6 ">
                    Dirección:
                  </label>
                 
                  <input
                    type="text"
                    {...register('direccion', {
                      required: true,
                      minLength: 4,
                      onChange: (e) => handleChange(e)
                    })}
                    className="form-control p-2 mt-2"
                    id="direccion"
                    placeholder="Ingrese una dirección (Calle, Altura)"
                  />
                  {errors.direccion?.type === 'required' &&
                    (<span className='ms-3 text-danger fw-bold'>La dirección es requerida</span>)}
                  {errors.direccion?.type === 'minLength' &&
                    (<span className='ms-3 text-danger fw-bold'>La dirección debe tener mínimo 4 caracteres</span>)}
                </div>
              </div>

              {/* Columna derecha */}
              <div className="w-50 ps-3">
                <div className="form-group mb-5 position-relative">
                  <LiveAlert
                        message={
                          <>
                            Ingresá primero el código de área, seguido del número. <br /> No uses símbolos como ( ) ni /. <br />
                            Si hay interno, escribí int: seguido del número. <b>Ejemplo:</b> 011 43211234 int:11. <br />
                            Si son varios Teléfonos, separalos con coma (,). <b>Ejemplo:</b> 011 43211234, 011 43211235 int:12.
                          </>
                        }
                  />

                  <label htmlFor="telefono" className="fw-bold fs-6">
                    Teléfono:
                  </label>
                  
                  <input
                    type="text"
                    {...register('telefono', {
                      onChange: (e) => handleChange(e)
                    })}
                    className="form-control p-2 mt-2"
                    id="telefono"
                    placeholder="Ingrese el número de teléfono (ej: 011 12345678)"
                  />
                </div>

                <div className="form-group mb-5 position-relative">
                    <LiveAlert message={
                          <>
                            Ingresá la dirección de correo electrónico en minúsculas. <br />
                            No uses espacios. <br /> Para múltiples correos, separalos con /. <br />
                            Evitá copiar y pegar mails con espacios invisibles.
                           <b> Ejemplo:</b> contacto@contacto.com / consultas@consultas.com.ar
                          </>
                        }
                      />

                  <label htmlFor="email" className="fw-bold fs-6">
                    E-mail:
                  </label>
                  <input
                    type="email"
                    {...register('email', {
                      onChange: (e) => handleChange(e)
                    })}
                    className="form-control p-2 mt-2"
                    id="email"
                    placeholder="ejemplo@correo.com"
                  />
                </div>

                <div className="form-group mb-5">
                  <label htmlFor="informacion" className="fw-bold fs-6 pb-3">
                    Información adicional:
                  </label>
                  <input
                    type="text"
                    {...register('informacion', {
                      onChange: (e) => handleChange(e)
                    })}
                    className="form-control p-2"
                    id="informacion"
                    placeholder="Observaciones"
                  />
                </div>
              </div>
            </div>)}

          <div className="d-flex justify-content-between mt-4">
            <button
              className="btn btn-volver rounded-pill text-white text-center text-uppercase"
              type="button"
              disabled={formStep === 0}
              onClick={backFormStep}>
              Anterior
            </button>

            <button
              className="btn btn-volver rounded-pill text-white text-center text-uppercase"
              type="button"
              disabled={formStep === FormTitles.length - 1}
              onClick={completeFormStep}>
              Siguiente
            </button>
          </div>

          {formStep === FormTitles.length - 1 && !camposObligatoriosCompletos() && (
            <p className="text-danger fw-bold text-center">
              Completá todos los campos obligatorios para habilitar el botón de cargar
            </p>
          )}

          {formStep === FormTitles.length - 1 && (
            <button
              className='btn btn-cargar rounded-pill text-white text-center text-uppercase fs-6 d-block mx-auto my-4 mb-5'
              type='submit'
              disabled={!camposObligatoriosCompletos() || loadingCrearPrestador}>
              {loadingCrearPrestador ? 'Cargando...' : 'Cargar un prestador'}
            </button>
          )}
        </div>
      </form>

      <button
        className='btn btn-volver rounded-pill text-white text-center text-uppercase mt-2'
        type='button'
        onClick={handleVolver}>
        <MdSubdirectoryArrowLeft className='text-white' /> Volver
      </button>

      <Footer />
    </div>
  )
}