import React from 'react';
import "../styles/cargar-cartilla.css"

const HeaderStaff = ({ title }) => { /**Esto es la imagen de la derecha en las vistas */
  return (
    <header className="d-flex justify-content-between align-items-start">
    <h1 className="text-decoration-underline title-dashboard text-start">{title}</h1>
    <a href="https://ossacra.org.ar/">
      <img
        className="m-0"
        src="/ossacra-amasalud.png"
        style={{ height: 60, width: 'auto' }}
        alt="OSSACRA Logo"
      />
    </a>
  </header>
  );
}

export default HeaderStaff;
