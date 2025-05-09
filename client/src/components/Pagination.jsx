// components/Pagination.jsx
import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
    totalItems
}) => {
    // Generar array de páginas a mostrar (máximo 5)
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Si hay 5 o menos páginas, mostrar todas
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Mostrar páginas en torno a la actual
            let startPage = Math.max(currentPage - 2, 1);
            let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

            // Ajustar si estamos cerca del final
            if (endPage === totalPages) {
                startPage = Math.max(endPage - maxPagesToShow + 1, 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Agregar indicadores de elipsis si es necesario
            if (startPage > 1) {
                pages.unshift('...');
                pages.unshift(1);
            }

            if (endPage < totalPages) {
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="pagination-container mt-4">
            <div className="d-flex justify-content-between align-items-center">
                <div className="pagination-info">
                    Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
                </div>

                <div>
                    <select
                        className="form-select form-select-sm me-3 d-inline-block"
                        style={{ width: "80px" }}
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>

                    <nav aria-label="Navegación de prestadores">
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => onPageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    aria-label="Anterior"
                                >
                                    <FaChevronLeft size={12} />
                                </button>
                            </li>

                            {getPageNumbers().map((page, index) => (
                                <li
                                    key={index}
                                    className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => page !== '...' ? onPageChange(page) : null}
                                        disabled={page === '...'}
                                    >
                                        {page}
                                    </button>
                                </li>
                            ))}

                            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => onPageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    aria-label="Siguiente"
                                >
                                    <FaChevronRight size={12} />
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Pagination;