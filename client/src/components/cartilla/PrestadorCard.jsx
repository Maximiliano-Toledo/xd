import { FiMapPin, FiPhone, FiMail, FiInfo } from "react-icons/fi";
import { FaStethoscope } from "react-icons/fa";
import { LuLaptop } from "react-icons/lu";
import PhoneDisplay from "../../utils/PhoneDisplay.jsx";

const PrestadorCard = ({ prestador }) => {
  // Verificar si es un profesional con atención virtual
  const tieneAtencionVirtual = prestador.atencion_virtual === "Si";

  return (
    <div className="prestador-card">
      <div className="prestador-type">
        <FaStethoscope />
      </div>

      <div className="prestador-content">
        <div className="prestador-header">
          <h3 className="prestador-name">{prestador.nombre}</h3>

          {/* Indicador de atención virtual */}
          {tieneAtencionVirtual && (
            <div className="atencion-virtual-badge">
              <LuLaptop className="virtual-icon" />
              <span className="virtual-text">Atención Virtual</span>
            </div>
          )}
        </div>

        <div className="prestador-details">
          {prestador.direccion && (
            <div className="prestador-detail">
              <FiMapPin className="detail-icon" />
              <span>{prestador.direccion}</span>
            </div>
          )}

          {prestador.telefonos && (
            <div className="prestador-detail phone-detail">
              <PhoneDisplay phones={prestador.telefonos} />
            </div>
          )}

          {prestador.email && (
            <div className="prestador-detail">
              <FiMail className="detail-icon" />
              <a href={`mailto:${prestador.email}`}>{prestador.email}</a>
            </div>
          )}
        </div>

        {prestador.informacion_adicional && (
          <div className="prestador-info">
            <FiInfo className="info-icon" />
            <p>{prestador.informacion_adicional}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrestadorCard;