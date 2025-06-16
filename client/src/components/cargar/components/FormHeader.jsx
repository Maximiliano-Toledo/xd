import React from "react";
import { FaCheckCircle } from "react-icons/fa";

const FormHeader = ({ formStep }) => {
  const FormTitles = ["Datos institucionales", "Datos de ubicación y contacto"];

  return (
    <h6 className="text-center fw-bold p-1 fs-5">
      <FaCheckCircle className="check-style" /> {FormTitles[formStep]}
    </h6>
  );
};

export default FormHeader;