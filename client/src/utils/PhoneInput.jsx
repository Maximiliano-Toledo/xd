import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { isPhoneJsonFormat, normalizeOldPhoneFormat, validatePhone, PHONE_TYPES, formatPhoneForDisplay } from '../utils/phoneFormatter';

/**
 * Componente para entrada de teléfonos múltiples
 * @param {Object} props - Propiedades del componente
 * @param {string} props.value - Valor actual (puede ser formato JSON o antiguo)
 * @param {Function} props.onChange - Función a llamar cuando cambia el valor
 * @param {boolean} props.disabled - Si el componente está deshabilitado
 * @param {boolean} props.required - Si el campo es requerido
 */
const PhoneInput = ({ value, onChange, disabled = false, required = false }) => {
  // Estado local para los teléfonos
  const [phones, setPhones] = useState([]);
  // Estado para determinar si el valor está en formato antiguo
  const [isOldFormat, setIsOldFormat] = useState(false);
  // Estado para mostrar el formulario de nuevo teléfono
  const [showNewForm, setShowNewForm] = useState(false);
  // Estado para el teléfono que se está editando
  const [editingIndex, setEditingIndex] = useState(-1);
  // Estado para el formulario de nuevo teléfono o edición
  const [phoneForm, setPhoneForm] = useState({
    tipo: 'fijo',
    codigoArea: '',
    numero: '',
    extension: '',
    descripcion: ''
  });
  // Estado para errores de validación
  const [validationErrors, setValidationErrors] = useState([]);

  // Cargar los teléfonos al montar el componente o cuando cambia el valor
  useEffect(() => {
    if (!value) {
      setPhones([]);
      setIsOldFormat(false);
      return;
    }

    const isJson = isPhoneJsonFormat(value);
    setIsOldFormat(!isJson);

    try {
      if (isJson) {
        // Es formato JSON, parsear directamente
        setPhones(JSON.parse(value));
      } else {
        // Es formato antiguo, normalizar
        setPhones(JSON.parse(normalizeOldPhoneFormat(value)));
      }
    } catch (e) {
      console.error('Error al parsear teléfonos:', e);
      setPhones([]);
    }
  }, [value]);

  // Manejar cambios en el formulario de teléfono
  const handlePhoneFormChange = (e) => {
    const { name, value } = e.target;
    setPhoneForm({
      ...phoneForm,
      [name]: value
    });
  };

  // Validar teléfono antes de agregar/actualizar
  const validatePhoneForm = () => {
    const { isValid, errors } = validatePhone(phoneForm);
    setValidationErrors(errors);
    return isValid;
  };

  // Agregar nuevo teléfono
  const handleAddPhone = () => {
    if (!validatePhoneForm()) return;

    const newPhones = [...phones, { ...phoneForm }];
    setPhones(newPhones);
    onChange(JSON.stringify(newPhones));

    // Resetear formulario
    setPhoneForm({
      tipo: 'fijo',
      codigoArea: '',
      numero: '',
      extension: '',
      descripcion: ''
    });
    setShowNewForm(false);
    setValidationErrors([]);
  };

  // Actualizar teléfono existente
  const handleUpdatePhone = () => {
    if (!validatePhoneForm()) return;

    const newPhones = [...phones];
    newPhones[editingIndex] = { ...phoneForm };
    setPhones(newPhones);
    onChange(JSON.stringify(newPhones));

    // Resetear formulario
    setPhoneForm({
      tipo: 'fijo',
      codigoArea: '',
      numero: '',
      extension: '',
      descripcion: ''
    });
    setEditingIndex(-1);
    setValidationErrors([]);
  };

  // Eliminar teléfono
  const handleDeletePhone = (index) => {
    const newPhones = phones.filter((_, i) => i !== index);
    setPhones(newPhones);
    onChange(JSON.stringify(newPhones));
  };

  // Comenzar edición de teléfono
  const handleStartEdit = (index) => {
    setPhoneForm({ ...phones[index] });
    setEditingIndex(index);
    setShowNewForm(false);
  };

  // Cancelar formulario
  const handleCancelForm = () => {
    setPhoneForm({
      tipo: 'fijo',
      codigoArea: '',
      numero: '',
      extension: '',
      descripcion: ''
    });
    setEditingIndex(-1);
    setShowNewForm(false);
    setValidationErrors([]);
  };

  return (
    <div className="phone-input-container">
      {/* Mostrar mensaje si es formato antiguo */}
      {isOldFormat && value && (
        <div className="alert alert-info mb-3">
          <strong>Formato antiguo detectado:</strong> {value}
          <p className="mb-0 mt-1">Este formato necesita ser actualizado. Use el formulario a continuación para normalizar la información.</p>
        </div>
      )}

      {/* Lista de teléfonos */}
      {phones.length > 0 && (
        <div className="phone-list mb-3">
          {phones.map((phone, index) => (
            <div key={index} className="phone-item d-flex align-items-center border rounded p-2 mb-2">
              <div className="phone-item-content flex-grow-1">
                <div className="phone-label">
                  {phone.descripcion || (index === 0 ? 'Principal' : `Teléfono ${index + 1}`)}
                  {phone.tipo && <span className="phone-type badge bg-light text-dark ms-2">{phone.tipo}</span>}
                </div>
                <div className="phone-number">
                  {formatPhoneForDisplay(phone)}
                </div>
              </div>
              <div className="phone-item-actions">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary me-1"
                  onClick={() => handleStartEdit(index)}
                  disabled={disabled}
                >
                  <FaEdit />
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDeletePhone(index)}
                  disabled={disabled}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón para mostrar formulario de nuevo teléfono */}
      {!showNewForm && editingIndex === -1 && (
        <button
          type="button"
          className="btn btn-sm btn-outline-success mb-3"
          onClick={() => setShowNewForm(true)}
          disabled={disabled}
        >
          <FaPlus className="me-1" /> Agregar teléfono
        </button>
      )}

      {/* Formulario para nuevo teléfono o edición */}
      {(showNewForm || editingIndex !== -1) && (
        <div className="phone-form border rounded p-3 mb-3">
          <h6 className="mb-3">
            {editingIndex !== -1 ? 'Editar teléfono' : 'Nuevo teléfono'}
          </h6>

          {/* Tipo de teléfono */}
          <div className="mb-3">
            <label htmlFor="tipo" className="form-label">Tipo de teléfono:</label>
            <select
              id="tipo"
              name="tipo"
              className="form-select"
              value={phoneForm.tipo}
              onChange={handlePhoneFormChange}
              disabled={disabled}
            >
              {PHONE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Código de área y número */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="codigoArea" className="form-label">Código de área:</label>
              <input
                type="text"
                id="codigoArea"
                name="codigoArea"
                className="form-control"
                placeholder={phoneForm.tipo === 'gratuito' ? '0800' : '011'}
                value={phoneForm.codigoArea || ''}
                onChange={handlePhoneFormChange}
                disabled={disabled}
              />
            </div>
            <div className="col-md-8">
              <label htmlFor="numero" className="form-label">Número:</label>
              <input
                type="text"
                id="numero"
                name="numero"
                className="form-control"
                placeholder={phoneForm.tipo === 'celular' ? "15555555" : "44444444"}
                value={phoneForm.numero || ''}
                onChange={handlePhoneFormChange}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Extensión y descripción */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="extension" className="form-label">Extensión (opcional):</label>
              <input
                type="text"
                id="extension"
                name="extension"
                className="form-control"
                placeholder="123"
                value={phoneForm.extension || ''}
                onChange={handlePhoneFormChange}
                disabled={disabled}
              />
            </div>
            <div className="col-md-8">
              <label htmlFor="descripcion" className="form-label">Descripción (opcional):</label>
              <input
                type="text"
                id="descripcion"
                name="descripcion"
                className="form-control"
                placeholder="Principal, WhatsApp, Atención, etc."
                value={phoneForm.descripcion || ''}
                onChange={handlePhoneFormChange}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Errores de validación */}
          {validationErrors.length > 0 && (
            <div className="alert alert-danger mb-3">
              <ul className="mb-0">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Botones de acción */}
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-outline-secondary me-2"
              onClick={handleCancelForm}
              disabled={disabled}
            >
              Cancelar
            </button>
            {editingIndex !== -1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdatePhone}
                disabled={disabled}
              >
                Actualizar
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-success"
                onClick={handleAddPhone}
                disabled={disabled}
              >
                Agregar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mensaje si no hay teléfonos */}
      {phones.length === 0 && !showNewForm && (
        <div className="text-muted mb-2">
          {required ? 'Debe agregar al menos un teléfono.' : 'No hay teléfonos agregados.'}
        </div>
      )}
    </div>
  );
};

export default PhoneInput;