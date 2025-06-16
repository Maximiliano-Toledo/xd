import React from "react";

const FormValidationMessage = ({ formStep, camposObligatoriosCompletos }) => {
  if (formStep !== 1 || camposObligatoriosCompletos()) {
    return null;
  }

  return (
    <p className="text-danger fw-bold text-center mt-3">
      Completá todos los campos obligatorios para habilitar el botón de cargar
    </p>
  );
};

export default FormValidationMessage;