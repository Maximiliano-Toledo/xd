import CustomSelect from "../CustomSelect";

const SpecialtyFields = ({
    formData,
    options,
    loading,
    onFieldChange,
    searchMethod = "normal"
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

    if (searchMethod === "normal") {
        return (
            <div className="search-select-group speciality-select">
                <CustomSelect
                    options={adaptarOpciones(options.especialidades, "id_especialidad", "nombre")}
                    value={formData.especialidad}
                    onChange={onFieldChange}
                    name="especialidad"
                    placeholder="Seleccioná la especialidad"
                    disabled={!formData.categoria || loading.especialidades}
                    loading={loading.especialidades}
                    className="search-select"
                />
            </div>
        );
    }

    return (
        <>
            <div className="search-select-group">
                <CustomSelect
                    options={adaptarOpciones(options.nombresPrestadores, "id_prestador", "nombre")}
                    value={formData.nombrePrestador}
                    onChange={onFieldChange}
                    name="nombrePrestador"
                    placeholder="Seleccioná el prestador"
                    disabled={!formData.categoria || loading.nombresPrestadores}
                    loading={loading.nombresPrestadores}
                    className="search-select"
                />
            </div>

            <div className="search-select-group">
                <CustomSelect
                    options={adaptarOpciones(options.especialidadesPrestador, "id_especialidad", "nombre")}
                    value={formData.especialidad}
                    onChange={onFieldChange}
                    name="especialidad"
                    placeholder="Seleccioná la especialidad"
                    disabled={!formData.nombrePrestador || loading.especialidadesPrestador}
                    loading={loading.especialidadesPrestador}
                    className="search-select"
                />
            </div>
        </>
    );
};

export default SpecialtyFields;