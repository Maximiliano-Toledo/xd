"use client"

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { FiSearch } from "react-icons/fi";
import { MdSubdirectoryArrowLeft } from "react-icons/md";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { useForm } from "react-hook-form";

// Componentes
import HeaderStaff from "../../layouts/HeaderStaff";
import { Footer } from "../../layouts/Footer";
import CustomSelect from "../CustomSelect";
import LiveAlert from "../utils/LiveAlert";
import SearchMethodTabs from "../cartilla/SearchMethodTabs";
import PhoneInput from "../../utils/PhoneInput";

// Hooks y Utilidades
import { useAbmApi } from "../../hooks/useAbmApi";
import { useCartillaApi } from "../../hooks/useCartillaApi";
import { isPhoneJsonFormat, normalizePhoneWithPrefixes } from "../../utils/phoneFormatter";

// Estilos
import "../../styles/cargar-cartilla.css";
import "../../styles/dashboard.css";
import "../../styles/carga-individual.css";
import "../../styles/panel-usuario-nuevo.css";
import SearchStep from "./steps/SearchStep.jsx";
import ResultsStep from "./steps/ResultsStep.jsx";
import EditStep from "./steps/EditStep.jsx";

const EditarPrestador = () => {
  const edit = true;
  const navigate = useNavigate();

  // Estados para el wizard
  const [currentStep, setCurrentStep] = useState(1); // 1: Búsqueda, 2: Resultados, 3: Edición
  const [selectedPrestador, setSelectedPrestador] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [mostrarOpcionesEstado, setMostrarOpcionesEstado] = useState(false);

  // Estados para la normalización de teléfonos
  const [phonesNeedNormalization, setPhonesNeedNormalization] = useState(false);
  const [phoneNormalizationDone, setPhoneNormalizationDone] = useState(false);

  // Hook para la búsqueda de prestadores
  const {
    formData,
    options,
    loading,
    prestadores,
    showResults,
    pagination,
    handleChange,
    handleSubmit: handleSearchSubmit,
    handlePageChange,
    handlePageSizeChange,
    handleSearchMethodChange,
  } = useCartillaApi(edit);

  // Hook para actualizar prestador
  const { updatePrestador } = useAbmApi("prestadores");

  // Formulario de edición - ahora incluye atencion_virtual
  const [editForm, setEditForm] = useState({
    direccion: "",
    telefonos: "",
    email: "",
    informacion_adicional: "",
    estado: "",
    atencion_virtual: "No",
  });

  // UseForm para validación
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm({
    mode: "onChange"
  });

  // NUEVAS FUNCIONES DE VALIDACIÓN
  const validarTelefono = (telefono) => {
    if (!telefono) return false;
    try {
      const phones = JSON.parse(telefono);
      return Array.isArray(phones) && phones.length > 0;
    } catch (e) {
      return telefono.trim() !== "";
    }
  };

  const validarEmail = (email) => {
    return email && email.toString().trim() !== "";
  };

  const esProfesionalConAtencionVirtual = () => {
    if (!selectedPrestador?.categorias || !Array.isArray(selectedPrestador.categorias)) {
      return false;
    }

    const esProfesional = selectedPrestador.categorias.some(cat =>
      cat.nombre === "Profesionales" || cat.categoria_nombre === "Profesionales"
    );

    const tieneAtencionVirtual = editForm.atencion_virtual === "Si";

    return esProfesional && tieneAtencionVirtual;
  };

  // UseEffect para detectar cuando los prestadores han sido cargados
  useEffect(() => {
    if (showResults && prestadores.length > 0 && !loading.prestadores) {
      setCurrentStep(2);
    }
  }, [showResults, prestadores, loading.prestadores]);

  // UseEffect para verificar el formato de teléfonos al seleccionar un prestador
  useEffect(() => {
    if (selectedPrestador?.telefonos) {
      const isJsonFormat = isPhoneJsonFormat(selectedPrestador.telefonos);
      setPhonesNeedNormalization(!isJsonFormat);
      if (isJsonFormat) {
        setPhoneNormalizationDone(true);
      }
    }
  }, [selectedPrestador]);

  const resetEditState = () => {
    if (selectedPrestador) {
      const originalEditForm = {
        direccion: selectedPrestador.direccion || "",
        telefonos: selectedPrestador.telefonos || "",
        email: selectedPrestador.email || "",
        informacion_adicional: selectedPrestador.informacion_adicional || "",
        estado: selectedPrestador.estado,
        atencion_virtual: selectedPrestador.atencion_virtual || "No",
      };

      setEditForm(originalEditForm);
      setPhonesNeedNormalization(false);
      setPhoneNormalizationDone(false);

      if (selectedPrestador?.telefonos) {
        const isJsonFormat = isPhoneJsonFormat(selectedPrestador.telefonos);
        setPhonesNeedNormalization(!isJsonFormat);
        setPhoneNormalizationDone(isJsonFormat);
      }
    }
  };

  const adaptarOpciones = (opciones, idKey, nombreKey) => {
    if (idKey === "id_prestador") {
      return opciones.map((opcion) => ({
        id: opcion[nombreKey],
        nombre: opcion[nombreKey],
        originalId: opcion[idKey],
      }));
    }
    return opciones.map((opcion) => ({
      id: opcion[idKey],
      nombre: opcion[nombreKey],
    }));
  };

  const handleSearchFormSubmit = async (e) => {
    e.preventDefault();
    await handleSearchSubmit(e);
  };

  const handleVolver = () => navigate(-1);

  const handleOcultarOpciones = () => {
    if (mostrarOpcionesEstado) {
      setEditForm({ ...editForm, estado: selectedPrestador.estado });
    }
    setMostrarOpcionesEstado(!mostrarOpcionesEstado);
  };

  const handleSelectPrestador = (prestador) => {
    setSelectedPrestador(prestador);

    const initialData = {
      direccion: prestador.direccion || "",
      telefonos: prestador.telefonos || "",
      email: prestador.email || "",
      informacion_adicional: prestador.informacion_adicional || "",
      estado: prestador.estado,
      atencion_virtual: prestador.atencion_virtual || "No",
    };

    setOriginalData(initialData);
    setEditForm(initialData);

    setPhonesNeedNormalization(false);
    setPhoneNormalizationDone(false);

    if (prestador?.telefonos) {
      const isJsonFormat = isPhoneJsonFormat(prestador.telefonos);
      setPhonesNeedNormalization(!isJsonFormat);
      setPhoneNormalizationDone(isJsonFormat);
    }

    setCurrentStep(3);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setEditForm((prev) => ({
        ...prev,
        [name]: checked ? "Si" : "No"
      }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNormalizePhones = (normalizedPhonesValue) => {
    if (!selectedPrestador) return;

    try {
      let finalNormalizedValue;

      if (normalizedPhonesValue) {
        finalNormalizedValue = typeof normalizedPhonesValue === 'string'
          ? normalizedPhonesValue
          : JSON.stringify(normalizedPhonesValue);
      } else {
        const normalizedPhones = normalizePhoneWithPrefixes(selectedPrestador.telefonos);
        finalNormalizedValue = normalizedPhones;
      }

      setEditForm(prev => ({
        ...prev,
        telefonos: finalNormalizedValue
      }));

      setPhonesNeedNormalization(false);
      setPhoneNormalizationDone(true);

      Swal.fire({
        title: "Teléfonos normalizados",
        text: "Los datos telefónicos han sido convertidos al nuevo formato estructurado.",
        icon: "success",
        confirmButtonColor: "#64A70B"
      });
    } catch (error) {
      Swal.fire({
        title: "Error al normalizar",
        text: "No se pudieron normalizar los teléfonos. Por favor, inténtelo manualmente.",
        icon: "error",
        confirmButtonColor: "#d33"
      });
    }
  };

  const hasChanges = () => {
    return Object.keys(getChangedFields()).length > 0;
  };

  const getChangedFields = () => {
    const changes = {};
    Object.keys(editForm).forEach((key) => {
      if (editForm[key] !== originalData[key]) {
        changes[key] = editForm[key];
      }
    });
    return changes;
  };

  // VALIDACIÓN MEJORADA: Confirmar edición con validaciones condicionales
  const confirmarEdicion = async () => {
    if (!selectedPrestador) return;

    if (phonesNeedNormalization && !phoneNormalizationDone) {
      Swal.fire({
        title: "Normalización pendiente",
        text: "Debe normalizar los teléfonos antes de guardar los cambios.",
        icon: "warning",
        confirmButtonColor: "#d33"
      });
      return;
    }

    const changedFields = getChangedFields();
    if (Object.keys(changedFields).length === 0) {
      Swal.fire({
        title: "Sin cambios",
        text: "No se detectaron cambios para guardar",
        icon: "info",
      });
      return;
    }

    // VALIDACIÓN CONDICIONAL SEGÚN TIPO DE PRESTADOR
    if (esProfesionalConAtencionVirtual()) {
      // Profesional con atención virtual: al menos teléfono o email
      const tieneContacto = validarTelefono(editForm.telefonos) || validarEmail(editForm.email);
      if (!tieneContacto) {
        Swal.fire({
          title: "Datos de contacto incompletos",
          text: "Para profesionales con atención virtual debe proporcionar al menos un teléfono o email de contacto.",
          icon: "warning",
          confirmButtonColor: "#d33"
        });
        return;
      }
    } else {
      // Otros prestadores: dirección obligatoria
      if (!editForm.direccion || editForm.direccion.trim() === "") {
        Swal.fire({
          title: "Dirección requerida",
          text: "La dirección es obligatoria para este tipo de prestador.",
          icon: "warning",
          confirmButtonColor: "#d33"
        });
        return;
      }
    }

    try {
      const result = await Swal.fire({
        title: "¿Confirmás la edición?",
        text: `Vas a editar el prestador: ${selectedPrestador.nombre}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {

        await updatePrestador(selectedPrestador.id_prestador, changedFields);

        Swal.fire({
          title: "¡Editado!",
          text: "El prestador ha sido actualizado correctamente",
          icon: "success",
        });

        setPhonesNeedNormalization(false);
        setPhoneNormalizationDone(false);

        setCurrentStep(1);
        setSelectedPrestador(null);
        setOriginalData(null);
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el prestador",
        icon: "error",
      });
    }
  };

  const goToResults = () => {
    resetEditState();
    setMostrarOpcionesEstado(false);
    setCurrentStep(2);
  };

  return (
    <div>
      <HeaderStaff />

      {currentStep === 1 && <SearchStep
        formData={formData}
        options={options}
        loading={loading}
        handleChange={handleChange}
        handleSubmit={handleSearchFormSubmit}
        handleMethodChange={handleSearchMethodChange}
        adaptarOpciones={adaptarOpciones}
      />}

      {currentStep === 2 && <ResultsStep
        prestadores={prestadores}
        loading={loading}
        pagination={pagination}
        handlePageChange={handlePageChange}
        handleSelectPrestador={handleSelectPrestador}
        goToSearch={() => setCurrentStep(1)}
      />}

      {currentStep === 3 && <EditStep
        selectedPrestador={selectedPrestador}
        editForm={editForm}
        formData={formData}
        options={options}
        handleEditChange={handleEditChange}
        confirmarEdicion={confirmarEdicion}
        mostrarOpcionesEstado={mostrarOpcionesEstado}
        handleOcultarOpciones={handleOcultarOpciones}
        goToResults={goToResults}
        hasChanges={hasChanges}
        phonesNeedNormalization={phonesNeedNormalization}
        phoneNormalizationDone={phoneNormalizationDone}
        handleNormalizePhones={handleNormalizePhones}
        setPhonesNeedNormalization={setPhonesNeedNormalization}
        setPhoneNormalizationDone={setPhoneNormalizationDone}
        setEditForm={setEditForm}
      />}

      <div className="back-button-container">
        <button className="back-button" onClick={handleVolver}>
          <MdSubdirectoryArrowLeft />
          <span>Volver</span>
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default EditarPrestador;