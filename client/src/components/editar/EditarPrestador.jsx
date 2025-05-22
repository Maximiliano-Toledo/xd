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
  import { isPhoneJsonFormat, normalizeOldPhoneFormat } from "../../utils/phoneFormatter";

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

    // Formulario de edición
    const [editForm, setEditForm] = useState({
      direccion: "",
      telefonos: "",
      email: "",
      informacion_adicional: "",
      estado: "",
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

    // UseEffect para detectar cuando los prestadores han sido cargados
    useEffect(() => {
      // Cuando hay resultados disponibles y hay prestadores, y no está cargando
      if (showResults && prestadores.length > 0 && !loading.prestadores) {
        setCurrentStep(2); // Cambiar automáticamente al paso de resultados
      }
    }, [showResults, prestadores, loading.prestadores]);

    // UseEffect para verificar el formato de teléfonos al seleccionar un prestador
    useEffect(() => {
      if (selectedPrestador?.telefonos) {
        // Verificar si está en formato JSON
        const isJsonFormat = isPhoneJsonFormat(selectedPrestador.telefonos);
        setPhonesNeedNormalization(!isJsonFormat);

        // Si ya está en formato JSON, marcarlo como ya normalizado
        if (isJsonFormat) {
          setPhoneNormalizationDone(true);
        }
      }
    }, [selectedPrestador]);

    // Adaptador de opciones para CustomSelect
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

    // Manejar búsqueda
    const handleSearchFormSubmit = async (e) => {
      e.preventDefault();
      await handleSearchSubmit(e);
    };

    // Manejar volver
    const handleVolver = () => navigate(-1);

    // Limpiar campo estado si se oculta con el botón "Ocultar opciones"
    const handleOcultarOpciones = () => {
      if (mostrarOpcionesEstado) {
        setEditForm({ ...editForm, estado: selectedPrestador.estado });
      }
      setMostrarOpcionesEstado(!mostrarOpcionesEstado);
    };

    // Seleccionar prestador para editar
    const handleSelectPrestador = (prestador) => {
      setSelectedPrestador(prestador);
      setOriginalData({
        direccion: prestador.direccion || "",
        telefonos: prestador.telefonos || "",
        email: prestador.email || "",
        informacion_adicional: prestador.informacion_adicional || "",
        estado: prestador.estado,
      });

      setEditForm({
        direccion: prestador.direccion || "",
        telefonos: prestador.telefonos || "",
        email: prestador.email || "",
        informacion_adicional: prestador.informacion_adicional || "",
        estado: prestador.estado,
      });

      setCurrentStep(3); // Ir a edición
    };

    // Manejar cambios en el formulario de edición
    const handleEditChange = (e) => {
      const { name, value } = e.target;
      setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    // Función para normalizar automáticamente los teléfonos
    const handleNormalizePhones = () => {
      if (!selectedPrestador || !selectedPrestador.telefonos) return;

      try {
        // Obtener el formato normalizado
        const normalizedPhones = normalizeOldPhoneFormat(selectedPrestador.telefonos);

        // Actualizar en el formulario
        setEditForm(prev => ({
          ...prev,
          telefonos: normalizedPhones
        }));

        // Marcar como normalizado
        setPhonesNeedNormalization(false);
        setPhoneNormalizationDone(true);

        // Mostrar mensaje de éxito
        Swal.fire({
          title: "Teléfonos normalizados",
          text: "Los datos telefónicos han sido convertidos al nuevo formato estructurado.",
          icon: "success",
          confirmButtonColor: "#64A70B"
        });
      } catch (error) {
        console.error("Error al normalizar teléfonos:", error);
        Swal.fire({
          title: "Error al normalizar",
          text: "No se pudieron normalizar los teléfonos. Por favor, inténtelo manualmente.",
          icon: "error",
          confirmButtonColor: "#d33"
        });
      }
    };

    // Verificar si hay cambios pendientes
    const hasChanges = () => {
      return Object.keys(getChangedFields()).length > 0;
    };

    // Determinar qué campos han cambiado
    const getChangedFields = () => {
      const changes = {};
      Object.keys(editForm).forEach((key) => {
        if (editForm[key] !== originalData[key]) {
          changes[key] = editForm[key];
        }
      });
      return changes;
    };

    // Confirmar edición
    const confirmarEdicion = async () => {
      if (!selectedPrestador) return;

      // Si aún necesita normalización y no se ha completado, mostrar error
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

          // Resetear estado de normalización tras guardar exitosamente
          setPhonesNeedNormalization(false);
          setPhoneNormalizationDone(false);

          // Volver a la búsqueda
          setCurrentStep(1);
          setSelectedPrestador(null);
          setOriginalData(null);
        }
      } catch (error) {
        console.error("Error al actualizar prestador:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo actualizar el prestador",
          icon: "error",
        });
      }
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
          goToResults={() => setCurrentStep(2)}
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