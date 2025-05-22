import React from "react";
import { FiSearch } from "react-icons/fi";
import CustomSelect from "../../CustomSelect";
import SearchMethodTabs from "../../cartilla/SearchMethodTabs";

const SearchStep = ({
                      formData,
                      options,
                      loading,
                      handleChange,
                      handleSubmit,
                      handleMethodChange,
                      adaptarOpciones
                    }) => {
  return (
    <div>
      <h1 className="w-50 fs-5 text-center pt-2 pb-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 ms-4 me-4">
        Edición individual
      </h1>

      <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0 ms-4 me-4">
        <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5">
          <h6 className="fs-2 h1-titulo fw-bold">
            Buscá el prestador que deseas editar
          </h6>
        </div>
      </div>

      <div className="d-flex justify-content-center align-items-start min-vh-100 ms-4 me-4">
        <div className="w-100 d-flex flex-column border shadow-input p-5 rounded-3 shadow mt-5 mb-3">
          <form onSubmit={handleSubmit}>
            <SearchMethodTabs
              searchMethod={formData.searchMethod}
              onSearchMethodChange={handleMethodChange}
            />

            <div className="mb-4">
              <label
                htmlFor="plan"
                className="d-flex justify-content-center p-1 text-success-label fw-medium fs-6"
              >
                Plan
              </label>
              <div className="d-flex justify-content-center">
                <div className="w-50">
                  <CustomSelect
                    options={adaptarOpciones(
                      options.planes,
                      "id_plan",
                      "nombre"
                    )}
                    value={formData.plan}
                    onChange={handleChange}
                    name="plan"
                    placeholder={
                      loading.planes
                        ? "Cargando planes..."
                        : "Seleccione un plan"
                    }
                    disabled={loading.planes}
                    loading={loading.planes}
                  />
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <label
                  htmlFor="provincia"
                  className="p-1 text-success-label fw-medium fs-6"
                >
                  Provincia:
                </label>
                <CustomSelect
                  options={adaptarOpciones(
                    options.provincias,
                    "id_provincia",
                    "nombre"
                  )}
                  value={formData.provincia}
                  onChange={handleChange}
                  name="provincia"
                  placeholder={
                    loading.provincias
                      ? "Cargando provincias..."
                      : "Seleccione una provincia"
                  }
                  disabled={loading.provincias || !formData.plan}
                  loading={loading.provincias}
                />
              </div>
              <div className="col-md-6">
                <label
                  htmlFor="localidad"
                  className="p-1 text-success-label fw-medium fs-6"
                >
                  Localidad:
                </label>
                <CustomSelect
                  options={adaptarOpciones(
                    options.localidades,
                    "id_localidad",
                    "nombre"
                  )}
                  value={formData.localidad}
                  onChange={handleChange}
                  name="localidad"
                  placeholder={
                    loading.localidades
                      ? "Cargando localidades..."
                      : "Seleccione una localidad"
                  }
                  disabled={loading.localidades || !formData.provincia}
                  loading={loading.localidades}
                />
              </div>
            </div>

            {formData.searchMethod === "normal" ? (
              <div className="row mb-4">
                <div className="col-md-6">
                  <label
                    htmlFor="categoria"
                    className="p-1 text-success-label fw-medium fs-6"
                  >
                    Categoría:
                  </label>
                  <CustomSelect
                    options={adaptarOpciones(
                      options.categorias,
                      "id_categoria",
                      "nombre"
                    )}
                    value={formData.categoria}
                    onChange={handleChange}
                    name="categoria"
                    placeholder={
                      loading.categorias
                        ? "Cargando categorías..."
                        : "Seleccione una categoría"
                    }
                    disabled={loading.categorias || !formData.localidad}
                    loading={loading.categorias}
                  />
                </div>
                <div className="col-md-6">
                  <label
                    htmlFor="especialidad"
                    className="p-1 text-success-label fw-medium fs-6"
                  >
                    Especialidad:
                  </label>
                  <CustomSelect
                    options={adaptarOpciones(
                      options.especialidades,
                      "id_especialidad",
                      "nombre"
                    )}
                    value={formData.especialidad}
                    onChange={handleChange}
                    name="especialidad"
                    placeholder={
                      loading.especialidades
                        ? "Cargando especialidades..."
                        : "Seleccione una especialidad"
                    }
                    disabled={loading.especialidades || !formData.categoria}
                    loading={loading.especialidades}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label
                      htmlFor="categoria"
                      className="p-1 text-success-label fw-medium fs-6"
                    >
                      Categoría:
                    </label>
                    <CustomSelect
                      options={adaptarOpciones(
                        options.categorias,
                        "id_categoria",
                        "nombre"
                      )}
                      value={formData.categoria}
                      onChange={handleChange}
                      name="categoria"
                      placeholder={
                        loading.categorias
                          ? "Cargando categorías..."
                          : "Seleccione una categoría"
                      }
                      disabled={loading.categorias || !formData.localidad}
                      loading={loading.categorias}
                    />
                  </div>
                  <div className="col-md-6">
                    <label
                      htmlFor="nombrePrestador"
                      className="p-1 text-success-label fw-medium fs-6"
                    >
                      Nombre del prestador:
                    </label>
                    <CustomSelect
                      options={adaptarOpciones(
                        options.nombresPrestadores,
                        "id_prestador",
                        "nombre"
                      )}
                      value={formData.nombrePrestador}
                      onChange={handleChange}
                      name="nombrePrestador"
                      placeholder={
                        loading.nombresPrestadores
                          ? "Cargando prestadores..."
                          : "Seleccione un prestador"
                      }
                      disabled={
                        loading.nombresPrestadores || !formData.categoria
                      }
                      loading={loading.nombresPrestadores}
                    />
                  </div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-6 mx-auto">
                    <label
                      htmlFor="especialidad"
                      className="p-1 text-success-label fw-medium fs-6"
                    >
                      Especialidad:
                    </label>
                    <CustomSelect
                      options={adaptarOpciones(
                        options.especialidadesPrestador,
                        "id_especialidad",
                        "nombre"
                      )}
                      value={formData.especialidad}
                      onChange={handleChange}
                      name="especialidad"
                      placeholder={
                        loading.especialidadesPrestador
                          ? "Cargando especialidades..."
                          : "Seleccione una especialidad"
                      }
                      disabled={
                        loading.especialidadesPrestador ||
                        !formData.nombrePrestador
                      }
                      loading={loading.especialidadesPrestador}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="d-flex justify-content-center">
              <button
                className="btn btn-volver rounded-pill text-white text-center text-uppercase mt-2 p-1"
                type="submit"
                disabled={
                  !formData.plan ||
                  !formData.provincia ||
                  !formData.localidad ||
                  !formData.categoria ||
                  (formData.searchMethod === "normal"
                    ? !formData.especialidad
                    : !formData.nombrePrestador) ||
                  loading.prestadores
                }
              >
                {loading.prestadores ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Buscando...
                  </>
                ) : (
                  <>
                    <FiSearch className="text-white pe-1" />
                    Buscar prestadores
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SearchStep;