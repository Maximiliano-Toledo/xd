import React from 'react';
import { LuLaptop, LuMonitor, LuWifi, LuGlobe } from 'react-icons/lu';
import { FaVideo, FaHeadset } from 'react-icons/fa';
import { MdOnlinePrediction, MdVideoCall } from 'react-icons/md';
import { BsShieldCheck, BsLightbulb } from 'react-icons/bs';
import '../../styles/virtual-attention.css';

/**
 * Componente elegante para seleccionar atención virtual
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.value - Valor actual del checkbox
 * @param {Function} props.onChange - Función a llamar cuando cambia el valor
 * @param {boolean} props.disabled - Si el componente está deshabilitado
 * @param {boolean} props.showForProfessionals - Si solo se muestra para profesionales
 * @param {string} props.categoria - Categoría seleccionada para determinar si mostrar
 */
const VirtualAttentionToggle = ({
                                  value = false,
                                  onChange,
                                  disabled = false,
                                  showForProfessionals = false,
                                  categoria = null,
                                  categorias = []
                                }) => {
  // Verificar si es un profesional
  const esProfesional = () => {
    if (!showForProfessionals || !categoria || !categorias.length) return true;

    return categorias.some(cat =>
      cat.id_categoria.toString() === categoria.toString() &&
      cat.nombre === "Profesionales"
    );
  };

  // No mostrar si es específico para profesionales y no es profesional
  if (showForProfessionals && !esProfesional()) {
    return null;
  }

  const handleToggle = () => {
    if (disabled) return;
    onChange(!value);
  };

  return (
    <div className="virtual-attention-container">
      <div className="virtual-attention-header">
        <h6 className="virtual-attention-title">
          <MdOnlinePrediction className="me-2" />
          Modalidad de Atención
        </h6>
        <p className="virtual-attention-subtitle">
          Seleccione si este prestador ofrece atención virtual
        </p>
      </div>

      <div className="virtual-attention-toggle-container">
        <div
          className={`virtual-attention-card ${value ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={handleToggle}
        >
          <div className="virtual-attention-card-content">
            <div className="virtual-attention-icon-wrapper">
              {value ? (
                <LuLaptop className="virtual-attention-icon active" />
              ) : (
                <LuMonitor className="virtual-attention-icon" />
              )}
            </div>

            <div className="virtual-attention-info">
              <div className="virtual-attention-label">
                <span className="virtual-attention-main-text">
                  {value ? 'Atención Virtual Habilitada' : 'Atención Presencial'}
                </span>
                <div className="virtual-attention-status">
                  {value ? (
                    <span className="status-badge virtual">
                      <LuWifi className="me-1" />
                      Virtual
                    </span>
                  ) : (
                    <span className="status-badge presential">
                      <LuGlobe className="me-1" />
                      Presencial
                    </span>
                  )}
                </div>
              </div>

              <div className="virtual-attention-description">
                {value ? (
                  <span>
                    <FaVideo className="me-1" />
                    Consultas remotas por videollamada o telemedicina
                  </span>
                ) : (
                  <span>
                    <FaHeadset className="me-1" />
                    Atención en consultorio físico con dirección requerida
                  </span>
                )}
              </div>
            </div>

            <div className="virtual-attention-toggle">
              <div className={`toggle-switch ${value ? 'active' : ''}`}>
                <div className="toggle-slider">
                  <div className="toggle-circle">
                    {value ? <BsShieldCheck /> : <BsLightbulb />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {value && (
            <div className="virtual-attention-benefits">
              <div className="benefits-header">
                <MdVideoCall className="me-1" />
                <small>Beneficios de la atención virtual:</small>
              </div>
              <div className="benefits-list">
                <span className="benefit-item">
                  <BsShieldCheck className="me-1" />
                  Sin necesidad de dirección física
                </span>
                <span className="benefit-item">
                  <LuWifi className="me-1" />
                  Acceso remoto para pacientes
                </span>
                <span className="benefit-item">
                  <FaVideo className="me-1" />
                  Consultas por videollamada
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input oculto para formularios */}
      <input
        type="hidden"
        name="atencionVirtual"
        value={value ? 'Si' : 'No'}
      />
    </div>
  );
};

export default VirtualAttentionToggle;