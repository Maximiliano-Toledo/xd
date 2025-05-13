import CustomSelect from "../CustomSelect";

const SearchFormFields = ({
    formData,
    options,
    loading,
    onFieldChange
}) => {
    const adaptarOpciones = (opciones, idKey, nombreKey) => {
        // Caso especial para prestadores
        if (idKey === "id_prestador") {
            return opciones.map((opcion) => ({
                id: opcion[nombreKey],
                nombre: opcion[nombreKey],
                originalId: opcion[idKey],
            }));
        }

        return opciones.map((opcion) => ({
            id: opcion[idKey],
            nombre: opcion[nombreKey],
        }));
    };

    return (
        <div className="search-form-selects">
            {/* Plan */}
            <div className="search-select-group">
                <CustomSelect
                    options={adaptarOpciones(options.planes, "id_plan", "nombre")}
                    value={formData.plan}
                    onChange={onFieldChange}
                    name="plan"
                    placeholder="Seleccioná tu plan"
                    disabled={loading.planes}
                    loading={loading.planes}
                    className="search-select"
                />
            </div>

            {/* Provincia y Localidad */}
            <div className="search-select-row">
                <div className="search-select-group">
                    <CustomSelect
                        options={adaptarOpciones(options.provincias, "id_provincia", "nombre")}
                        value={formData.provincia}
                        onChange={onFieldChange}
                        name="provincia"
                        placeholder="Seleccioná la provincia"
                        disabled={!formData.plan || loading.provincias}
                        loading={loading.provincias}
                        className="search-select"
                    />
                </div>

                <div className="search-select-group">
                    <CustomSelect
                        options={adaptarOpciones(options.localidades, "id_localidad", "nombre")}
                        value={formData.localidad}
                        onChange={onFieldChange}
                        name="localidad"
                        placeholder="Seleccioná la localidad"
                        disabled={!formData.provincia || loading.localidades}
                        loading={loading.localidades}
                        className="search-select"
                    />
                </div>
            </div>
        </div>
    );
};

export default SearchFormFields;