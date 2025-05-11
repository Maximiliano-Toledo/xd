import { useState, useEffect, useCallback } from "react";
import { CartillaService } from "../api/services/cartillaService";

export const useCartillaApi = () => {
  const initialState = {
    plan: "",
    provincia: "",
    localidad: "",
    categoria: "",
    especialidad: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [options, setOptions] = useState({
    planes: [],
    provincias: [],
    localidades: [],
    categorias: [],
    especialidades: [],
  });
  const [loading, setLoading] = useState({
    planes: false,
    provincias: false,
    localidades: false,
    categorias: false,
    especialidades: false,
    prestadores: false,
  });
  const [prestadores, setPrestadores] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Estado para paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchData = async (
    fetchFn,
    loadingKey,
    optionsKey,
    resetFields = {}
  ) => {
    setLoading((prev) => ({ ...prev, [loadingKey]: true }));
    try {
      const data = await fetchFn();

      setOptions((prev) => ({
        ...prev,
        [optionsKey]: data,
        ...(optionsKey === "provincias" && {
          localidades: [],
          categorias: [],
          especialidades: [],
        }),
        ...(optionsKey === "localidades" && {
          categorias: [],
          especialidades: [],
        }),
        ...(optionsKey === "categorias" && { especialidades: [] }),
      }));

      setFormData((prev) => ({ ...prev, ...resetFields }));
    } catch (error) {
      console.error(`Error fetching ${optionsKey}:`, error);
      // Aquí podrías usar un toast de notificación
    } finally {
      setLoading((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  // Efectos para cargar datos
  useEffect(() => {
    fetchData(CartillaService.getPlanes, "planes", "planes");
  }, []);

  useEffect(() => {
    if (!formData.plan) return;
    fetchData(
      () => CartillaService.getProvincias(formData.plan),
      "provincias",
      "provincias",
      { provincia: "", localidad: "", categoria: "", especialidad: "" }
    );
  }, [formData.plan]);

  useEffect(() => {
    if (!formData.plan || !formData.provincia) return;

    fetchData(
      () =>
        CartillaService.getLocalidades(formData.plan, formData.provincia),
      "localidades",
      "localidades",
      {
        localidad: "",
        categoria: "",
        especialidad: "",
      }
    );
  }, [formData.provincia, formData.plan]);

  useEffect(() => {
    if (!formData.plan || !formData.localidad) return;

    fetchData(
      () =>
        CartillaService.getCategorias(formData.plan, formData.localidad),
      "categorias",
      "categorias",
      {
        categoria: "",
        especialidad: "",
      }
    );
  }, [formData.localidad, formData.plan]);

  useEffect(() => {
    if (
      !formData.plan ||
      !formData.localidad ||
      !formData.provincia ||
      !formData.categoria
    )
      return;

    fetchData(
      () =>
        CartillaService.getEspecialidades(
          formData.plan,
          formData.categoria,
          formData.provincia,
          formData.localidad
        ),
      "especialidades",
      "especialidades",
      {
        especialidad: "",
      }
    );
  }, [
    formData.localidad,
    formData.provincia,
    formData.categoria,
    formData.plan,
  ]);

  // Función corregida para cargar prestadores con paginación
  const fetchPrestadores = useCallback(async (page = 1, pageSize = pagination.itemsPerPage, isPageChange = false) => {
    if (!formData.plan || !formData.provincia || !formData.localidad ||
      !formData.categoria || !formData.especialidad) {
      return;
    }

    setLoading((prev) => ({ ...prev, prestadores: true }));

    // Solo ocultar los resultados si no es un cambio de página
    if (!isPageChange) {
      setShowResults(false);
    }

    try {
      const response = await CartillaService.getPrestadores(
        formData.plan,
        formData.categoria,
        formData.provincia,
        formData.localidad,
        formData.especialidad,
        page,
        pageSize
      );

      // Verificar si la respuesta tiene la estructura esperada
      if (!response || !response.data) {
        throw new Error("La respuesta de la API no tiene la estructura esperada");
      }

      // Extraer los datos según la estructura real
      const items = response.data.items || [];
      const paginationInfo = response.data.pagination || {
        currentPage: page,
        totalPages: 1,
        totalItems: items.length,
        itemsPerPage: pageSize,
        hasNextPage: false,
        hasPrevPage: page > 1
      };

      setPrestadores(items);
      setPagination(prevPagination => ({
        ...prevPagination,
        ...paginationInfo,
        itemsPerPage: pageSize,
        currentPage: page
      }));

      setShowResults(true);
    } catch (error) {
      console.error("Error fetching prestadores:", error);
      setPrestadores([]);
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: pageSize,
        hasNextPage: false,
        hasPrevPage: false
      });
      setShowResults(true);
    } finally {
      setLoading((prev) => ({ ...prev, prestadores: false }));
    }
  }, [formData, pagination.itemsPerPage]);

  // Manejador para cambiar de página modificado para no resetear la vista
  const handlePageChange = (newPage) => {
    // Pasar true como tercer parámetro para indicar que es un cambio de página
    fetchPrestadores(newPage, pagination.itemsPerPage, true);
  };

  // Manejador para cambiar el tamaño de página
  const handlePageSizeChange = (newSize) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newSize,
      currentPage: 1
    }));

    // Aquí usamos true como tercer parámetro también para mantener consistencia
    fetchPrestadores(1, newSize, true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "plan",
      "provincia",
      "localidad",
      "categoria",
      "especialidad",
    ];

    if (requiredFields.some((field) => !formData[field])) {
      alert("Complete todos los campos obligatorios");
      return;
    }

    // Aquí no usamos el parámetro isPageChange ya que es una búsqueda inicial
    fetchPrestadores(1, pagination.itemsPerPage, false);
  };

  return {
    formData,
    options,
    loading,
    prestadores,
    showResults,
    pagination,
    handleChange: (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    handleSubmit,
    handlePageChange,
    handlePageSizeChange
  };
};