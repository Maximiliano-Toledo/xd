import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, disabled }) => {
    return (
        <div className="d-flex justify-content-center mt-4">
            <nav aria-label="Navegación de páginas">
                <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1 || disabled}
                        >
                            Anterior
                        </button>
                    </li>

                    {[...Array(totalPages).keys()].map((i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => onPageChange(i + 1)}
                                disabled={disabled}
                            >
                                {i + 1}
                            </button>
                        </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || disabled}
                        >
                            Siguiente
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Pagination;