import React, { useState } from 'react';
import { CiCircleInfo } from 'react-icons/ci';

const LiveAlert = ({ message = "Este es un mensaje por defecto" }) => {
  const [visible, setVisible] = useState(false);

  const showAlert = () => {
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <div>
      <button className="btn p-0 border-0" onClick={showAlert} type="button">
        <CiCircleInfo className="fs-5 fw-bold" />
      </button>

      {visible && (
        <div className="alert alert-secondary alert-dismissible fade show mt-2" role="alert"
        >
          {message}
          <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
        </div>
      )}
    </div>
  );
};

export default LiveAlert;


