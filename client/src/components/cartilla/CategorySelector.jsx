import { BsBuilding } from "react-icons/bs";
import { FaUserMd } from "react-icons/fa";
import { RiMedicineBottleLine } from "react-icons/ri";
import { IoGlassesOutline } from "react-icons/io5";

const CategorySelector = ({
    selectedCategory,
    onCategoryClick,
    criteriosSeleccionados,
    availableCategories
}) => {
    const categories = [
        {
            id: "1",
            name: "Instituciones",
            icon: <BsBuilding size={30} />,
            value: "1",
        },
        {
            id: "2",
            name: "Profesionales",
            icon: <FaUserMd size={30} />,
            value: "2",
        },
        {
            id: "3",
            name: "Farmacias",
            icon: <RiMedicineBottleLine size={30} />,
            value: "3",
        },
        {
            id: "4",
            name: "Ópticas",
            icon: <IoGlassesOutline size={30} />,
            value: "4",
        },
    ];

    const isCategoryAvailable = (categoryValue) => {
        if (!criteriosSeleccionados) {
            return false;
        }
        return availableCategories.includes(categoryValue);
    };

    return (
        <div className="search-categories">
            <div className="search-categories-label">Seleccioná una categoría</div>
            <div className="search-categories-grid">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className={`search-category-item 
              ${selectedCategory === category.id ? "active" : ""} 
              ${!criteriosSeleccionados ? "disabled" : !isCategoryAvailable(category.value) ? "disabled unavailable" : ""}`}
                        onClick={() => onCategoryClick(category)}
                    >
                        <div className="search-category-icon">{category.icon}</div>
                        <div className="search-category-name">{category.name}</div>
                        {/* Solo mostrar el cartel de No disponible cuando los criterios están seleccionados y la categoría no está disponible */}
                        {criteriosSeleccionados && !isCategoryAvailable(category.value) && (
                            <div className="category-unavailable-overlay">No disponible</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategorySelector;