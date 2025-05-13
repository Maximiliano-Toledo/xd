import SearchMethodTabs from "./SearchMethodTabs";
import SearchFormFields from "./SearchFormFields";
import CategorySelector from "./CategorySelector";
import SpecialtyFields from "./SpecialtyFields";
import SearchButton from "./SearchButton";

const SearchForm = ({
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
        <div className="search-form-container">
            <div className="search-form-card">
                <div className="search-form-header">
                    <h2>Encontrá profesionales de la salud</h2>
                    <p>Seleccioná los criterios para buscar prestadores en tu zona</p>
                </div>

                {/* Botones para cambiar el método de búsqueda */}
                <SearchMethodTabs
                    searchMethod={formData.searchMethod}
                    onSearchMethodChange={onSearchMethodChange}
                />

                <form onSubmit={onSubmit}>
                    <div className="search-form-selects">
                        {/* Campos básicos del formulario */}
                        <SearchFormFields
                            formData={formData}
                            options={options}
                            loading={loading}
                            onFieldChange={onFieldChange}
                        />

                        {/* Selector de categorías */}
                        <CategorySelector
                            selectedCategory={selectedCategory}
                            onCategoryClick={onCategoryClick}
                            criteriosSeleccionados={criteriosSeleccionados}
                            availableCategories={availableCategories}
                        />

                        {/* Campos de especialidad según el método de búsqueda */}
                        <SpecialtyFields
                            formData={formData}
                            options={options}
                            loading={loading}
                            onFieldChange={onFieldChange}
                            searchMethod={formData.searchMethod}
                        />

                        {/* Botón de búsqueda */}
                        <SearchButton
                            formData={formData}
                            loading={loading}
                            searchMethod={formData.searchMethod}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SearchForm;