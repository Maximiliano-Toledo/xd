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
        // Verificaciones de seguridad para evitar errores de propiedades undefined
        const planes = options?.planes || [];
        const provincias = options?.provincias || [];
        const localidades = options?.localidades || [];
        const categorias = options?.categorias || [];
        const categoriasPrestador = options?.categoriasPrestador || [];
        const categoriasVirtuales = options?.categoriasVirtuales || [];
        const especialidades = options?.especialidades || [];
        const especialidadesPrestador = options?.especialidadesPrestador || [];
        const especialidadesVirtuales = options?.especialidadesVirtuales || [];

        const planName = planes.length > 0 && formData.plan
          ? (planes.find(p => p.id_plan == formData.plan) ||
          planes.find(p => String(p.id_plan) === String(formData.plan)))?.nombre || ""
          : "";

        const provinciaName = provincias.length > 0 && formData.provincia
          ? (provincias.find(p => p.id_provincia == formData.provincia) ||
          provincias.find(p => String(p.id_provincia) === String(formData.provincia)))?.nombre || ""
          : "";

        const localidadName = localidades.length > 0 && formData.localidad
          ? (localidades.find(p => p.id_localidad == formData.localidad) ||
          localidades.find(p => String(p.id_localidad) === String(formData.localidad)))?.nombre || ""
          : "";

        // Buscar en múltiples fuentes de categorías con verificaciones de seguridad
        let categoriaName = "";
        if (categorias.length > 0 && formData.categoria) {
            const categoria = categorias.find(e => e.id_categoria == formData.categoria) ||
              categorias.find(e => String(e.id_categoria) === String(formData.categoria));
            categoriaName = categoria?.nombre || "";
        } else if (categoriasPrestador.length > 0 && formData.categoria) {
            const categoria = categoriasPrestador.find(e => e.id_categoria == formData.categoria) ||
              categoriasPrestador.find(e => String(e.id_categoria) === String(formData.categoria));
            categoriaName = categoria?.nombre || "";
        } else if (categoriasVirtuales.length > 0 && formData.categoria) {
            const categoria = categoriasVirtuales.find(e => e.id_categoria == formData.categoria) ||
              categoriasVirtuales.find(e => String(e.id_categoria) === String(formData.categoria));
            categoriaName = categoria?.nombre || "";
        }

        // Buscar en múltiples fuentes de especialidades con verificaciones de seguridad
        let especialidadName = "";
        if (especialidades.length > 0 && formData.especialidad) {
            const especialidad = especialidades.find(e => e.id_especialidad == formData.especialidad) ||
              especialidades.find(e => String(e.id_especialidad) === String(formData.especialidad));
            especialidadName = especialidad?.nombre || "";
        } else if (especialidadesPrestador.length > 0 && formData.especialidad) {
            const especialidad = especialidadesPrestador.find(e => e.id_especialidad == formData.especialidad) ||
              especialidadesPrestador.find(e => String(e.id_especialidad) === String(formData.especialidad));
            especialidadName = especialidad?.nombre || "";
        } else if (especialidadesVirtuales.length > 0 && formData.especialidad) {
            const especialidad = especialidadesVirtuales.find(e => e.id_especialidad == formData.especialidad) ||
              especialidadesVirtuales.find(e => String(e.id_especialidad) === String(formData.especialidad));
            especialidadName = especialidad?.nombre || "";
        }

        // Verificar si es una búsqueda de atención virtual
        const atencionVirtual = especialidadesVirtuales.length > 0 && formData.especialidad
          ? "Atención virtual"
          : "";

        return { planName, provinciaName, localidadName, categoriaName, especialidadName, atencionVirtual };
    };

    const { planName, provinciaName, localidadName, categoriaName, especialidadName, atencionVirtual } = getSearchSummary();

    // Crear un array con los tags de la búsqueda
    const searchTags = [
        planName,
        provinciaName,
        localidadName,
        categoriaName,
        especialidadName,
        atencionVirtual
    ].filter(tag => tag && tag.trim() !== "");

    if (loading?.prestadores) {
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

    if (!prestadores || prestadores.length === 0) {
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
                  <strong>{pagination?.totalItems || 0}</strong> prestadores encontrados
              </div>

              <div className="results-list">
                  {prestadores.map((prestador) => (
                    <PrestadorCard
                      key={prestador.id_prestador || `prestador-${Math.random()}`}
                      prestador={prestador}
                    />
                  ))}
              </div>

              {pagination && (
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
              )}
          </div>
      </div>
    );
};

export default SearchResults;