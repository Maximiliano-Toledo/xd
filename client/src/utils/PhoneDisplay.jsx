import React from 'react';
import { FiPhone } from 'react-icons/fi';
import { FaWhatsapp, FaMobileAlt } from 'react-icons/fa';
import { MdLocalPhone } from 'react-icons/md';
import "../styles/phone-display.css"

const PhoneDisplay = ({ phones, className = '' }) => {
  // Función para parsear los teléfonos
  const parsePhones = (phoneData) => {
    if (!phoneData) return [];

    try {
      // Si ya es un array, usarlo directamente
      if (Array.isArray(phoneData)) return phoneData;

      // Si es un string que parece JSON, parsearlo
      if (typeof phoneData === 'string' && phoneData.startsWith('[')) {
        return JSON.parse(phoneData);
      }

      // Si es un string normal, devolverlo como un solo teléfono
      if (typeof phoneData === 'string') {
        return [{ numero: phoneData, tipo: 'fijo' }];
      }

      return [];
    } catch (error) {
      console.error('Error parsing phones:', error);
      return [];
    }
  };

  // Función para formatear un número de teléfono
  const formatPhoneNumber = (phone) => {
    const { tipo, codigoArea, numero, extension } = phone;
    let formatted = '';

    switch (tipo) {
      case 'gratuito':
        if (numero.length >= 6) {
          formatted = `${codigoArea}-${numero.substring(0, 3)}-${numero.substring(3)}`;
        } else {
          formatted = `${codigoArea} ${numero}`;
        }
        break;

      case 'celular':
        if (numero.length === 8) {
          formatted = `${codigoArea} ${numero.substring(0, 4)}-${numero.substring(4)}`;
        } else if (numero.length === 10 && numero.startsWith('15')) {
          formatted = `${codigoArea} ${numero.substring(0, 2)}-${numero.substring(2, 6)}-${numero.substring(6)}`;
        } else {
          formatted = `${codigoArea} ${numero}`;
        }
        break;

      case 'fijo':
      default:
        if (!codigoArea || codigoArea === '') {
          formatted = numero;
        } else {
          if (numero.length === 8) {
            formatted = `(${codigoArea}) ${numero.substring(0, 4)}-${numero.substring(4)}`;
          } else if (numero.length === 7) {
            formatted = `(${codigoArea}) ${numero.substring(0, 3)}-${numero.substring(3)}`;
          } else if (numero.length === 6) {
            formatted = `(${codigoArea}) ${numero.substring(0, 2)}-${numero.substring(2)}`;
          } else {
            formatted = `(${codigoArea}) ${numero}`;
          }
        }
        break;
    }

    if (extension) {
      formatted += ` int. ${extension}`;
    }

    return formatted;
  };

  // Función para obtener el icono según el tipo
  const getPhoneIcon = (phone) => {
    if (phone.descripcion?.toLowerCase().includes('whatsapp') || phone.descripcion === 'WhatsApp') {
      return <FaWhatsapp className="phone-icon whatsapp" />;
    }

    switch (phone.tipo) {
      case 'celular':
        return <FaMobileAlt className="phone-icon mobile" />;
      case 'fijo':
        return <MdLocalPhone className="phone-icon landline" />;
      case 'gratuito':
        return <FiPhone className="phone-icon toll-free" />;
      default:
        return <FiPhone className="phone-icon default" />;
    }
  };

  // Función para obtener la etiqueta del tipo
  const getPhoneLabel = (phone) => {
    // Si tiene descripción personalizada, usarla
    if (phone.descripcion &&
      phone.descripcion !== 'Principal' &&
      !phone.descripcion.startsWith('Teléfono')) {
      return phone.descripcion;
    }

    // Si no, usar el tipo
    switch (phone.tipo) {
      case 'celular':
        return 'Celular';
      case 'fijo':
        return 'Teléfono';
      case 'gratuito':
        return 'Línea gratuita';
      default:
        return 'Teléfono';
    }
  };

  const phoneList = parsePhones(phones);

  if (phoneList.length === 0) {
    return <span className={`no-phones ${className}`}>No hay teléfonos registrados</span>;
  }

  // Si hay solo un teléfono, mostrarlo en línea
  if (phoneList.length === 1) {
    const phone = phoneList[0];
    return (
      <div className={`phone-display-inline ${className}`}>
        {getPhoneIcon(phone)}
        <span className="phone-number">{formatPhoneNumber(phone)}</span>
      </div>
    );
  }

  // Si hay múltiples teléfonos, mostrarlos como lista
  return (
    <div className={`phone-display-list ${className}`}>
      {phoneList.map((phone, index) => (
        <div key={index} className="phone-item">
          <div className="phone-icon-wrapper">
            {getPhoneIcon(phone)}
          </div>
          <div className="phone-details">
            <span className="phone-label">{getPhoneLabel(phone)}</span>
            <span className="phone-number">{formatPhoneNumber(phone)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhoneDisplay;