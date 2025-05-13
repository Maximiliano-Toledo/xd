import { FiSearch } from "react-icons/fi";

const SearchButton = ({
    formData,
    loading,
    searchMethod = "normal"
}) => {
    const isDisabled = () => {
        const hasLoading = Object.values(loading).some(Boolean);

        const commonFields = [
            "plan",
            "provincia",
            "localidad",
            "categoria",
            "especialidad"
        ];

        if (searchMethod === "normal") {
            return hasLoading || commonFields.some(field => !formData[field]);
        }

        // Para búsqueda por nombre
        return hasLoading ||
            [...commonFields, "nombrePrestador"].some(field => !formData[field]);
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