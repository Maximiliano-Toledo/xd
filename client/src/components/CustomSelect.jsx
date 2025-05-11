// Modificación del CustomSelect.jsx
import { useState, useEffect, useRef } from "react";
import { FiChevronDown, FiSearch, FiLoader } from "react-icons/fi";

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
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFiltering, setIsFiltering] = useState(false); // Nuevo estado para controlar si estamos filtrando
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Actualizar el valor mostrado cuando cambia el valor seleccionado externamente
  useEffect(() => {
    if (value) {
      const selectedOption = options.find((option) => option.id.toString() === value.toString());
      if (selectedOption) {
        setSearchTerm(selectedOption.nombre);
      }
    } else {
      setSearchTerm("");
    }
  }, [value, options]);

  // Actualizar opciones filtradas cuando cambian las opciones o el término de búsqueda
  useEffect(() => {
    // Si no estamos filtrando o el dropdown está cerrado, mostrar todas las opciones
    if (!isFiltering || !isOpen) {
      setFilteredOptions(options);
    } else {
      // Solo filtrar cuando estamos en modo de filtrado
      const filtered = options.filter((option) =>
        option.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options, isOpen, isFiltering]);

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFiltering(false); // Resetear el modo de filtrado al cerrar
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Manejo de teclado
  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setIsFiltering(false); // No filtrar al abrir con tecla de flecha
        } else {
          setHighlightedIndex((prevIndex) =>
            prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : prevIndex
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        } else if (!isOpen) {
          setIsOpen(true);
          setIsFiltering(false); // No filtrar al abrir con Enter
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setIsFiltering(false); // Resetear el modo de filtrado
        break;
      case "Tab":
        setIsOpen(false);
        setIsFiltering(false); // Resetear el modo de filtrado
        break;
      default:
        // Si el usuario está escribiendo, activar el modo de filtrado
        if (e.key.length === 1 || e.key === "Backspace" || e.key === "Delete") {
          setIsFiltering(true);
        }
        break;
    }
  };

  // Manejar cambios en el input
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsFiltering(true); // Activar el modo de filtrado cuando el usuario escribe

    if (!isOpen) {
      setIsOpen(true);
    }

    // Si el usuario borra el input, notificar cambio con valor vacío
    if (e.target.value === "" && onChange) {
      const event = {
        target: {
          name,
          value: "",
        },
      };
      onChange(event);
    }
  };

  // Seleccionar una opción
  const handleSelectOption = (option) => {
    setSearchTerm(option.nombre);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setIsFiltering(false); // Resetear el modo de filtrado al seleccionar

    if (onChange) {
      // Crear un evento sintético similar al que produciría un select nativo
      const event = {
        target: {
          name,
          value: option.id,
        },
      };
      onChange(event);
    }
  };

  // Alternar apertura del dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);

      if (newIsOpen) {
        setIsFiltering(false); // Al abrir el dropdown, mostrar todas las opciones
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }
  };

  // Determinar el texto del placeholder según el estado
  const getPlaceholderText = () => {
    if (loading) {
      return "Cargando...";
    }
    return placeholder;
  };

  return (
    <div
      className={`custom-select-container ${className}`}
      ref={dropdownRef}
      style={{ position: "relative", zIndex: isOpen ? "1000" : "1" }} // Z-index dinámico
    >
      <div
        className={`custom-select ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={toggleDropdown}
      >
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholderText()}
          disabled={disabled}
          className="select-input"
          autoComplete="off"
        />

        <div className="select-icon">
          {loading ? (
            <FiLoader className="icon-spinner" />
          ) : (
            <FiChevronDown className={`icon-arrow ${isOpen ? 'up' : ''}`} />
          )}
        </div>
      </div>

      {isOpen && !disabled && (
        <div
          className="select-dropdown"
          style={{
            position: "absolute",
            top: "calc(100% + 5px)",
            left: 0,
            width: "100%",
            zIndex: 9999, // Z-index muy alto
            maxHeight: "180px",
            overflowY: "auto",
            backgroundColor: "white",
            borderRadius: "4px",
            boxShadow: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
            border: "1px solid #e0e0e0"
          }}
        >
          {filteredOptions.length === 0 ? (
            <div
              className="select-no-options"
              style={{
                padding: "15px",
                textAlign: "center",
                color: "#757575",
                fontSize: "0.9rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px"
              }}
            >
              <FiSearch style={{ fontSize: "1.5rem", opacity: 0.5 }} />
              <span>No se encontraron resultados</span>
            </div>
          ) : (
            <ul
              className="select-options"
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0
              }}
            >
              {filteredOptions.map((option, index) => (
                <li
                  key={option.id}
                  onClick={() => handleSelectOption(option)}
                  className={`select-option ${index === highlightedIndex ? 'highlighted' : ''}`}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    transition: "background-color 0.2s ease",
                    backgroundColor: index === highlightedIndex ? "#DCEDC8" : "transparent",
                    color: "#333333",
                    borderBottom: index < filteredOptions.length - 1 ? "1px solid #f5f5f5" : "none"
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option.nombre}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}