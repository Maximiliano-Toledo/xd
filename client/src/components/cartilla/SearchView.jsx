import SearchForm from "./SearchForm";

const SearchView = ({
    formData,
    options,
    loading,
    selectedCategory,
    availableCategories,
    criteriosSeleccionados,
    onSubmit,
    onFieldChange,
    onCategoryClick,
    onSearchMethodChange
}) => {
    return (
        <div className="search-view">
            <div className="content-header">
                <h2 className="content-title">Buscar prestadores</h2>
                <p className="content-subtitle">
                    Consultá profesionales, centros de salud y servicios médicos disponibles en tu zona
                </p>
            </div>

            <SearchForm
                formData={formData}
                options={options}
                loading={loading}
                selectedCategory={selectedCategory}
                availableCategories={availableCategories}
                criteriosSeleccionados={criteriosSeleccionados}
                onSubmit={onSubmit}
                onFieldChange={onFieldChange}
                onCategoryClick={onCategoryClick}
                onSearchMethodChange={onSearchMethodChange}
            />
        </div>
    );
};

export default SearchView;