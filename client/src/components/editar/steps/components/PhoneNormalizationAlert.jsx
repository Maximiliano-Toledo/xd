import React, { useState } from 'react';
import {
  FiPhone,
  FiMapPin,
  FiRefreshCw,
  FiEdit3,
  FiAlertTriangle,
  FiInfo,
  FiCheckCircle,
  FiArrowRight,
  FiX,
  FiCheck
} from 'react-icons/fi';
import "../../../../styles/phone-normalization.css";
import { normalizePhoneWithLocation, normalizePhoneWithPrefixes } from "../../../../utils/phoneFormatter.js";
import PhoneInput from "../../../../utils/PhoneInput.jsx";

const PhoneNormalizationAlert = ({
                                   originalPhones,
                                   prestadorUbicacion = null,
                                   onNormalizeClick,
                                   onManualEdit
                                 }) => {
  const [showVerificationCard, setShowVerificationCard] = useState(false);
  const [showManualEditMode, setShowManualEditMode] = useState(false);
  const [normalizedResult, setNormalizedResult] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  const handleNormalizePhones = () => {
    if (!originalPhones) return;

    try {
      let normalizedPhones;

      // Guardar los datos originales para mostrar en la verificación
      setOriginalData(originalPhones);

      // Si tenemos información de ubicación, usarla para normalización mejorada
      if (prestadorUbicacion?.provincia) {
        normalizedPhones = normalizePhoneWithLocation(
          originalPhones,
          prestadorUbicacion.provincia,
          prestadorUbicacion.localidad
        );
      } else {
        // Fallback al método anterior
        normalizedPhones = normalizePhoneWithPrefixes(originalPhones);
      }

      // Guardar el resultado normalizado
      setNormalizedResult(normalizedPhones);

      // Mostrar el card de verificación
      setShowVerificationCard(true);
    } catch (error) {
      console.error("Error al normalizar teléfonos:", error);
      // Fallback al método anterior
      const fallbackNormalized = normalizePhoneWithPrefixes(originalPhones);
      setOriginalData(originalPhones);
      setNormalizedResult(fallbackNormalized);
      setShowVerificationCard(true);
    }
  };

  const handleConfirmNormalization = () => {
    // Enviar la normalización confirmada al componente padre
    onNormalizeClick(normalizedResult);
    setShowVerificationCard(false);
    setNormalizedResult(null);
    setOriginalData(null);
  };

  const handleCancelNormalization = () => {
    // Cancelar la normalización
    setShowVerificationCard(false);
    setNormalizedResult(null);
    setOriginalData(null);
  };

  const handleManualEdit = () => {
    // NO aplicar normalización, solo mostrar el modo de edición manual
    setShowManualEditMode(true);
    setShowVerificationCard(false);
  };

  const handleCancelManualEdit = () => {
    // Volver al estado inicial sin aplicar cambios
    setShowManualEditMode(false);
    setNormalizedResult(null);
    setOriginalData(null);
  };

  const handleManualPhoneChange = (newPhoneValue) => {
    // Cuando el usuario actualiza los teléfonos manualmente, aplicar los cambios
    onNormalizeClick(newPhoneValue);
    setShowManualEditMode(false);
  };

  const formatNormalizedForDisplay = (normalizedData) => {
    try {
      if (typeof normalizedData === 'string' && normalizedData.startsWith('[')) {
        const phones = JSON.parse(normalizedData);
        return phones.map(phone => {
          const tipo = phone.tipo === 'celular' ? 'Cel' : phone.tipo === 'fijo' ? 'Tel' : phone.tipo;
          const numero = phone.codigoArea ? `${phone.codigoArea} ${phone.numero}` : phone.numero;
          const extension = phone.extension ? ` int:${phone.extension}` : '';
          const descripcion = phone.descripcion ? ` (${phone.descripcion})` : '';
          return `${tipo}: ${numero}${extension}${descripcion}`;
        }).join(' | ');
      }
      return normalizedData;
    } catch (error) {
      return normalizedData;
    }
  };

  return (
    <div className="phone-normalization-container">
      {/* Card de verificación para normalización automática */}
      {showVerificationCard && (
        <div className="verification-card">
          <div className="verification-card-header">
            <div className="verification-icon-wrapper">
              <FiCheckCircle className="verification-icon" />
            </div>
            <div className="verification-title-section">
              <h4 className="verification-title">Verificar normalización</h4>
              <p className="verification-subtitle">
                Revisa que la información esté correcta antes de aplicar los cambios
              </p>
            </div>
            <button
              className="verification-close-btn"
              onClick={handleCancelNormalization}
              type="button"
            >
              <FiX />
            </button>
          </div>

          <div className="verification-content">
            {/* Comparación antes/después */}
            <div className="comparison-section">
              <div className="comparison-item">
                <div className="comparison-label">
                  <FiPhone className="comparison-icon" />
                  <span>Formato anterior:</span>
                </div>
                <div className="comparison-value original">
                  {originalData || "No disponible"}
                </div>
              </div>

              <div className="comparison-arrow">
                <FiArrowRight />
              </div>

              <div className="comparison-item">
                <div className="comparison-label">
                  <FiCheckCircle className="comparison-icon" />
                  <span>Formato normalizado:</span>
                </div>
                <div className="comparison-value normalized">
                  {formatNormalizedForDisplay(normalizedResult)}
                </div>
              </div>
            </div>

            {/* Información de ubicación si está disponible */}
            {prestadorUbicacion?.provincia && (
              <div className="location-info-section">
                <div className="location-info-item">
                  <FiMapPin className="location-info-icon" />
                  <span className="location-info-text">
                    Normalización basada en: {prestadorUbicacion.localidad}, {prestadorUbicacion.provincia}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción del card de verificación */}
          <div className="verification-actions">
            <button
              type="button"
              className="verification-btn verification-btn-secondary"
              onClick={handleCancelNormalization}
            >
              <FiX className="btn-icon" />
              <span className="btn-text">Cancelar</span>
            </button>

            <button
              type="button"
              className="verification-btn verification-btn-primary"
              onClick={handleConfirmNormalization}
            >
              <FiCheck className="btn-icon" />
              <span className="btn-text">Confirmar normalización</span>
            </button>
          </div>
        </div>
      )}

      {/* Modo de edición manual */}
      {showManualEditMode && (
        <div className="manual-edit-container">
          {/* Card informativo con datos actuales */}
          <div className="current-data-card">
            <div className="current-data-header">
              <div className="current-data-icon-wrapper">
                <FiInfo className="current-data-icon" />
              </div>
              <div className="current-data-title-section">
                <h4 className="current-data-title">Datos telefónicos actuales</h4>
                <p className="current-data-subtitle">
                  A continuación puedes ver los datos actuales y agregar nuevos teléfonos estructurados
                </p>
              </div>
              <button
                className="current-data-close-btn"
                onClick={handleCancelManualEdit}
                type="button"
              >
                <FiX />
              </button>
            </div>

            <div className="current-data-content">
              <div className="current-data-display">
                <div className="current-data-label">
                  <FiPhone className="current-data-display-icon" />
                  <span>Formato actual:</span>
                </div>
                <div className="current-data-value">
                  {originalPhones || "No disponible"}
                </div>
              </div>

              {/*{prestadorUbicacion?.provincia && (*/}
              {/*  <div className="location-context-info">*/}
              {/*    <FiMapPin className="location-context-icon" />*/}
              {/*    <span className="location-context-text">*/}
              {/*      El sistema sugerirá códigos de área apropiados para {prestadorUbicacion.localidad}, {prestadorUbicacion.provincia}*/}
              {/*    </span>*/}
              {/*  </div>*/}
              {/*)}*/}
            </div>
          </div>

          {/* PhoneInput para edición manual */}
          <div className="manual-phone-input-container">
            <PhoneInput
              value={originalPhones || ''}
              onChange={handleManualPhoneChange}
              disabled={false}
              required={true}
              ubicacionContext={prestadorUbicacion}
              hideOldFormatAlert={true}
              skipAutoNormalization={true}
            />
          </div>
        </div>
      )}

      {/* Indicador de contexto de ubicación mejorado */}
      {!showVerificationCard && !showManualEditMode && prestadorUbicacion?.provincia && (
        <div className="location-context-card">
          <div className="location-context-icon">
            <FiMapPin />
          </div>
          <div className="location-context-content">
            <span className="location-context-title">Detección inteligente habilitada</span>
            <span className="location-context-subtitle">
              {prestadorUbicacion.localidad}, {prestadorUbicacion.provincia}
            </span>
          </div>
          <div className="location-context-badge">
            <FiCheckCircle />
          </div>
        </div>
      )}

      {/* Alerta principal mejorada */}
      {!showVerificationCard && !showManualEditMode && (
        <div className="phone-normalization-alert">
          <div className="alert-header">
            <div className="alert-icon-wrapper">
              <FiAlertTriangle className="alert-icon" />
            </div>
            <div className="alert-title-section">
              <h4 className="alert-title">Formato telefónico desactualizado</h4>
              <p className="alert-subtitle">
                Los datos telefónicos necesitan actualización para mejor organización
              </p>
            </div>
          </div>

          <div className="alert-content">
            {/* Datos actuales con mejor presentación */}
            <div className="current-data-section">
              <div className="current-data-header">
                <FiPhone className="current-data-icon" />
                <span className="current-data-label">Datos actuales:</span>
              </div>
              <div className="current-data-value">
                {originalPhones || "No disponible"}
              </div>
            </div>

            {/* Información adicional sobre el proceso */}
            <div className="process-info-section">
              <div className="process-info-item">
                <FiInfo className="process-info-icon" />
                <span className="process-info-text">
                  {prestadorUbicacion?.provincia
                    ? "Se utilizará la ubicación del prestador para optimizar la detección de códigos de área"
                    : "Se aplicará normalización estándar para estructurar los datos telefónicos"
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Botones de acción mejorados */}
          <div className="alert-actions">
            <button
              type="button"
              className="action-btn action-btn-primary"
              onClick={handleNormalizePhones}
            >
              <FiRefreshCw className="btn-icon" />
              <span className="btn-text">
                {prestadorUbicacion?.provincia ? 'Normalizar con ubicación' : 'Normalizar automáticamente'}
              </span>
            </button>

            <button
              type="button"
              className="action-btn action-btn-secondary"
              onClick={handleManualEdit}
            >
              <FiEdit3 className="btn-icon" />
              <span className="btn-text">Editar manualmente</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneNormalizationAlert;