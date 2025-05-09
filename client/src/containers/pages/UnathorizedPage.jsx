import React from 'react';
// import { Link } from 'react-router';
// TODO: Armar una pagina de acceso no autorizado si es necesario
const UnauthorizedPage = () => {
  return (
    <div className="container mt-5 text-center">
      <div className="alert alert-danger">
        <h2>Acceso no autorizado</h2>
        <p>No tienes los permisos necesarios para acceder a esta sección.</p>
        {/* <Link to="/dashboard" className="btn btn-primary mt-3">
          Volver al panel principal
        </Link> */}
      </div>
    </div>
  );
};

export default UnauthorizedPage;