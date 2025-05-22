import React from 'react';
import { isPhoneJsonFormat, formatPhonesForDisplay } from '../utils/phoneFormatter';

/**
 * Componente para mostrar teléfonos formateados
 * @param {Object} props - Propiedades del componente
 * @param {string} props.value - Valor de teléfonos (formato JSON o antiguo)
 * @param {boolean} props.showType - Si mostrar el tipo de teléfono
 * @param {boolean} props.showDescription - Si mostrar la descripción
 */
const PhoneDisplay = ({ value, showType = true, showDescription = true }) => {
  if (!value) return <span className="text-muted">No disponible</span>;

  try {
    let phones;
    const isJson = isPhoneJsonFormat(value);

    if (isJson) {
      phones = JSON.parse(value);

      if (!Array.isArray(phones) || phones.length === 0) {
        return <span className="text-muted">No disponible</span>;
      }

      return (
        <div className="phone-display">
          {phones.map((phone, index) => (
            <div key={index} className="phone-item mb-1">
              <div className="d-flex align-items-center">
                {showDescription && phone.descripcion && (
                  <span className="phone-description me-2">{phone.descripcion}:</span>
                )}

                {showType && (
                  <span className="phone-type badge bg-light text-dark me-2">
                    {phone.tipo === 'fijo' ? 'Fijo' :
                      phone.tipo === 'celular' ? 'Celular' :
                        phone.tipo === 'gratuito' ? '0800' :
                          phone.tipo}
                  </span>
                )}

                <span className="phone-number">
                  {phone.codigoArea && <span className="phone-area">{phone.codigoArea} </span>}
                  {phone.numero}
                  {phone.extension && <span className="phone-ext"> ext. {phone.extension}</span>}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      // Formato antiguo, mostrar tal cual
      return <span>{value}</span>;
    }
  } catch (e) {
    // Si hay error, mostrar el valor original
    return <span>{value}</span>;
  }
};

export default PhoneDisplay;