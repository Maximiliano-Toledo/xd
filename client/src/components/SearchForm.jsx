import { useState, useEffect } from "react";
import { useCartillaApi } from "../hooks/useCartillaApi";
import CustomSelect from "./CustomSelect";
import { FiSearch, FiMapPin, FiPhone, FiMail, FiInfo } from "react-icons/fi";
import { FaStethoscope } from "react-icons/fa";

// Iconos para categorías
import { RiMentalHealthLine } from "react-icons/ri"; // Diagnóstico y tratamiento
import { RiMedicineBottleLine } from "react-icons/ri"; // Farmacias
import { MdOutlineBed } from "react-icons/md"; // Internación
import { FaTooth } from "react-icons/fa"; // Odontología
import { IoGlassesOutline } from "react-icons/io5"; // Ópticas

export const SearchForm = ({ onSubmitSearch }) => {
    const {
        formData,
        options,
        loading,
        handleChange,
        handleSubmit: apiHandleSubmit
    } = useCartillaApi();

    // Estado para controlar la categoría seleccionada
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Mapeo de categorías a iconos y textos
    const categories = [
        {
            id: "1",
            name: "Diagnóstico y tratamiento",
            icon: <RiMentalHealthLine size={30} />,
            value: "1"  // Asume que este es el ID de la categoría en tu backend
        },
        {
            id: "2",
            name: "Farmacias",
            icon: <RiMedicineBottleLine size={30} />,
            value: "2"
        },
        {
            id: "3",
            name: "Internación",
            icon: <MdOutlineBed size={30} />,
            value: "3"
        },
        {
            id: "4",
            name: "Odontología",
            icon: <FaTooth size={30} />,
            value: "4"
        },
        {
            id: "5",
            name: "Ópticas",
            icon: <IoGlassesOutline size={30} />,
            value: "5"
        }
    ];

    // Manejar clic en categoría
    const handleCategoryClick = (category) => {
        setSelectedCategory(category.id === selectedCategory ? null : category.id);

        // Actualizar formData con la categoría seleccionada
        const event = {
            target: {
                name: "categoria",
                value: category.value
            }
        };
        handleChange(event);
    };

    // Manejar envío del formulario
    const handleSubmit = (e) => {
        apiHandleSubmit(e);
        if (onSubmitSearch) onSubmitSearch();
    };

    return (
        <div className="search-form-container">
            <div className="search-form-card">
                <div className="search-form-header">
                    <h2>Encontrá profesionales de la salud</h2>
                    <p>Seleccioná los criterios para buscar prestadores en tu zona</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="search-form-selects">
                        <div className="search-select-group">
                            <CustomSelect
                                options={options.planes.map(p => ({ id: p.id_plan, nombre: p.nombre }))}
                                value={formData.plan}
                                onChange={handleChange}
                                name="plan"
                                placeholder="Seleccioná tu plan"
                                disabled={loading.planes}
                                loading={loading.planes}
                                className="search-select"
                            />
                        </div>

                        <div className="search-select-row">
                            <div className="search-select-group">
                                <CustomSelect
                                    options={options.provincias.map(p => ({ id: p.id_provincia, nombre: p.nombre }))}
                                    value={formData.provincia}
                                    onChange={handleChange}
                                    name="provincia"
                                    placeholder="Seleccioná la provincia"
                                    disabled={!formData.plan || loading.provincias}
                                    loading={loading.provincias}
                                    className="search-select"
                                />
                            </div>

                            <div className="search-select-group">
                                <CustomSelect
                                    options={options.localidades.map(l => ({ id: l.id_localidad, nombre: l.nombre }))}
                                    value={formData.localidad}
                                    onChange={handleChange}
                                    name="localidad"
                                    placeholder="Seleccioná la localidad"
                                    disabled={!formData.provincia || loading.localidades}
                                    loading={loading.localidades}
                                    className="search-select"
                                />
                            </div>
                        </div>

                        <div className="search-categories">
                            <div className="search-categories-label">Seleccioná una categoría</div>
                            <div className="search-categories-grid">
                                {categories.map(category => (
                                    <div
                                        key={category.id}
                                        className={`search-category-item ${selectedCategory === category.id ? 'active' : ''}`}
                                        onClick={() => handleCategoryClick(category)}
                                    >
                                        <div className="search-category-icon">{category.icon}</div>
                                        <div className="search-category-name">{category.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="search-select-group speciality-select">
                            <CustomSelect
                                options={options.especialidades.map(e => ({ id: e.id_especialidad, nombre: e.nombre }))}
                                value={formData.especialidad}
                                onChange={handleChange}
                                name="especialidad"
                                placeholder="Seleccioná la especialidad"
                                disabled={!formData.categoria || loading.especialidades}
                                loading={loading.especialidades}
                                className="search-select"
                            />
                        </div>

                        <div className="search-button-container">
                            <button
                                type="submit"
                                className="search-button"
                                disabled={!formData.plan || !formData.provincia || !formData.localidad || !formData.categoria || !formData.especialidad || Object.values(loading).some(Boolean)}
                            >
                                {Object.values(loading).some(Boolean) ? (
                                    <>Cargando...</>
                                ) : (
                                    <>
                                        <FiSearch className="search-button-icon" /> Buscar prestadores
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};