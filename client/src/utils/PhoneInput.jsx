import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaPhone, FaWhatsapp, FaMobileAlt } from 'react-icons/fa';
import { MdLocalPhone } from 'react-icons/md';
import { FiPhone } from 'react-icons/fi';
import "../styles/phone-input.css";

// FIXED: Import the correct functions from phoneFormatter
import {
  isPhoneJsonFormat,
  normalizePhoneWithPrefixes, // This is the correct function name
  validatePhone,
  formatPhoneForDisplay,
  PHONE_TYPES
} from "../utils/phoneFormatter";

// MODIFICACIÓN: Lista de tipos sin WhatsApp como tipo separado
const PHONE_TYPES_UI = [
  { value: 'fijo', label: 'Teléfono Fijo' },
  { value: 'celular', label: 'Teléfono Celular' },
  { value: 'whatsapp', label: 'Teléfono WhatsApp' }, // Solo para UI, internamente será celular
  { value: 'gratuito', label: 'Línea Gratuita (0800/0810/0300)' },
  { value: 'fax', label: 'Fax' }
];

const PhoneInput = ({
                      value = '',
                      onChange = () => {},
                      disabled = false,
                      required = false,
                      ubicacionContext = null,
                      hideOldFormatAlert = false,
                      skipAutoNormalization = false
                    }) => {
  const [phones, setPhones] = useState([]);
  const [isOldFormat, setIsOldFormat] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [phoneForm, setPhoneForm] = useState({
    tipo: 'fijo',
    codigoArea: '',
    numero: '',
    extension: '',
    descripcion: ''
  });
  const [validationErrors, setValidationErrors] = useState([]);

  // FIXED: Function to normalize phones with location context
  const normalizePhoneInput = (phoneValue, context = null) => {
    if (!phoneValue) return JSON.stringify([]);

    // Use normalizePhoneWithPrefixes with provincia and localidad parameters
    try {
      return normalizePhoneWithPrefixes(
        phoneValue,
        context?.provincia || null,
        context?.localidad || null
      );
    } catch (error) {
      return JSON.stringify([]);
    }
  };

  // MODIFICACIÓN: Función para convertir teléfono antes de guardar
  const convertPhoneForStorage = (phone) => {
    // Si el tipo UI es 'whatsapp', convertir a 'celular' y ajustar descripción
    if (phone.uiType === 'whatsapp') {
      return {
        tipo: 'celular', // Guardar como celular
        codigoArea: phone.codigoArea,
        numero: phone.numero,
        extension: phone.extension,
        descripcion: 'WhatsApp' + (phone.descripcion && phone.descripcion !== 'WhatsApp' ? ` - ${phone.descripcion}` : '')
      };
    }

    // Para otros tipos, guardar normal
    const { uiType, ...phoneData } = phone;
    return phoneData;
  };

  // MODIFICACIÓN: Función para convertir teléfono desde almacenamiento
  const convertPhoneFromStorage = (phone) => {
    // Si es celular y la descripción contiene 'WhatsApp', tratarlo como WhatsApp en UI
    if (phone.tipo === 'celular' && phone.descripcion && phone.descripcion.toLowerCase().includes('whatsapp')) {
      return {
        ...phone,
        uiType: 'whatsapp' // Tipo para UI
      };
    }

    return {
      ...phone,
      uiType: phone.tipo // Tipo UI igual al tipo real
    };
  };

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
        const parsedPhones = JSON.parse(value);
        // MODIFICACIÓN: Convertir teléfonos desde almacenamiento
        setPhones(parsedPhones.map(convertPhoneFromStorage));
      } else if (skipAutoNormalization) {
        setPhones([]);
      } else {
        const normalizedValue = normalizePhoneInput(value, ubicacionContext);
        const parsedPhones = JSON.parse(normalizedValue);
        setPhones(parsedPhones.map(convertPhoneFromStorage));
      }
    } catch (e) {
      setPhones([]);
    }
  }, [value, ubicacionContext, skipAutoNormalization]);

  const handlePhoneFormChange = (e) => {
    const { name, value } = e.target;

    if (name === 'tipo') {
      if (value === 'whatsapp') {
        setPhoneForm({
          ...phoneForm,
          tipo: value,
          uiType: 'whatsapp', // Tipo para UI
          descripcion: 'WhatsApp'
        });
      } else {
        setPhoneForm({
          ...phoneForm,
          tipo: value,
          uiType: value,
          descripcion: ''
        });
      }
      return;
    }

    if (name === 'descripcion') {
      const normalizedDesc = value.toLowerCase().trim();

      // Si se escribe algo parecido a WhatsApp, ajustar tipo automáticamente
      if (['whatsapp', 'wsp'].includes(normalizedDesc) && phoneForm.uiType !== 'whatsapp') {
        setTimeout(() => {
          setPhoneForm(prev => ({
            ...prev,
            tipo: 'whatsapp',
            uiType: 'whatsapp',
            descripcion: 'WhatsApp'
          }));
        }, 100);
        return;
      }
      // Si antes era WhatsApp y se borra o cambia, volver a tipo celular
      else if (phoneForm.uiType === 'whatsapp' && !normalizedDesc.includes('whatsapp')) {
        setPhoneForm({
          ...phoneForm,
          tipo: 'celular',
          uiType: 'celular',
          descripcion: value
        });
      } else {
        setPhoneForm({ ...phoneForm, descripcion: value });
      }
      return;
    }

    setPhoneForm({ ...phoneForm, [name]: value });
  };

  const validatePhoneForm = () => {
    // MODIFICACIÓN: Validar usando el tipo real (no el UI)
    const phoneToValidate = {
      ...phoneForm,
      tipo: phoneForm.uiType === 'whatsapp' ? 'celular' : phoneForm.tipo
    };

    const { isValid, errors } = validatePhone(phoneToValidate);
    setValidationErrors(errors);
    return isValid;
  };

  const handleAddPhone = () => {
    if (!validatePhoneForm()) return;

    // MODIFICACIÓN: Convertir antes de guardar
    const phoneToAdd = convertPhoneForStorage({ ...phoneForm, uiType: phoneForm.uiType || phoneForm.tipo });
    const newPhones = [...phones, { ...phoneForm, uiType: phoneForm.uiType || phoneForm.tipo }];
    setPhones(newPhones);

    // Guardar solo los datos convertidos (sin uiType)
    const phonesToSave = newPhones.map(convertPhoneForStorage);
    onChange(JSON.stringify(phonesToSave));

    resetPhoneForm();
  };

  const handleUpdatePhone = () => {
    if (!validatePhoneForm()) return;

    const newPhones = [...phones];
    newPhones[editingIndex] = { ...phoneForm, uiType: phoneForm.uiType || phoneForm.tipo };
    setPhones(newPhones);

    // Guardar solo los datos convertidos (sin uiType)
    const phonesToSave = newPhones.map(convertPhoneForStorage);
    onChange(JSON.stringify(phonesToSave));

    resetPhoneForm();
    setEditingIndex(-1);
  };

  const handleDeletePhone = (index) => {
    const newPhones = phones.filter((_, i) => i !== index);
    setPhones(newPhones);

    // Guardar solo los datos convertidos
    const phonesToSave = newPhones.map(convertPhoneForStorage);
    onChange(JSON.stringify(phonesToSave));
  };

  const handleStartEdit = (index) => {
    const phoneToEdit = phones[index];
    setPhoneForm({
      ...phoneToEdit,
      tipo: phoneToEdit.uiType || phoneToEdit.tipo // Usar el tipo UI si existe
    });
    setEditingIndex(index);
    setShowNewForm(false);
  };

  const handleCancelForm = () => {
    resetPhoneForm();
  };

  const resetPhoneForm = () => {
    setPhoneForm({
      tipo: 'fijo',
      uiType: 'fijo',
      codigoArea: '',
      numero: '',
      extension: '',
      descripcion: ''
    });
    setEditingIndex(-1);
    setShowNewForm(false);
    setValidationErrors([]);
  };

  // Función para obtener el icono según el tipo UI
  const getPhoneIcon = (phone) => {
    const uiType = phone.uiType || phone.tipo;
    switch (uiType) {
      case 'whatsapp':
        return <FaWhatsapp className="phone-type-icon whatsapp" />;
      case 'celular':
        return <FaMobileAlt className="phone-type-icon mobile" />;
      case 'gratuito':
        return <FiPhone className="phone-type-icon toll-free" />;
      default:
        return <MdLocalPhone className="phone-type-icon landline" />;
    }
  };

  const getPhoneTypeLabel = (phone) => {
    const uiType = phone.uiType || phone.tipo;
    const typeObj = PHONE_TYPES_UI.find(t => t.value === uiType);
    return typeObj ? typeObj.label : 'Teléfono';
  };

  // MODIFICACIÓN: Función para formatear teléfono que usa el tipo real
  const formatPhoneForDisplayFixed = (phone) => {
    const realPhone = {
      ...phone,
      tipo: phone.uiType === 'whatsapp' ? 'celular' : phone.tipo
    };
    return formatPhoneForDisplay(realPhone);
  };

  return (
    <div className="phone-input-modern">
      {/* Alerta de formato antiguo */}
      {isOldFormat && value && !hideOldFormatAlert && !skipAutoNormalization && (
        <div className="phone-old-format-alert">
          <FiPhone className="alert-icon" />
          <div className="phone-old-format-content">
            <h6>Formato telefónico desactualizado detectado</h6>
            <p>
              Se encontró información telefónica en formato anterior que necesita ser
              actualizada para una mejor organización y visualización.
            </p>
            <div className="phone-old-format-text">{value}</div>
            {ubicacionContext?.provincia && (
              <small className="text-muted">
                ℹ️ Se utilizará la ubicación del prestador para mejorar la detección automática.
              </small>
            )}
          </div>
        </div>
      )}

      {/* Mensaje especial para modo manual */}
      {skipAutoNormalization && isOldFormat && value && (
        <div className="manual-mode-alert">
          <FiPhone className="alert-icon" />
          <div className="manual-mode-content">
            <h6>Modo de edición manual activado</h6>
            <p>
              Puedes agregar nuevos números telefónicos estructurados usando el formulario de abajo.
              Los datos actuales se mantendrán sin cambios hasta que agregues nuevos teléfonos.
            </p>
          </div>
        </div>
      )}

      {/* Lista de teléfonos */}
      {phones.length > 0 && (
        <div className="phone-list">
          {phones.map((phone, index) => (
            <div key={index} className="phone-item-card">
              <div className="phone-type-icon-wrapper">
                {getPhoneIcon(phone)}
              </div>

              <div className="phone-item-details">
                <div className="phone-item-label">
                  <h6 className="phone-item-title">
                    {phone.descripcion || (index === 0 ? 'Principal' : `Teléfono ${index + 1}`)}
                  </h6>
                  <span className="phone-type-badge">
                    {getPhoneTypeLabel(phone)}
                  </span>
                </div>
                <p className="phone-item-number">
                  {formatPhoneForDisplayFixed(phone)}
                </p>
              </div>

              <div className="phone-item-actions">
                <button
                  type="button"
                  className="phone-action-btn edit"
                  onClick={() => handleStartEdit(index)}
                  disabled={disabled}
                  title="Editar teléfono"
                >
                  <FaEdit />
                </button>
                <button
                  type="button"
                  className="phone-action-btn delete"
                  onClick={() => handleDeletePhone(index)}
                  disabled={disabled}
                  title="Eliminar teléfono"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón para agregar teléfono */}
      {!showNewForm && editingIndex === -1 && (
        <button
          type="button"
          className="add-phone-btn"
          onClick={() => setShowNewForm(true)}
          disabled={disabled}
        >
          <FaPlus /> Agregar nuevo teléfono
        </button>
      )}

      {/* Formulario para nuevo teléfono o edición */}
      {(showNewForm || editingIndex !== -1) && (
        <div className="phone-form-card">
          <div className="phone-form-header">
            <div className="phone-form-icon">
              {editingIndex !== -1 ? <FaEdit /> : <FaPlus />}
            </div>
            <h3 className="phone-form-title">
              {editingIndex !== -1 ? 'Editar información telefónica' : 'Agregar nuevo teléfono'}
            </h3>
          </div>

          <div className="phone-form-grid">
            {/* Tipo de teléfono - MODIFICACIÓN: Usar PHONE_TYPES_UI */}
            <div className="form-group-modern">
              <label className="form-label-modern">Tipo de teléfono</label>
              <select
                name="tipo"
                className="form-select-modern"
                value={phoneForm.tipo}
                onChange={handlePhoneFormChange}
                disabled={disabled}
              >
                {PHONE_TYPES_UI.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Código de área y número */}
            <div className="phone-form-row">
              <div className="form-group-modern">
                <label className="form-label-modern">Código de área</label>
                <input
                  type="text"
                  name="codigoArea"
                  className="form-input-modern"
                  placeholder={
                    phoneForm.tipo === 'gratuito' ? '0800' :
                      ubicacionContext?.provincia?.toLowerCase().includes('buenos aires') ? '011' :
                        '011'
                  }
                  value={phoneForm.codigoArea || ''}
                  onChange={handlePhoneFormChange}
                  disabled={disabled}
                />
              </div>
              <div className="form-group-modern">
                <label className="form-label-modern">Número telefónico</label>
                <input
                  type="text"
                  name="numero"
                  className="form-input-modern"
                  placeholder={
                    phoneForm.tipo === 'celular' || phoneForm.tipo === 'whatsapp'
                      ? "15555555"
                      : "44444444"
                  }
                  value={phoneForm.numero || ''}
                  onChange={handlePhoneFormChange}
                  disabled={disabled}
                />
              </div>
            </div>

            {/* Extensión y descripción */}
            <div className="phone-form-row-full">
              <div className="form-group-modern">
                <label className="form-label-modern">Extensión (opcional)</label>
                <input
                  type="text"
                  name="extension"
                  className="form-input-modern"
                  placeholder="123"
                  value={phoneForm.extension || ''}
                  onChange={handlePhoneFormChange}
                  disabled={disabled}
                />
              </div>
              <div className="form-group-modern">
                <label className="form-label-modern">Descripción</label>
                <input
                  type="text"
                  name="descripcion"
                  className="form-input-modern"
                  placeholder={
                    phoneForm.tipo === 'whatsapp'
                      ? "WhatsApp"
                      : "Principal, Atención al cliente..."
                  }
                  value={phoneForm.descripcion || ''}
                  onChange={handlePhoneFormChange}
                  disabled={disabled || phoneForm.tipo === 'whatsapp'} // Bloquear edición si es WhatsApp
                />
              </div>
            </div>
          </div>

          {/* Errores de validación */}
          {validationErrors.length > 0 && (
            <div className="validation-errors">
              <ul>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Botones de acción */}
          <div className="phone-form-actions">
            <button
              type="button"
              className="form-btn form-btn-secondary"
              onClick={handleCancelForm}
              disabled={disabled}
            >
              Cancelar
            </button>
            {editingIndex !== -1 ? (
              <button
                type="button"
                className="form-btn form-btn-primary"
                onClick={handleUpdatePhone}
                disabled={disabled}
              >
                <FaEdit /> Actualizar teléfono
              </button>
            ) : (
              <button
                type="button"
                className="form-btn form-btn-primary"
                onClick={handleAddPhone}
                disabled={disabled}
              >
                <FaPlus /> Agregar teléfono
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay teléfonos */}
      {phones.length === 0 && !showNewForm && (
        <div className={`no-phones-message ${required ? 'required' : ''}`}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>
            <FiPhone />
          </div>
          <div>
            {skipAutoNormalization
              ? 'Comienza agregando nuevos números telefónicos estructurados.'
              : required
                ? 'Es necesario agregar al menos un número telefónico para continuar.'
                : 'No hay números telefónicos registrados. Agregue uno para mejorar la información de contacto.'
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;