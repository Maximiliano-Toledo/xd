import { FiSearch } from "react-icons/fi";

const SearchMethodTabs = ({ searchMethod, onSearchMethodChange }) => {
    const methods = [
        {
            key: "normal",
            label: "Búsqueda",
            icon: <FiSearch />
        },
        {
            key: "porNombre",
            label: "Búsqueda por nombre",
            icon: <FiSearch />
        }
    ];

    return (
        <div className="search-method-tabs">
            {methods.map((method) => (
                <button
                    key={method.key}
                    className={`search-method-tab ${searchMethod === method.key ? "active" : ""}`}
                    onClick={() => onSearchMethodChange(method.key)}
                    type="button"
                >
                    {method.icon}
                    {method.label}
                </button>
            ))}
        </div>
    );
};

export default SearchMethodTabs;