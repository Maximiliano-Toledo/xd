import React from "react";
import { LuLaptop } from 'react-icons/lu';

const AtencionVirtualCheckbox = ({ formData, categorias, register, handleChange }) => {
  // Verificar si la categoría seleccionada es "Profesionales"
  const esProfesional = () => {
    return formData.categoria && categorias.some(cat =>
      cat.id_categoria.toString() === formData.categoria.toString() &&
      cat.nombre === "Profesionales"
    );
  };

  // Solo mostrar el checkbox si es profesional
  if (!esProfesional()) {
    return null;
  }

  return (
    <div className="atencion-virtual-container">
      <label className="atencion-virtual-label">
        <input
          type="checkbox"
          className="atencion-virtual-checkbox"
          id="atencionVirtual"
          name="atencionVirtual"
          checked={formData.atencionVirtual}
          {...register("atencionVirtual", {
            onChange: (e) => handleChange(e),
          })}
        />
        <span className="atencion-virtual-checkmark"></span>
        <span className="atencion-virtual-text">
          <LuLaptop className="atencion-virtual-icon" /> Atención Virtual
        </span>
      </label>
      <span className="atencion-virtual-info">
        Al marcar esta opción, el prestador será registrado como de atención virtual.
        Puede proporcionar una dirección física opcional si lo desea.
      </span>
    </div>
  );
};

export default AtencionVirtualCheckbox;