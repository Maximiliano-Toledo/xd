import React from "react";
import { LuLaptop } from 'react-icons/lu';
import "../../../../styles/atencion-virtual-checkbox.css";

const AtencionVirtualEditCheckbox = ({
                                       selectedPrestador,
                                       editForm,
                                       onChange,
                                       // esProfesional
                                     }) => {
  // Solo mostrar el checkbox si es profesional
  // if (!esProfesional || !esProfesional()) {
  //   return null;
  // }

  const isAtencionVirtualEnabled = () => {
    return editForm.atencion_virtual === "Si";
  };

  const handleChange = (e) => {
    const isChecked = e.target.checked;

    if (onChange) {
      onChange({
        target: {
          name: 'atencion_virtual',
          value: isChecked ? "Si" : "No",
          type: 'checkbox',
          checked: isChecked
        }
      });
    }
  };

  return (
    <section className="mb-4">
      <div className="atencion-virtual-container">
        <label className="atencion-virtual-label">
          <input
            type="checkbox"
            className="atencion-virtual-checkbox"
            id="atencionVirtualEdit"
            name="atencion_virtual"
            checked={isAtencionVirtualEnabled()}
            onChange={handleChange}
          />
          <span className="atencion-virtual-checkmark"></span>
          <span className="atencion-virtual-text">
            <LuLaptop className="atencion-virtual-icon" /> Atención Virtual
          </span>
        </label>
        <span className="atencion-virtual-info">
          Al marcar esta opción, el prestador será registrado como de atención virtual.
          La dirección física será opcional.
        </span>
      </div>
    </section>
  );
};

export default AtencionVirtualEditCheckbox;