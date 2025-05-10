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
    if (searchTerm.trim() === "" || !isOpen) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        option.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options, isOpen]);

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
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
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Manejar cambios en el input
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);

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
      setIsOpen(!isOpen);
      if (!isOpen && inputRef.current) {
        inputRef.current.focus();
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
      // Asegurar que el contenedor tenga posición relativa
      style={{ position: "relative" }}
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
          // Asegurar que el dropdown tenga un z-index alto y posición absoluta
          style={{
            position: "absolute",
            top: "calc(100% + 5px)",
            left: 0,
            width: "100%",
            zIndex: 9999,
            maxHeight: "250px",
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