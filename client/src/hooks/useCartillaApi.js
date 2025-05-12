"use client"

import { useState, useEffect, useCallback } from "react"
import { CartillaService } from "../api/services/cartillaService"

export const useCartillaApi = () => {
  const initialState = {
    plan: "",
    provincia: "",
    localidad: "",
    categoria: "",
    especialidad: "",
    nombrePrestador: "",
    searchMethod: "normal", // 'normal' o 'porNombre'
    especialidadesPrestador: [],
  }

  const [formData, setFormData] = useState(initialState)
  const [options, setOptions] = useState({
    planes: [],
    provincias: [],
    localidades: [],
    categorias: [],
    especialidades: [],
    nombresPrestadores: [],
    especialidadesPrestador: [],
  })
  const [loading, setLoading] = useState({
    planes: false,
    provincias: false,
    localidades: false,
    categorias: false,
    especialidades: false,
    prestadores: false,
    nombresPrestadores: false,
    especialidadesPrestador: false,
  })
  const [prestadores, setPrestadores] = useState([])
  const [showResults, setShowResults] = useState(false)

  // Estado para paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  })

  const fetchData = async (fetchFn, loadingKey, optionsKey, resetFields = {}) => {
    setLoading((prev) => ({ ...prev, [loadingKey]: true }))
    try {
      const data = await fetchFn()

      setOptions((prev) => ({
        ...prev,
        [optionsKey]: data,
        ...(optionsKey === "provincias" && {
          localidades: [],
          categorias: [],
          especialidades: [],
          nombresPrestadores: [],
          especialidadesPrestador: [],
        }),
        ...(optionsKey === "localidades" && {
          categorias: [],
          especialidades: [],
          nombresPrestadores: [],
          especialidadesPrestador: [],
        }),
        ...(optionsKey === "categorias" && {
          especialidades: [],
          nombresPrestadores: [],
          especialidadesPrestador: [],
        }),
      }))

      setFormData((prev) => ({ ...prev, ...resetFields }))
    } catch (error) {
      console.error(`Error fetching ${optionsKey}:`, error)
    } finally {
      setLoading((prev) => ({ ...prev, [loadingKey]: false }))
    }
  }

  // Efectos para cargar datos
  useEffect(() => {
    fetchData(CartillaService.getPlanes, "planes", "planes")
  }, [])

  useEffect(() => {
    if (!formData.plan) return
    fetchData(() => CartillaService.getProvincias(formData.plan), "provincias", "provincias", {
      provincia: "",
      localidad: "",
      categoria: "",
      especialidad: "",
      nombrePrestador: "",
      especialidadesPrestador: [],
    })
  }, [formData.plan])

  useEffect(() => {
    if (!formData.plan || !formData.provincia) return
    fetchData(() => CartillaService.getLocalidades(formData.plan, formData.provincia), "localidades", "localidades", {
      localidad: "",
      categoria: "",
      especialidad: "",
      nombrePrestador: "",
      especialidadesPrestador: [],
    })
  }, [formData.provincia, formData.plan])

  useEffect(() => {
    if (!formData.plan || !formData.localidad) return
    fetchData(() => CartillaService.getCategorias(formData.plan, formData.localidad), "categorias", "categorias", {
      categoria: "",
      especialidad: "",
      nombrePrestador: "",
      especialidadesPrestador: [],
    })
  }, [formData.localidad, formData.plan])

  // Efecto para cargar especialidades en búsqueda normal
  useEffect(() => {
    if (
      !formData.plan ||
      !formData.localidad ||
      !formData.provincia ||
      !formData.categoria ||
      formData.searchMethod !== "normal"
    )
      return

    fetchData(
      () =>
        CartillaService.getEspecialidades(formData.plan, formData.categoria, formData.provincia, formData.localidad),
      "especialidades",
      "especialidades",
      {
        especialidad: "",
      },
    )
  }, [formData.localidad, formData.provincia, formData.categoria, formData.plan, formData.searchMethod])

  // Efecto para cargar nombres de prestadores en búsqueda por nombre
  useEffect(() => {
    if (
      !formData.plan ||
      !formData.provincia ||
      !formData.localidad ||
      !formData.categoria ||
      formData.searchMethod !== "porNombre"
    )
      return

    fetchData(
      () =>
        CartillaService.getNombrePrestadores(formData.plan, formData.provincia, formData.localidad, formData.categoria),
      "nombresPrestadores",
      "nombresPrestadores",
      {
        nombrePrestador: "",
        especialidad: "",
        especialidadesPrestador: [],
      },
    )
  }, [formData.plan, formData.provincia, formData.localidad, formData.categoria, formData.searchMethod])

  // Efecto para cargar especialidades del prestador seleccionado
  useEffect(() => {
    if (
      !formData.plan ||
      !formData.provincia ||
      !formData.localidad ||
      !formData.categoria ||
      !formData.nombrePrestador ||
      formData.searchMethod !== "porNombre"
    )
      return

    fetchData(
      () =>
        CartillaService.getEspecialidadesPrestador(
          formData.plan,
          formData.provincia,
          formData.localidad,
          formData.categoria,
          formData.nombrePrestador,
        ),
      "especialidadesPrestador",
      "especialidadesPrestador",
      {
        especialidad: "",
      },
    )
  }, [
    formData.nombrePrestador,
    formData.plan,
    formData.provincia,
    formData.localidad,
    formData.categoria,
    formData.searchMethod,
  ])

  // Función para cargar prestadores con paginación (búsqueda normal)
  const fetchPrestadoresNormal = useCallback(
    async (page = 1, pageSize = pagination.itemsPerPage, isPageChange = false) => {
      if (
        !formData.plan ||
        !formData.provincia ||
        !formData.localidad ||
        !formData.categoria ||
        !formData.especialidad
      ) {
        return
      }

      setLoading((prev) => ({ ...prev, prestadores: true }))

      if (!isPageChange) {
        setShowResults(false)
      }

      try {
        const response = await CartillaService.getPrestadores(
          formData.plan,
          formData.categoria,
          formData.provincia,
          formData.localidad,
          formData.especialidad,
          page,
          pageSize,
        )

        console.log("Respuesta completa de getPrestadores:", response)

        // Manejar diferentes estructuras de respuesta
        let items = []
        let paginationInfo = {
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: pageSize,
          hasNextPage: false,
          hasPrevPage: page > 1,
        }

        if (response) {
          if (Array.isArray(response)) {
            // Si es un array, tomamos el primer elemento
            const firstItem = response[0]
            if (firstItem && firstItem.items) {
              items = firstItem.items
              paginationInfo = {
                ...paginationInfo,
                ...firstItem.pagination,
                itemsPerPage: pageSize,
                currentPage: page,
              }
            } else if (Array.isArray(firstItem)) {
              // Si el primer elemento es un array, lo usamos directamente
              items = firstItem
              paginationInfo.totalItems = firstItem.length
            } else {
              // Si no tiene estructura esperada pero es un array, lo usamos directamente
              items = response
              paginationInfo.totalItems = response.length
            }
          } else if (response.items) {
            // Si tiene una propiedad items, la usamos
            items = response.items
            paginationInfo = {
              ...paginationInfo,
              ...response.pagination,
              itemsPerPage: pageSize,
              currentPage: page,
            }
          } else if (response.data && response.data.items) {
            // Si tiene una estructura data.items
            items = response.data.items
            paginationInfo = {
              ...paginationInfo,
              ...response.data.pagination,
              itemsPerPage: pageSize,
              currentPage: page,
            }
          } else {
            // Si no tiene ninguna estructura esperada, asumimos que es la lista directamente
            items = response
            paginationInfo.totalItems = response.length
          }
        }

        console.log("Items procesados:", items)
        console.log("Información de paginación:", paginationInfo)

        setPrestadores(items)
        setPagination((prev) => ({
          ...prev,
          ...paginationInfo,
        }))

        setShowResults(true)
      } catch (error) {
        console.error("Error fetching prestadores:", error)
        setPrestadores([])
        setPagination({
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: pageSize,
          hasNextPage: false,
          hasPrevPage: false,
        })
        setShowResults(true)
      } finally {
        setLoading((prev) => ({ ...prev, prestadores: false }))
      }
    },
    [formData, pagination.itemsPerPage],
  )

  // Función para cargar prestadores por nombre con paginación
  const fetchPrestadoresPorNombre = useCallback(
    async (page = 1, pageSize = pagination.itemsPerPage, isPageChange = false) => {
      if (
        !formData.plan ||
        !formData.categoria ||
        !formData.localidad ||
        !formData.especialidad ||
        !formData.nombrePrestador
      ) {
        return
      }

      setLoading((prev) => ({ ...prev, prestadores: true }))

      if (!isPageChange) {
        setShowResults(false)
      }

      try {
        const response = await CartillaService.getPrestadoresPorNombre(
          formData.plan,
          formData.categoria,
          formData.localidad,
          formData.especialidad,
          formData.nombrePrestador,
          page,
          pageSize,
        )

        console.log("Respuesta completa de getPrestadoresPorNombre:", response)

        // Manejar diferentes estructuras de respuesta
        let items = []
        let paginationInfo = {
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: pageSize,
          hasNextPage: false,
          hasPrevPage: page > 1,
        }

        if (response) {
          if (Array.isArray(response)) {
            // Si es un array, tomamos el primer elemento
            const firstItem = response[0]
            if (firstItem && firstItem.items) {
              items = firstItem.items
              paginationInfo = {
                ...paginationInfo,
                ...firstItem.pagination,
                itemsPerPage: pageSize,
                currentPage: page,
              }
            } else if (Array.isArray(firstItem)) {
              // Si el primer elemento es un array, lo usamos directamente
              items = firstItem
              paginationInfo.totalItems = firstItem.length
            } else {
              // Si no tiene estructura esperada pero es un array, lo usamos directamente
              items = response
              paginationInfo.totalItems = response.length
            }
          } else if (response.items) {
            // Si tiene una propiedad items, la usamos
            items = response.items
            paginationInfo = {
              ...paginationInfo,
              ...response.pagination,
              itemsPerPage: pageSize,
              currentPage: page,
            }
          } else if (response.data && response.data.items) {
            // Si tiene una estructura data.items
            items = response.data.items
            paginationInfo = {
              ...paginationInfo,
              ...response.data.pagination,
              itemsPerPage: pageSize,
              currentPage: page,
            }
          } else {
            // Si no tiene ninguna estructura esperada, asumimos que es la lista directamente
            items = response
            paginationInfo.totalItems = response.length
          }
        }

        console.log("Items procesados:", items)
        console.log("Información de paginación:", paginationInfo)

        setPrestadores(items)
        setPagination((prev) => ({
          ...prev,
          ...paginationInfo,
        }))

        setShowResults(true)
      } catch (error) {
        console.error("Error fetching prestadores por nombre:", error)
        setPrestadores([])
        setPagination({
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: pageSize,
          hasNextPage: false,
          hasPrevPage: false,
        })
        setShowResults(true)
      } finally {
        setLoading((prev) => ({ ...prev, prestadores: false }))
      }
    },
    [formData, pagination.itemsPerPage],
  )

  // Manejador para cambiar de página
  const handlePageChange = (newPage) => {
    if (formData.searchMethod === "normal") {
      fetchPrestadoresNormal(newPage, pagination.itemsPerPage, true)
    } else {
      fetchPrestadoresPorNombre(newPage, pagination.itemsPerPage, true)
    }
  }

  // Manejador para cambiar el tamaño de página
  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({
      ...prev,
      itemsPerPage: newSize,
      currentPage: 1,
    }))

    if (formData.searchMethod === "normal") {
      fetchPrestadoresNormal(1, newSize, true)
    } else {
      fetchPrestadoresPorNombre(1, newSize, true)
    }
  }

  const handleNormalSearch = async () => {
    const requiredFields = ["plan", "provincia", "localidad", "categoria", "especialidad"]

    if (requiredFields.some((field) => !formData[field])) {
      alert("Complete todos los campos obligatorios")
      return
    }

    await fetchPrestadoresNormal(1, pagination.itemsPerPage, false)
  }

  const handleNameSearch = async () => {
    const requiredFields = ["plan", "categoria", "localidad", "especialidad", "nombrePrestador"]

    if (requiredFields.some((field) => !formData[field])) {
      alert("Complete todos los campos obligatorios")
      return
    }

    await fetchPrestadoresPorNombre(1, pagination.itemsPerPage, false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.searchMethod === "normal") {
      await handleNormalSearch()
    } else {
      await handleNameSearch()
    }
  }

  const handleSearchMethodChange = (method) => {
    setFormData({
      ...initialState,
      searchMethod: method,
      plan: formData.plan,
    })

    setOptions({
      planes: options.planes,
      provincias: [],
      localidades: [],
      categorias: [],
      especialidades: [],
      nombresPrestadores: [],
      especialidadesPrestador: [],
    })

    setPrestadores([])
    setShowResults(false)
    setPagination({
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 10,
      hasNextPage: false,
      hasPrevPage: false,
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return {
    formData,
    options,
    loading,
    prestadores,
    showResults,
    pagination,
    handleChange,
    handleSubmit,
    handlePageChange,
    handlePageSizeChange,
    handleSearchMethodChange,
  }
}
