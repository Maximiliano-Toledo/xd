import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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

    // Si no hay páginas, no mostrar la paginación
    if (totalPages <= 0) return null;

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                <div className="pagination-text">
                    Mostrando <span className="pagination-highlight">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)}</span> de <span className="pagination-highlight">{totalItems}</span> prestadores
                </div>
            </div>

            <div className="pagination-controls">
                <div className="items-per-page">
                    <label htmlFor="itemsPerPage">Mostrar:</label>
                    <select
                        id="itemsPerPage"
                        className="items-per-page-select"
                        value={itemsPerPage}
                        onChange={(e) => {
                            const newSize = Number(e.target.value);
                            console.log("Cambiando tamaño de página a:", newSize);
                            onItemsPerPageChange(newSize);
                        }}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>

                <div className="pagination-buttons">
                    <button
                        className={`pagination-button prev ${currentPage === 1 ? 'disabled' : ''}`}
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Página anterior"
                    >
                        <FiChevronLeft />
                    </button>

                    <div className="pagination-pages">
                        {getPageNumbers().map((page, index) => (
                            <button
                                key={index}
                                className={`pagination-page ${page === currentPage ? 'active' : ''} ${page === '...' ? 'ellipsis' : ''}`}
                                onClick={() => page !== '...' ? onPageChange(page) : null}
                                disabled={page === '...'}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        className={`pagination-button next ${currentPage === totalPages ? 'disabled' : ''}`}
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Página siguiente"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;