import { useState, useEffect } from "react"
import { useAbmApi } from "./useAbmApi"
import Swal from "sweetalert2"

export const useCargaIndividualLogic = () => {
  const [formData, setFormData] = useState({
    plan: [],
    categoria: "",
    especialidad: [],
    provincia: "",
    localidad: "",
    direccion: "",
    nombre: "",
    telefono: JSON.stringify([]),
    email: "",
    informacion: "",
    atencionVirtual: false,
  })

  // Hooks para cada entidad ABM
  const { data: planes, loading: loadingPlanes, getAll: getPlanes } = useAbmApi("planes")
  const { data: categorias, loading: loadingCategorias, getAll: getCategorias } = useAbmApi("categorias")
  const { data: especialidades, loading: loadingEspecialidades, getAll: getEspecialidades } = useAbmApi("especialidades")
  const { data: provincias, loading: loadingProvincias, getAll: getProvincias } = useAbmApi("provincias")
  const { data: localidades, loading: loadingLocalidades, getLocalidadesByProvincia } = useAbmApi("localidades")
  const { loading: loadingCrearPrestador, createPrestador } = useAbmApi("prestadores")

  const [formStep, setFormStep] = useState(0)

  const loading = {
    planes: loadingPlanes,
    categorias: loadingCategorias,
    especialidades: loadingEspecialidades,
    provincias: loadingProvincias,
    localidades: loadingLocalidades,
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    getPlanes()
    getCategorias()
    getEspecialidades()
    getProvincias()
  }, [])

  // Verificar si es un profesional
  const esProfesional = () => {
    return formData.categoria &&
      categorias.some(cat =>
        cat.id_categoria.toString() === formData.categoria.toString() &&
        cat.nombre === "Profesionales");
  };

  // Función para validar teléfono con formato JSON
  const validarTelefono = (telefono) => {
    if (!telefono) return false;
    try {
      const phones = JSON.parse(telefono);
      return Array.isArray(phones) && phones.length > 0;
    } catch (e) {
      return false;
    }
  };

  // Función para validar email
  const validarEmail = (email) => {
    return email && email.toString().trim() !== "";
  };

  // NUEVA LÓGICA: Verificar si los campos obligatorios están completos según las reglas de negocio
  const camposObligatoriosCompletos = () => {
    const camposBasicos = {
      plan: (value) => Array.isArray(value) && value.length > 0,
      categoria: (value) => value && value.toString().trim() !== "",
      especialidad: (value) => Array.isArray(value) && value.length > 0,
      nombre: (value) => value && value.toString().trim() !== "",
      provincia: (value) => value && value.toString().trim() !== "",
      localidad: (value) => value && value.toString().trim() !== "",
    }

    // Verificar campos básicos
    const camposBasicosCompletos = Object.entries(camposBasicos).every(([campo, validator]) =>
      validator(formData[campo])
    );

    if (!camposBasicosCompletos) return false;

    const profesional = esProfesional();
    const atencionVirtual = formData.atencionVirtual;

    // REGLAS DE VALIDACIÓN SEGÚN EL TIPO DE PRESTADOR
    if (profesional && atencionVirtual) {
      // Profesional con atención virtual: Teléfono O Email obligatorio, dirección opcional
      const tieneContacto = validarTelefono(formData.telefono) || validarEmail(formData.email);
      return tieneContacto;
    } else {
      // Cualquier otro caso: Dirección obligatoria, teléfono y email opcionales
      const direccionValida = formData.direccion && formData.direccion.toString().trim() !== "";
      return direccionValida;
    }
  };

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }))
      return
    }

    if (Array.isArray(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))

      if (name === "provincia") {
        setFormData((prev) => ({ ...prev, localidad: "" }))
      }
    }
  }

  // Confirmar carga con validación mejorada
  const confirmarCarga = async (datosFormateados, createPrestador, limpiarFormulario, reset, setFormStep) => {
    // Validación adicional antes de enviar
    const profesional = esProfesional();
    const atencionVirtual = formData.atencionVirtual;

    let mensajeValidacion = "";

    if (profesional && atencionVirtual) {
      const tieneContacto = validarTelefono(formData.telefono) || validarEmail(formData.email);
      if (!tieneContacto) {
        mensajeValidacion = "Para profesionales con atención virtual, debe proporcionar al menos un teléfono o un email de contacto.";
      }
    } else {
      const direccionValida = formData.direccion && formData.direccion.toString().trim() !== "";
      if (!direccionValida) {
        mensajeValidacion = "La dirección es obligatoria para este tipo de prestador.";
      }
    }

    if (mensajeValidacion) {
      Swal.fire({
        title: "Datos incompletos",
        text: mensajeValidacion,
        icon: "warning",
        confirmButtonColor: "#64A70B",
      });
      return;
    }

    Swal.fire({
      title: "¿Confirmás la carga?",
      text: "Una vez confirmado, no podrás editar esta información desde aquí",
      icon: "warning",
      color: "#64A70B",
      showCancelButton: true,
      cancelButtonText: "Cancelar y volver",
      cancelButtonColor: "#d33",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#64A70B",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await createPrestador(datosFormateados)

          Swal.fire({
            title: "Prestador cargado correctamente",
            icon: "success",
            color: "#64A70B",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#64A70B",
          })

          limpiarFormulario(reset, setFormStep)
        } catch (error) {
          console.error("Error al crear el prestador:", error)
          Swal.fire({
            title: "Error al cargar el prestador",
            text: error.message || "Ha ocurrido un error al intentar crear el prestador.",
            icon: "error",
            color: "#d33",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#64A70B",
          })
        }
      }
    })
  }

  // Limpiar formulario
  const limpiarFormulario = (reset, setFormStep) => {
    const formDataInicial = {
      plan: [],
      categoria: "",
      especialidad: [],
      provincia: "",
      localidad: "",
      direccion: "",
      nombre: "",
      telefono: JSON.stringify([]),
      email: "",
      informacion: "",
      atencionVirtual: false,
    };

    setFormData(formDataInicial)
    reset(formDataInicial)
    setFormStep(0)
  }

  return {
    formData,
    setFormData,
    formStep,
    setFormStep,
    planes,
    categorias,
    especialidades,
    provincias,
    localidades,
    loading,
    loadingCrearPrestador,
    createPrestador,
    getLocalidadesByProvincia,
    esProfesional,
    camposObligatoriosCompletos,
    confirmarCarga,
    limpiarFormulario,
    handleChange,
    validarTelefono,
    validarEmail
  }
}