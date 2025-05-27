import React from 'react';

import "../../../../styles/phone-normalization.css"
import {normalizeOldPhoneFormat, normalizePhoneWithPrefixes} from "../../../../utils/phoneFormatter.js";


const PhoneNormalizationAlert = ({
                                   originalPhones,
                                   onNormalizeClick,
                                   onManualEdit
                                 }) => {

  const handleNormalizePhones = () => {
    if (!originalPhones) return;

    try {
      // Usar la nueva función con prefijos
      const normalizedPhones = normalizePhoneWithPrefixes(originalPhones);
      const phoneJsonString = JSON.stringify(normalizedPhones);

      onNormalizeClick(phoneJsonString);
    } catch (error) {
      console.error("Error al normalizar teléfonos:", error);
      // Fallback al método anterior
      onNormalizeClick(normalizeOldPhoneFormat(originalPhones));
    }
  };

  return (
    <div className="alert alert-warning mb-3">
      <h5 className="alert-heading">
        <i className="fas fa-exclamation-triangle me-2"></i>
        Formato de teléfono desactualizado
      </h5>
      <p>
        El formato actual de los teléfonos necesita ser actualizado al nuevo
        formato estructurado para una mejor organización y visualización.
      </p>
      <p className="mb-0">
        <strong>Datos actuales:</strong> {originalPhones || "No disponible"}
      </p>
      <hr />
      <div className="d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-success"
          onClick={handleNormalizePhones}
        >
          Normalizar automáticamente
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onManualEdit}
        >
          Editar manualmente
        </button>
      </div>
    </div>
  );
};

export default PhoneNormalizationAlert;