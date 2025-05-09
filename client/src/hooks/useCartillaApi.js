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

  // Función para cargar prestadores con paginación
  // En useCartillaApi.js, dentro de la función fetchPrestadores
  const fetchPrestadores = useCallback(async (page = 1) => {
    if (!formData.plan || !formData.provincia || !formData.localidad ||
      !formData.categoria || !formData.especialidad) {
      return;
    }

    setLoading((prev) => ({ ...prev, prestadores: true }));
    setShowResults(false);

    try {
      const response = await CartillaService.getPrestadores(
        formData.plan,
        formData.categoria,
        formData.provincia,
        formData.localidad,
        formData.especialidad,
        page,
        pagination.itemsPerPage
      );

      console.log("Respuesta completa de la API:", response); // Para depuración

      // Manejo más robusto de la respuesta
      if (!response) {
        throw new Error("La respuesta de la API está vacía");
      }

      // Verificar la estructura de la respuesta y adaptarse a ella
      let items = [];
      let paginationInfo = {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: pagination.itemsPerPage,
        hasNextPage: false,
        hasPrevPage: page > 1
      };

      // Intentar extraer los datos según diferentes posibles estructuras
      if (Array.isArray(response)) {
        // Si la respuesta es directamente un array de prestadores
        items = response;
        paginationInfo.totalItems = items.length;
      }
      else if (response.items && Array.isArray(response.items)) {
        // Si la respuesta tiene un formato {items: [...], pagination: {...}}
        items = response.items;
        paginationInfo = {
          ...paginationInfo,
          ...response.pagination
        };
      }
      else if (response.data && Array.isArray(response.data)) {
        // Si la respuesta tiene un formato {data: [...]}
        items = response.data;
        paginationInfo.totalItems = items.length;
      }
      else {
        // Último intento: buscar cualquier array en la respuesta
        const possibleArrays = Object.values(response).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          items = possibleArrays[0];
          paginationInfo.totalItems = items.length;
        }
      }

      setPrestadores(items);
      setPagination(prevPagination => ({
        ...prevPagination,
        ...paginationInfo
      }));

      setShowResults(true);
    } catch (error) {
      console.error("Error fetching prestadores:", error);
      setPrestadores([]);
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false
      });
      setShowResults(true);
    } finally {
      setLoading((prev) => ({ ...prev, prestadores: false }));
    }
  }, [formData, pagination.itemsPerPage]);

  // Manejador para cambiar de página
  const handlePageChange = (newPage) => {
    fetchPrestadores(newPage);
  };

  // Manejador para cambiar el tamaño de página
  const handlePageSizeChange = (newSize) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newSize
    }));
    fetchPrestadores(1); // Volver a la primera página con el nuevo tamaño
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

    fetchPrestadores(1); // Cargar la primera página de resultados
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