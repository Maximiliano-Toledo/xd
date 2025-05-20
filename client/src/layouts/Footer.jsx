import React from 'react';
const year = new Date().getFullYear();

export const Footer = () => {
    return (
        <footer className="text-center mt-3">
            &copy; Fourdynam {year}. Todos los derechos reservados.
        </footer>
    )
}
