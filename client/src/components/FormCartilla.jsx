"use client"

import { useCartillaApi } from "../hooks/useCartillaApi"
import { useFormCartilla } from "../hooks/useFormCartilla"

// Componentes 
import CartillaSidebar from "./cartilla/CartillaSidebar"
import SearchView from "./cartilla/SearchView"
import SearchResults from "./cartilla/SearchResults"

// Se está utilizando useCartillaApi.js, pero de manera indirecta.
// Por qué esta arquitectura?
// Separación de responsabilidades:
// useCartillaApi → Maneja la comunicación con la API
// useFormCartilla → Maneja la lógica de UI y estado del formulario

export const FormCartilla = () => {
  const apiHook = useCartillaApi()
  const formHook = useFormCartilla(apiHook)

  const {
    isResultsView,
    selectedCategory,
    availableCategories,
    criteriosSeleccionados,
    handleCategoryClick,
    handleSubmit,
    handleBackToSearch,
    handleFormChange,
    handleMethodChange,
    handlePageChange,
    handlePageSizeChange,
    formData,
    options,
    loading,
    prestadores,
    pagination
  } = formHook

  return (
    <div className="cartilla-container">
      {/* Sidebar - siempre visible */}
      <CartillaSidebar />

      {/* Contenido principal - cambia según la vista */}
      <main className="cartilla-content">
        {!isResultsView ? (
          <SearchView
            formData={formData}
            options={options}
            loading={loading}
            selectedCategory={selectedCategory}
            availableCategories={availableCategories}
            criteriosSeleccionados={criteriosSeleccionados}
            onSubmit={handleSubmit}
            onFieldChange={handleFormChange}
            onCategoryClick={handleCategoryClick}
            onSearchMethodChange={handleMethodChange}
          />
        ) : (
          <SearchResults
            prestadores={prestadores}
            loading={loading}
            pagination={pagination}
            options={options}
            formData={formData}
            onBackToSearch={handleBackToSearch}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </main>
    </div>
  )
}