import { useState, useEffect } from "react"

// Hook personalizado para manejar la lógica del formulario de cartilla
export const useFormCartilla = (apiHook) => {
    const {
        formData,
        options,
        loading,
        prestadores,
        showResults,
        pagination,
        handleChange,
        handleSubmit: apiHandleSubmit,
        handlePageChange,
        handlePageSizeChange,
        handleSearchMethodChange,
    } = apiHook

    // Estados locales del componente
    const [isResultsView, setIsResultsView] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [availableCategories, setAvailableCategories] = useState([])
    const [criteriosSeleccionados, setCriteriosSeleccionados] = useState(false)

    // Categorías disponibles con sus IDs reales
    const categories = [
        { id: "1", name: "Instituciones", value: "1" },
        { id: "2", name: "Profesionales", value: "2" },
        { id: "3", name: "Farmacias", value: "3" },
        { id: "4", name: "Ópticas", value: "4" },
    ]

    // Efecto para verificar criterios seleccionados
    useEffect(() => {
        setCriteriosSeleccionados(
            formData.plan &&
            formData.provincia &&
            formData.localidad &&
            !loading.planes &&
            !loading.provincias &&
            !loading.localidades,
        )
    }, [formData.plan, formData.provincia, formData.localidad, loading.planes, loading.provincias, loading.localidades])

    // Efecto para actualizar categoría seleccionada
    useEffect(() => {
        if (!formData.categoria) {
            setSelectedCategory(null)
        } else {
            const category = categories.find((cat) => cat.value === formData.categoria)
            setSelectedCategory(category ? category.id : null)
        }
    }, [formData.categoria])

    // Efecto para determinar categorías disponibles
    useEffect(() => {
        if (!formData.plan || !formData.provincia || !formData.localidad) {
            setAvailableCategories([])
            return
        }

        if (options.categorias && options.categorias.length > 0) {
            const availableCategoryIds = options.categorias.map((cat) => cat.id_categoria.toString())
            setAvailableCategories(availableCategoryIds)
        } else {
            setAvailableCategories([])
        }
    }, [formData.plan, formData.provincia, formData.localidad, options.categorias])

    // Efecto para actualizar vista de resultados
    useEffect(() => {
        if (showResults && prestadores.length > 0) {
            setIsResultsView(true)
        }
    }, [showResults, prestadores])

    // Helper para verificar si una categoría está disponible
    const isCategoryAvailable = (categoryValue) => {
        if (!criteriosSeleccionados) {
            return false
        }
        return availableCategories.includes(categoryValue)
    }

    // Handlers
    const handleCategoryClick = (category) => {
        if (!criteriosSeleccionados || !isCategoryAvailable(category.value)) {
            return
        }

        const newSelectedCategory = category.id === selectedCategory ? null : category.id
        setSelectedCategory(newSelectedCategory)

        const event = {
            target: {
                name: "categoria",
                value: newSelectedCategory ? category.value : "",
            },
        }
        handleChange(event)
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const requiredFields = ["plan", "provincia", "localidad", "categoria", "especialidad"]

        if (formData.searchMethod === "porNombre") {
            requiredFields.push("nombrePrestador")
        }

        if (requiredFields.some((field) => !formData[field])) {
            alert("Complete todos los campos obligatorios")
            return
        }

        apiHandleSubmit(e)
    }

    const handleBackToSearch = () => {
        setIsResultsView(false)
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target

        if (name === "provincia" || name === "localidad") {
            setSelectedCategory(null)
        }

        handleChange(e)
    }

    const handleMethodChange = (method) => {
        handleSearchMethodChange(method)
        setIsResultsView(false)
        setSelectedCategory(null)

        // Resetear campos específicos - Incluyendo provincia y localidad
        const fieldsToReset = ["plan", "provincia", "localidad", "categoria", "especialidad", "nombrePrestador"]
        fieldsToReset.forEach(field => {
            handleChange({
                target: { name: field, value: "" }
            })
        })
    }

    return {
        // Estados
        isResultsView,
        selectedCategory,
        availableCategories,
        criteriosSeleccionados,

        // Handlers
        handleCategoryClick,
        handleSubmit,
        handleBackToSearch,
        handleFormChange,
        handleMethodChange,
        handlePageChange,
        handlePageSizeChange,

        // Helpers
        isCategoryAvailable,

        // Datos del API
        formData,
        options,
        loading,
        prestadores,
        pagination
    }
}