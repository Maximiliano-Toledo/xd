import { useState, useEffect } from 'react';
import { useAbmApi } from './useAbmApi';
import { useCartillaApi } from './useCartillaApi';
import { isPhoneJsonFormat, normalizeOldPhoneFormat } from '../utils/phoneFormatter';
import Swal from 'sweetalert2';

/**
 * Hook personalizado para manejar la lógica de edición de prestadores
 */
export const useEditarPrestadorLogic = () => {
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
  } = useCartillaApi(true); // edit = true

  // Hook para actualizar prestador
  const { updatePrestador } = useAbmApi("prestadores");

  // Formulario de edición
  const [editForm, setEditForm] = useState({
    direccion: "",
    telefonos: "",
    email: "",
    informacion_adicional: "",
    estado: "",
    atencion_virtual: "No",
  });

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

  // Verificar si es un profesional
  const esProfesional = () => {
    if (!selectedPrestador?.categorias || !Array.isArray(selectedPrestador.categorias)) {
      return false;
    }

    return selectedPrestador.categorias.some(cat =>
      cat.nombre === "Profesionales" || cat.categoria_nombre === "Profesionales"
    );
  };

  // Seleccionar prestador para editar
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
    setCurrentStep(3);
  };

  // Manejar cambios en el formulario de edición
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

  // Manejar cambios específicos para atención virtual
  const handleAtencionVirtualChange = (isChecked) => {
    setEditForm(prev => ({
      ...prev,
      atencion_virtual: isChecked ? "Si" : "No",
      // Si se marca atención virtual y es profesional, limpiar dirección
      ...(isChecked && esProfesional() && { direccion: "" })
    }));
  };

  // Función para normalizar automáticamente los teléfonos
  const handleNormalizePhones = () => {
    if (!selectedPrestador || !selectedPrestador.telefonos) return;

    try {
      const normalizedPhones = normalizeOldPhoneFormat(selectedPrestador.telefonos);

      setEditForm(prev => ({
        ...prev,
        telefonos: normalizedPhones
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

  // Limpiar campo estado si se oculta con el botón "Ocultar opciones"
  const handleOcultarOpciones = () => {
    if (mostrarOpcionesEstado) {
      setEditForm({ ...editForm, estado: selectedPrestador.estado });
    }
    setMostrarOpcionesEstado(!mostrarOpcionesEstado);
  };

  // Confirmar edición
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
        console.log("Campos que se van a actualizar:", changedFields);

        await updatePrestador(selectedPrestador.id_prestador, changedFields);

        Swal.fire({
          title: "¡Editado!",
          text: "El prestador ha sido actualizado correctamente",
          icon: "success",
        });

        // Resetear estados
        setPhonesNeedNormalization(false);
        setPhoneNormalizationDone(false);
        setCurrentStep(1);
        setSelectedPrestador(null);
        setOriginalData(null);
        setMostrarOpcionesEstado(false);
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

  // Manejar búsqueda
  const handleSearchFormSubmit = async (e) => {
    e.preventDefault();
    await handleSearchSubmit(e);
  };

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

  return {
    // Estados
    currentStep,
    setCurrentStep,
    selectedPrestador,
    originalData,
    mostrarOpcionesEstado,
    phonesNeedNormalization,
    phoneNormalizationDone,
    editForm,
    setEditForm,

    // Datos de la API
    formData,
    options,
    loading,
    prestadores,
    pagination,

    // Funciones de manejo
    handleChange,
    handleSearchFormSubmit,
    handlePageChange,
    handleSearchMethodChange,
    handleSelectPrestador,
    handleEditChange,
    handleAtencionVirtualChange,
    handleNormalizePhones,
    handleOcultarOpciones,
    confirmarEdicion,

    // Funciones de utilidad
    hasChanges,
    getChangedFields,
    esProfesional,
    adaptarOpciones,

    // Setters para componentes hijos
    setPhonesNeedNormalization,
    setPhoneNormalizationDone,
  };
};