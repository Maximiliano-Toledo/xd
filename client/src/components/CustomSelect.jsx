"use client"

import { useState, useEffect, useRef } from "react"

export default function CustomSelect({
  options = [],
  value = "",
  onChange,
  name,
  placeholder = "Seleccionar",
  disabled = false,
  loading = false,
  className = "",
}) {
  const [filteredOptions, setFilteredOptions] = useState(options)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Actualizar el valor mostrado cuando cambia el valor seleccionado externamente
  useEffect(() => {
    if (value) {
      const selectedOption = options.find((option) => option.id.toString() === value.toString())
      if (selectedOption) {
        setSearchTerm(selectedOption.nombre)
      }
    } else {
      setSearchTerm("")
    }
  }, [value, options])

  // Actualizar opciones filtradas cuando cambian las opciones o el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOptions(options)
    } else {
      const filtered = options.filter((option) => option.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredOptions(filtered)
    }
  }, [searchTerm, options])

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Manejar cambios en el input
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
    setIsOpen(true)

    // Si el usuario borra el input, notificar cambio con valor vacío
    if (e.target.value === "" && onChange) {
      const event = {
        target: {
          name,
          value: "",
        },
      }
      onChange(event)
    }
  }

  // Seleccionar una opción
  const handleSelectOption = (option) => {
    setSearchTerm(option.nombre)
    setIsOpen(false)

    if (onChange) {
      // Crear un evento sintético similar al que produciría un select nativo
      const event = {
        target: {
          name,
          value: option.id,
        },
      }
      onChange(event)
    }
  }

  // Determinar el texto del placeholder según el estado
  const getPlaceholderText = () => {
    if (loading) {
      return "Cargando..."
    }
    return placeholder
  }

  return (
    <div className={`position-relative w-100 ${className}`} ref={dropdownRef}>
      <div className="border rounded overflow-hidden form-control p-0">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onClick={() => !disabled && setIsOpen(true)}
          className="w-100 border-0 p-2"
          placeholder={getPlaceholderText()}
          disabled={disabled}
          style={{ outline: "none", boxShadow: "none" }}
        />
      </div>

      {isOpen && !disabled && (
        <div
          className="position-absolute w-100 bg-white border rounded mt-1 shadow-sm"
          style={{ maxHeight: "200px", overflowY: "auto", zIndex: 1000 }}
        >
          {loading ? (
            <div className="p-2 text-center">Cargando...</div>
          ) : filteredOptions.length > 0 ? (
            <ul className="list-unstyled m-0 p-0">
              {filteredOptions.map((option) => (
                <li
                  key={option.id}
                  onClick={() => handleSelectOption(option)}
                  className="p-2 cursor-pointer hover-bg-light"
                  style={{ cursor: "pointer", color: "black"} }
                >
                  {option.nombre}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-center text-muted">No se encontraron opciones</div>
          )}
        </div>
      )}
    </div>
  )
}
