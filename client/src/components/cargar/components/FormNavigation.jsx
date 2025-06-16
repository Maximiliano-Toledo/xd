import React from "react";

const FormNavigation = ({
                          formStep,
                          completeFormStep,
                          backFormStep,
                          camposObligatoriosCompletos,
                          loadingCrearPrestador
                        }) => {
  return (
    <div className="d-flex justify-content-between mt-4">
      {formStep === 1 && (
        <button
          className="back-button"
          type="button"
          onClick={backFormStep}
        >
          Anterior
        </button>
      )}

      {formStep === 0 && (
        <div className="ms-auto">
          <button
            className="back-button"
            type="button"
            onClick={completeFormStep}
          >
            Siguiente
          </button>
        </div>
      )}

      {formStep === 1 && (
        <button
          className="btn btn-search text-white text-center text-uppercase"
          type="submit"
          disabled={!camposObligatoriosCompletos() || loadingCrearPrestador}
        >
          {loadingCrearPrestador ? "Cargando..." : "Cargar un prestador"}
        </button>
      )}
    </div>
  );
};

export default FormNavigation;