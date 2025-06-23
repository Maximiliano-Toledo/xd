import React from 'react';
import { FiPhone } from 'react-icons/fi';
import { FaWhatsapp, FaMobileAlt } from 'react-icons/fa';
import { MdLocalPhone } from 'react-icons/md';

const PhoneDisplayCompact = ({ phones }) => {
  // Función para parsear los teléfonos
  const parsePhones = (phoneData) => {
    if (!phoneData) return [];

    try {
      if (Array.isArray(phoneData)) return phoneData;

      if (typeof phoneData === 'string' && phoneData.startsWith('[')) {
        return JSON.parse(phoneData);
      }

      if (typeof phoneData === 'string') {
        return [{ numero: phoneData, tipo: 'fijo' }];
      }

      return [];
    } catch (error) {
      return [];
    }
  };

  // Función para formatear un número de teléfono
  const formatPhoneNumber = (phone) => {
    const { tipo, codigoArea, numero, extension } = phone;
    let formatted = '';

    switch (tipo) {
      case 'gratuito':
        formatted = numero.length >= 6
          ? `${codigoArea}-${numero.substring(0, 3)}-${numero.substring(3)}`
          : `${codigoArea} ${numero}`;
        break;

      case 'celular':
        if (numero.length === 8) {
          formatted = `${codigoArea} ${numero.substring(0, 4)}-${numero.substring(4)}`;
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
  const getIcon = (phone) => {
    if (phone.descripcion?.toLowerCase().includes('whatsapp')) {
      return <FaWhatsapp style={{ color: '#25D366', fontSize: '14px', marginRight: '4px' }} />;
    }

    switch (phone.tipo) {
      case 'celular':
        return <FaMobileAlt style={{ color: '#4285F4', fontSize: '14px', marginRight: '4px' }} />;
      case 'gratuito':
        return <FiPhone style={{ color: '#EA4335', fontSize: '14px', marginRight: '4px' }} />;
      default:
        return null;
    }
  };

  const phoneList = parsePhones(phones);

  if (phoneList.length === 0) {
    return <span style={{ color: '#666', fontStyle: 'italic' }}>Sin teléfonos</span>;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      fontSize: '13px',
      lineHeight: '1.4'
    }}>
      {phoneList.map((phone, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
          {getIcon(phone)}
          <span style={{ fontFamily: 'monospace' }}>
            {formatPhoneNumber(phone)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PhoneDisplayCompact;