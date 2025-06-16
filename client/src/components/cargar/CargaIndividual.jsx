"use client"

import { MdSubdirectoryArrowLeft } from "react-icons/md"
import { Footer } from "../../layouts/Footer"
import HeaderStaff from "../../layouts/HeaderStaff"
import "../../styles/carga-individual.css"
import "../../styles/cargar-cartilla.css"
import { useNavigate } from "react-router"
import Swal from "sweetalert2"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useAbmApi } from "../../hooks/useAbmApi"
import '../../styles/panel-usuario-nuevo.css'

// Importar componentes
import FormWizard from "./components/FormWizard"
import { useCargaIndividualLogic } from "../../hooks/useCargaIndividualLogic"

export const CargaIndividual = () => {
  const navigate = useNavigate()

  // Hook personalizado con toda la lógica
  const {
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
  } = useCargaIndividualLogic()

  const handleVolver = () => {
    navigate(-1)
  }

  /*react-hook-form */
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm({
    mode: "onChange",
  })

  const onSubmit = handleSubmit((data) => {
    // Verificar si es un profesional con atención virtual
    const profesional = esProfesional();
    const atencionVirtual = data.atencionVirtual;

    // Validación final antes de enviar
    if (profesional && atencionVirtual) {
      // Para profesionales con atención virtual: al menos teléfono o email
      const tieneContacto = validarTelefono(data.telefono) || validarEmail(data.email);
      if (!tieneContacto) {
        Swal.fire({
          title: "Datos de contacto incompletos",
          text: "Para profesionales con atención virtual debe proporcionar al menos un teléfono o email de contacto.",
          icon: "warning",
          confirmButtonColor: "#64A70B",
        });
        return;
      }
    } else {
      // Para otros prestadores: dirección obligatoria
      if (!data.direccion || data.direccion.trim() === "") {
        Swal.fire({
          title: "Dirección requerida",
          text: "La dirección es obligatoria para este tipo de prestador.",
          icon: "warning",
          confirmButtonColor: "#64A70B",
        });
        return;
      }
    }

    // Parsear los teléfonos desde el formato JSON
    let telefonos = "";
    try {
      if (data.telefono && typeof data.telefono === 'string') {
        telefonos = data.telefono;
      }
    } catch (error) {
      console.error("Error al procesar teléfonos:", error);
      telefonos = JSON.stringify([]);
    }

    // Formatear los datos para enviar al servidor
    const datosFormateados = {
      nombre: data.nombre,
      direccion: data.direccion || "",
      telefonos: telefonos,
      email: data.email || "",
      informacion_adicional: data.informacion || "",
      estado: "Activo",
      id_localidad: Number.parseInt(formData.localidad),
      categorias: [Number.parseInt(formData.categoria)],
      especialidades: formData.especialidad.map((id) => Number.parseInt(id)),
      planes: formData.plan.map((id) => Number.parseInt(id)),
      atencion_virtual: profesional && data.atencionVirtual ? "Si" : "No",
    }

    console.log("Datos a enviar:", datosFormateados);
    confirmarCarga(datosFormateados, createPrestador, limpiarFormulario, reset, setFormStep);
  })

  return (
    <div>
      <HeaderStaff />
      <h1 className="w-50 fs-5 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 ms-4 me-4 ">
        Carga individual
      </h1>
      <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
        <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5 ms-4 me-4">
          <h6 className="fs-3 h1-titulo fw-bold ">Cargar un prestador.</h6>
        </div>
      </div>

      <FormWizard
        formData={formData}
        setFormData={setFormData}
        formStep={formStep}
        setFormStep={setFormStep}
        planes={planes}
        categorias={categorias}
        especialidades={especialidades}
        provincias={provincias}
        localidades={localidades}
        loading={loading}
        loadingCrearPrestador={loadingCrearPrestador}
        getLocalidadesByProvincia={getLocalidadesByProvincia}
        esProfesional={esProfesional}
        camposObligatoriosCompletos={camposObligatoriosCompletos}
        handleChange={handleChange}
        onSubmit={onSubmit}
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        validarTelefono={validarTelefono}
        validarEmail={validarEmail}
      />

      <div className="back-button-container">
        <button className="back-button" onClick={handleVolver}>
          <MdSubdirectoryArrowLeft />
          <span>Volver</span>
        </button>
      </div>

      <Footer />
    </div>
  )
}