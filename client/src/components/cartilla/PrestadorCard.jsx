import { FiMapPin, FiPhone, FiMail, FiInfo } from "react-icons/fi";
import { FaStethoscope } from "react-icons/fa";

const PrestadorCard = ({ prestador }) => {
    return (
        <div className="prestador-card">
            <div className="prestador-type">
                <FaStethoscope />
            </div>
            <div className="prestador-content">
                <h3 className="prestador-name">{prestador.nombre}</h3>

                <div className="prestador-details">
                    {prestador.direccion && (
                        <div className="prestador-detail">
                            <FiMapPin className="detail-icon" />
                            <span>{prestador.direccion}</span>
                        </div>
                    )}

                    {prestador.telefonos && (
                        <div className="prestador-detail">
                            <FiPhone className="detail-icon" />
                            <span>{prestador.telefonos}</span>
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