import { BsArrowLeft } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import PrestadorCard from "./PrestadorCard";
import Pagination from "../Pagination";

const SearchResults = ({
    prestadores,
    loading,
    pagination,
    options,
    formData,
    onBackToSearch,
    onPageChange,
    onPageSizeChange
}) => {
    const getSearchSummary = () => {
        const planName = options.planes.length > 0 && formData.plan
            ? (options.planes.find(p => p.id_plan == formData.plan) ||
                options.planes.find(p => String(p.id_plan) === String(formData.plan)))?.nombre || ""
            : "";

        const provinciaName = options.provincias.length > 0 && formData.provincia
            ? (options.provincias.find(p => p.id_provincia == formData.provincia) ||
                options.provincias.find(p => String(p.id_provincia) === String(formData.provincia)))?.nombre || ""
            : "";

        const localidadName = options.localidades.length > 0 && formData.localidad
            ? (options.localidades.find(p => p.id_localidad == formData.localidad) ||
                options.localidades.find(p => String(p.id_localidad) === String(formData.localidad)))?.nombre || ""
            : "";

        // Check both especialidades and especialidadesVirtuales
        const especialidadName = options.especialidades.length > 0 && formData.especialidad
            ? (options.especialidades.find(e => e.id_especialidad == formData.especialidad) ||
                options.especialidades.find(e => String(e.id_especialidad) === String(formData.especialidad)))?.nombre || ""
            : (options.especialidadesPrestador.length > 0 && formData.especialidad
                ? (options.especialidadesPrestador.find(e => e.id_especialidad == formData.especialidad) ||
                    options.especialidadesPrestador.find(e => String(e.id_especialidad) === String(formData.especialidad)))?.nombre || ""
                : (options.especialidadesVirtuales?.length > 0 && formData.especialidad
                    ? (options.especialidadesVirtuales.find(e => e.id_especialidad == formData.especialidad) ||
                        options.especialidadesVirtuales.find(e => String(e.id_especialidad) === String(formData.especialidad)))?.nombre || ""
                    : ""));

        const atencionVirtual = options.especialidadesVirtuales?.length > 0 && formData.especialidad
            ? "Atención virtual"
            : "";

        return { planName, provinciaName, localidadName, especialidadName, atencionVirtual };
    };

    const { planName, provinciaName, localidadName, especialidadName, atencionVirtual } = getSearchSummary();

    // Crear un array con los tags de la búsqueda
    const searchTags = [
        planName,
        provinciaName,
        localidadName,
        especialidadName,
        atencionVirtual
    ].filter(tag => tag && tag.trim() !== "");

    if (loading.prestadores) {
        return (
            <div className="results-view">
                <div className="results-container">
                    <div className="loading-container">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p>Cargando prestadores...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (prestadores.length === 0) {
        return (
            <div className="results-view">
                <div className="results-header">
                    <button className="btn-back" onClick={onBackToSearch}>
                        <BsArrowLeft /> Volver a la búsqueda
                    </button>
                </div>
                <div className="results-container">
                    <div className="no-results">
                        <div className="no-results-icon">
                            <FiSearch />
                        </div>
                        <h3>No se encontraron prestadores</h3>
                        <p>No hay prestadores que coincidan con los criterios de búsqueda seleccionados.</p>
                        <button className="btn-retry" onClick={onBackToSearch}>
                            Modificar la búsqueda
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="results-view">
            <div className="results-header">
                <button className="btn-back" onClick={onBackToSearch}>
                    <BsArrowLeft /> Volver a la búsqueda
                </button>
                <h2 className="results-title">Resultados de la búsqueda</h2>
                {searchTags.length > 0 && (
                    <div className="search-summary">
                        {searchTags.map((tag, index) => (
                            <span key={index} className="search-tag">{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            <div className="results-container">
                <div className="results-count">
                    <strong>{pagination.totalItems}</strong> prestadores encontrados
                </div>

                <div className="results-list">
                    {prestadores.map((prestador) => (
                        <PrestadorCard
                            key={prestador.id_prestador || `prestador-${Math.random()}`}
                            prestador={prestador}
                        />
                    ))}
                </div>

                <div className="pagination-wrapper">
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={onPageChange}
                        itemsPerPage={pagination.itemsPerPage}
                        onItemsPerPageChange={onPageSizeChange}
                        totalItems={pagination.totalItems}
                    />
                </div>
            </div>
        </div>
    );
};

export default SearchResults;