import React from "react";
import DatosInstitucionales from "./DatosInstitucionales";
import DatosUbicacionContacto from "./DatosUbicacionContacto";
import FormHeader from "./FormHeader";
import FormNavigation from "./FormNavigation";
import FormValidationMessage from "./FormValidationMessage";

const FormWizard = ({
                      formData,
                      setFormData,
                      formStep,
                      setFormStep,
                      planes,
                      categorias,
                      especialidades,
                      provincias,
                      localidades,
                      loading,
                      loadingCrearPrestador,
                      getLocalidadesByProvincia,
                      esProfesional,
                      camposObligatoriosCompletos,
                      handleChange,
                      onSubmit,
                      register,
                      errors,
                      watch,
                      setValue,
                      validarTelefono,
                      validarEmail
                    }) => {
  const completeFormStep = () => {
    setFormStep((currPage) => currPage + 1);
  };

  const backFormStep = () => {
    setFormStep((currPage) => currPage - 1);
  };

  return (
    <form
      className="d-flex justify-content-center align-items-start min-vh-75 mt-5 ms-4 me-4"
      onSubmit={onSubmit}
    >
      <div className="w-100 d-flex flex-column border shadow-input p-2 rounded-3 shadow">
        <FormHeader formStep={formStep} />

        {formStep === 0 && (
          <DatosInstitucionales
            formData={formData}
            planes={planes}
            categorias={categorias}
            especialidades={especialidades}
            loading={loading}
            handleChange={handleChange}
            register={register}
            errors={errors}
          />
        )}

        {formStep === 1 && (
          <DatosUbicacionContacto
            formData={formData}
            setFormData={setFormData}
            provincias={provincias}
            localidades={localidades}
            categorias={categorias}
            loading={loading}
            getLocalidadesByProvincia={getLocalidadesByProvincia}
            esProfesional={esProfesional}
            handleChange={handleChange}
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            validarTelefono={validarTelefono}
            validarEmail={validarEmail}
          />
        )}

        <FormNavigation
          formStep={formStep}
          completeFormStep={completeFormStep}
          backFormStep={backFormStep}
          camposObligatoriosCompletos={camposObligatoriosCompletos}
          loadingCrearPrestador={loadingCrearPrestador}
        />

        <FormValidationMessage
          formStep={formStep}
          camposObligatoriosCompletos={camposObligatoriosCompletos}
        />
      </div>
    </form>
  );
};

export default FormWizard;