import { FiSearch } from "react-icons/fi";

const SearchButton = ({
    formData,
    loading,
    searchMethod = "normal"
}) => {
    const isDisabled = () => {
        const hasLoading = Object.values(loading).some(Boolean);

        if (searchMethod === "virtual") {
            // Solo necesitamos estos campos para búsqueda virtual
            return hasLoading || 
                !formData.plan || 
                !formData.categoria || 
                !formData.especialidad;
        }

        if (searchMethod === "normal") {
            // Campos para búsqueda normal
            return hasLoading || 
                !formData.plan || 
                !formData.provincia || 
                !formData.localidad || 
                !formData.categoria || 
                !formData.especialidad;
        }

        if (searchMethod === "porNombre") {
            // Campos para búsqueda por nombre
            return hasLoading || 
                !formData.plan || 
                !formData.provincia || 
                !formData.localidad || 
                !formData.categoria || 
                !formData.especialidad || 
                !formData.nombrePrestador;
        }

        return true; // Por defecto deshabilitado si no coincide con ningún método
    };

    const getButtonText = () => {
        if (Object.values(loading).some(Boolean)) {
            return "Cargando...";
        }
        return "Buscar prestadores";
    };

    return (
        <div className="search-button-container">
            <button
                type="submit"
                className="search-button"
                disabled={isDisabled()}
            >
                {!Object.values(loading).some(Boolean) && (
                    <FiSearch className="search-button-icon" />
                )}
                {getButtonText()}
            </button>
        </div>
    );
};

export default SearchButton;