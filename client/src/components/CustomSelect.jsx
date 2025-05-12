import { useState, useEffect, useRef } from "react";
import { FiChevronDown, FiSearch, FiLoader, FiX, FiCheck } from "react-icons/fi";

export default function CustomSelect({
  options = [],
  value = "",
  onChange,
  name,
  placeholder = "Seleccionar",
  disabled = false,
  loading = false,
  className = "",
  multiple = false, // Nuevo prop para modo múltiple
}) {
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFiltering, setIsFiltering] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Convertir value a array si estamos en modo múltiple
  const selectedValues = multiple
    ? (Array.isArray(value) ? value : (value ? [value] : [])
    ) : value;

  // Actualizar el valor mostrado cuando cambia el valor seleccionado externamente
  useEffect(() => {
    if (!multiple) {
      const selectedOption = options.find(option => option.id.toString() === value.toString());
      setSearchTerm(selectedOption ? selectedOption.nombre : "");
    }
  }, [value, options, multiple]);

  // Actualizar opciones filtradas
  useEffect(() => {
    if (!isFiltering || !isOpen) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
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
        setIsFiltering(false);
        if (multiple) setSearchTerm(""); // Limpiar búsqueda al cerrar en modo múltiple
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [multiple]);

  // Manejo de teclado
  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setIsFiltering(false);
        } else {
          setHighlightedIndex(prevIndex =>
            prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : prevIndex
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        } else if (!isOpen) {
          setIsOpen(true);
          setIsFiltering(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setIsFiltering(false);
        if (multiple) setSearchTerm("");
        break;
      case "Tab":
        setIsOpen(false);
        setIsFiltering(false);
        if (multiple) setSearchTerm("");
        break;
      default:
        if (e.key.length === 1 || e.key === "Backspace" || e.key === "Delete") {
          setIsFiltering(true);
        }
        break;
    }
  };

  // Manejar cambios en el input
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsFiltering(true);

    if (!isOpen) {
      setIsOpen(true);
    }

    if (e.target.value === "" && onChange && !multiple) {
      onChange({
        target: {
          name,
          value: "",
        },
      });
    }
  };

  // Seleccionar una opción
  const handleSelectOption = (option) => {
    if (multiple) {
      // Lógica para selección múltiple
      const newValue = selectedValues.includes(option.id.toString())
        ? selectedValues.filter(v => v !== option.id.toString())
        : [...selectedValues, option.id.toString()];

      onChange({
        target: {
          name,
          value: newValue,
        },
      });

      setSearchTerm("");
      inputRef.current?.focus();
    } else {
      // Lógica para selección simple
      setSearchTerm(option.nombre);
      setIsOpen(false);
      setHighlightedIndex(-1);
      setIsFiltering(false);

      onChange({
        target: {
          name,
          value: option.id,
        },
      });
    }
  };

  // Eliminar un elemento seleccionado en modo múltiple
  const handleRemoveSelected = (id, e) => {
    e.stopPropagation();
    const newValue = selectedValues.filter(v => v !== id.toString());
    onChange({
      target: {
        name,
        value: newValue,
      },
    });
  };

  // Alternar apertura del dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);

      if (newIsOpen) {
        setIsFiltering(false);
        inputRef.current?.focus();
      } else if (multiple) {
        setSearchTerm("");
      }
    }
  };

  // Determinar el texto del placeholder según el estado
  const getPlaceholderText = () => {
    if (loading) return "Cargando...";
    if (multiple && selectedValues.length > 0) return "";
    return placeholder;
  };

  // Obtener opciones seleccionadas para mostrar en modo múltiple
  const getSelectedOptions = () => {
    return options.filter(option => selectedValues.includes(option.id.toString()));
  };

  return (
    <div
      className={`custom-select-container ${className}`}
      ref={dropdownRef}
      style={{ position: "relative", zIndex: isOpen ? "1000" : "1" }}
    >
      <div
        className={`custom-select ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={toggleDropdown}
        style={multiple ? { minHeight: "40px", padding: "5px" } : {}}
      >
        {multiple ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", flexGrow: 1 }}>
            {getSelectedOptions().map(option => (
              <div
                key={option.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#e0e0e0",
                  color: "black",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  fontSize: "0.85rem"
                }}
              >
                {option.nombre}
                <button
                  type="button"
                  onClick={(e) => handleRemoveSelected(option.id, e)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    marginLeft: "4px",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
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
              style={{
                flexGrow: 1,
                minWidth: "50px",
                border: "none",
                outline: "none",
                background: "transparent"
              }}
            />
          </div>
        ) : (
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
        )}

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
            zIndex: 9999,
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
                    borderBottom: index < filteredOptions.length - 1 ? "1px solid #f5f5f5" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option.nombre}
                  {multiple && selectedValues.includes(option.id.toString()) && (
                    <FiCheck size={16} style={{ marginLeft: "8px", color: "#4CAF50" }} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}