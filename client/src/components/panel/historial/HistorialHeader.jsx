import React from 'react';
import { MdOutlineKeyboardDoubleArrowRight } from 'react-icons/md';

const HistorialHeader = () => {
    return (
        <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
            <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5 ms-4 me-4">
                <h6 className="fs-2 h1-titulo fw-bold border p-2 d-flex align-items-center">
                    <div className="rounded-color d-flex justify-content-center align-items-center me-4">
                        <MdOutlineKeyboardDoubleArrowRight className="fs-1 text-white" />
                    </div>
                    Historial de actividad
                </h6>
                <h2 className="fs-2 h1-titulo p-2 fw-normal">
                    Visualizá las últimas acciones realizadas en el sistema.
                </h2>
            </div>
        </div>
    );
};

export default HistorialHeader;