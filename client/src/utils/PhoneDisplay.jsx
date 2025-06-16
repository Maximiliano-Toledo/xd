import React from 'react';
import { FiPhone } from 'react-icons/fi';
import { FaWhatsapp, FaMobileAlt } from 'react-icons/fa';
import { MdLocalPhone, MdCall } from 'react-icons/md';
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

      // Si es un string normal (no normalizado), devolverlo como un solo teléfono NO clickeable
      if (typeof phoneData === 'string') {
        return [{ numero: phoneData, tipo: 'legacy', isNormalized: false }];
      }

      return [];
    } catch (error) {
      console.error('Error parsing phones:', error);
      // Si hay error al parsear, tratarlo como formato legacy
      return [{ numero: phoneData, tipo: 'legacy', isNormalized: false }];
    }
  };

  // Función para verificar si el teléfono está normalizado
  const isNormalized = (phone) => {
    // Si tiene la propiedad isNormalized explícitamente en false, no está normalizado
    if (phone.isNormalized === false) return false;

    // Si tiene tipo 'legacy', no está normalizado
    if (phone.tipo === 'legacy') return false;

    // Si tiene estructura completa (tipo, codigoArea, numero), está normalizado
    return phone.tipo && phone.codigoArea && phone.numero;
  };

  // Función auxiliar para agregar el 0 inicial si es necesario
  const formatAreaCodeForDisplay = (code) => {
    if (!code) return '';

    // Si el código no empieza con 0 y no es una línea gratuita, agregarlo
    if (!code.startsWith('0') && !code.startsWith('800') && !code.startsWith('810') && !code.startsWith('300')) {
      return '0' + code;
    }
    return code;
  };

  // Función para formatear un número de teléfono para WhatsApp API
  const formatPhoneForWhatsApp = (phone) => {
    const { codigoArea, numero } = phone;

    // Limpiar todos los caracteres no numéricos
    const cleanAreaCode = codigoArea?.replace(/\D/g, '') || '';
    const cleanNumber = numero?.replace(/\D/g, '') || '';

    // Para Argentina, agregar código de país si no está presente
    let fullNumber = '';

    // Si no empieza con 54 (código de Argentina), agregarlo
    if (cleanAreaCode && cleanNumber) {
      // Remover el 0 inicial del código de área si existe
      const areaWithoutZero = cleanAreaCode.startsWith('0') ? cleanAreaCode.substring(1) : cleanAreaCode;

      // Para celulares, agregar 9 después del código de país (formato internacional)
      if (phone.tipo === 'celular') {
        fullNumber = `549${areaWithoutZero}${cleanNumber}`;
      } else {
        fullNumber = `54${areaWithoutZero}${cleanNumber}`;
      }
    } else if (cleanNumber) {
      // Solo número sin código de área
      if (cleanNumber.length >= 10) {
        // Probablemente ya incluye código de área
        fullNumber = `54${cleanNumber}`;
      } else {
        // Número local, asumir Buenos Aires
        fullNumber = `54911${cleanNumber}`;
      }
    }

    return fullNumber;
  };

  // Función para formatear un número de teléfono para mostrar
  const formatPhoneNumber = (phone) => {
    // Si no está normalizado, mostrar el número tal como viene
    if (!isNormalized(phone)) {
      return phone.numero || 'Número no disponible';
    }

    const { tipo, codigoArea, numero, extension } = phone;
    let formatted = '';

    // Formateo según tipo
    switch (tipo) {
      case 'gratuito':
        // Formato 0800-XXX-XXXX (ya tienen el 0)
        if (numero.length === 7) {
          formatted = `${codigoArea}-${numero.substring(0, 3)}-${numero.substring(3)}`;
        } else if (numero.length === 6) {
          formatted = `${codigoArea}-${numero.substring(0, 3)}-${numero.substring(3)}`;
        } else {
          formatted = `${codigoArea} ${numero}`;
        }
        break;

      case 'celular':
        // Para celulares, formato sin paréntesis: 11 XXXX-XXXX
        if (numero.length === 8) {
          formatted = `${codigoArea} ${numero.substring(0, 4)}-${numero.substring(4)}`;
        } else if (numero.length === 10 && numero.startsWith('15')) {
          // Formato con 15: 11 15-XXXX-XXXX
          formatted = `${codigoArea} ${numero.substring(0, 2)}-${numero.substring(2, 6)}-${numero.substring(6)}`;
        } else if (numero.length === 7) {
          formatted = `${codigoArea} ${numero.substring(0, 3)}-${numero.substring(3)}`;
        } else {
          formatted = `${codigoArea} ${numero}`;
        }
        break;

      case 'fijo':
      default:
        // Para números fijos, mostrar con 0 inicial y paréntesis
        if (!codigoArea || codigoArea === '') {
          // Sin código de área, solo el número
          if (numero.length === 8) {
            formatted = `${numero.substring(0, 4)}-${numero.substring(4)}`;
          } else if (numero.length === 7) {
            formatted = `${numero.substring(0, 3)}-${numero.substring(3)}`;
          } else {
            formatted = numero;
          }
        } else {
          const fixedAreaCode = formatAreaCodeForDisplay(codigoArea);
          // Formato (0XXX) XXXX-XXXX o (0XX) XXXX-XXXX
          if (numero.length === 8) {
            formatted = `(${fixedAreaCode}) ${numero.substring(0, 4)}-${numero.substring(4)}`;
          } else if (numero.length === 7) {
            formatted = `(${fixedAreaCode}) ${numero.substring(0, 3)}-${numero.substring(3)}`;
          } else if (numero.length === 6) {
            formatted = `(${fixedAreaCode}) ${numero.substring(0, 2)}-${numero.substring(2)}`;
          } else {
            formatted = `(${fixedAreaCode}) ${numero}`;
          }
        }
        break;
    }

    // Agregar extensión si existe
    if (extension) {
      formatted += ` int. ${extension}`;
    }

    return formatted;
  };

  // Función para verificar si es WhatsApp
  const isWhatsApp = (phone) => {
    // Solo si está normalizado puede ser clickeable
    if (!isNormalized(phone)) return false;

    return phone.descripcion?.toLowerCase().includes('whatsapp') ||
      phone.descripcion === 'WhatsApp' ||
      phone.tipo === 'whatsapp';
  };

  // Función para obtener el icono según el tipo
  const getPhoneIcon = (phone) => {
    if (isWhatsApp(phone)) {
      return <FaWhatsapp className="phone-icon whatsapp" />;
    }

    switch (phone.tipo) {
      case 'celular':
        return <FaMobileAlt className="phone-icon mobile" />;
      case 'fijo':
        return <MdLocalPhone className="phone-icon landline" />;
      case 'gratuito':
        return <FiPhone className="phone-icon toll-free" />;
      case 'legacy':
        return <FiPhone className="phone-icon legacy" />;
      default:
        return <FiPhone className="phone-icon default" />;
    }
  };

  // Función para obtener la etiqueta del tipo
  const getPhoneLabel = (phone) => {
    // Si es WhatsApp, mostrarlo claramente
    if (isWhatsApp(phone)) {
      return 'WHATSAPP';
    }

    // Si no está normalizado, mostrar como "TELÉFONO (NO NORMALIZADO)"
    if (!isNormalized(phone)) {
      return 'TELÉFONO';
    }

    // Si tiene descripción personalizada, usarla
    if (phone.descripcion &&
      phone.descripcion !== 'Principal' &&
      !phone.descripcion.startsWith('Teléfono')) {
      return phone.descripcion.toUpperCase();
    }

    // Si no, usar el tipo
    switch (phone.tipo) {
      case 'celular':
        return 'CELULAR';
      case 'fijo':
        return 'TELÉFONO';
      case 'gratuito':
        return 'LÍNEA GRATUITA';
      default:
        return 'TELÉFONO';
    }
  };

  // Función para crear el enlace de WhatsApp
  const createWhatsAppLink = (phone) => {
    const formattedNumber = formatPhoneForWhatsApp(phone);
    return `https://api.whatsapp.com/send?text=&phone=${formattedNumber}`;
  };

  // Función para crear el enlace de llamada (tel:)
  const createTelLink = (phone) => {
    const { codigoArea, numero, tipo } = phone;

    // Limpiar todos los caracteres no numéricos
    const cleanAreaCode = codigoArea?.replace(/\D/g, '') || '';
    const cleanNumber = numero?.replace(/\D/g, '') || '';

    // Formatear para tel: (mantener formato local argentino)
    let telNumber = '';

    if (tipo === 'gratuito') {
      // Para líneas gratuitas: usar el código completo (ej: 0800123456)
      telNumber = `${cleanAreaCode}${cleanNumber}`;
    } else if (cleanAreaCode && cleanNumber) {
      // Para Argentina, formato tel: puede ser +54 o sin código de país
      if (tipo === 'celular') {
        // Para celulares: +54 9 11 1234-5678
        const areaWithoutZero = cleanAreaCode.startsWith('0') ? cleanAreaCode.substring(1) : cleanAreaCode;
        telNumber = `+549${areaWithoutZero}${cleanNumber}`;
      } else {
        // Para fijos: +54 11 1234-5678
        const areaWithoutZero = cleanAreaCode.startsWith('0') ? cleanAreaCode.substring(1) : cleanAreaCode;
        telNumber = `+54${areaWithoutZero}${cleanNumber}`;
      }
    } else if (cleanNumber) {
      // Solo número sin código de área
      telNumber = cleanNumber;
    }

    return `tel:${telNumber}`;
  };

  // Función para verificar si es un teléfono llamable (no WhatsApp, Y está normalizado)
  const isCallable = (phone) => {
    return !isWhatsApp(phone) && isNormalized(phone) && (phone.tipo === 'celular' || phone.tipo === 'fijo' || phone.tipo === 'gratuito');
  };

  // Función para renderizar el contenido del teléfono
  const renderPhoneContent = (phone, index) => {
    const content = (
      <>
        <div className="phone-icon-wrapper">
          {getPhoneIcon(phone)}
        </div>
        <div className="phone-details">
          <span className="phone-label">{getPhoneLabel(phone)}</span>
          <span className="phone-number">{formatPhoneNumber(phone)}</span>
        </div>
        {/* Ícono adicional para indicar acción */}
        {(isWhatsApp(phone) || isCallable(phone)) && (
          <div className="phone-action-icon">
            {isWhatsApp(phone) ? (
              <span className="action-indicator whatsapp-indicator">↗</span>
            ) : (
              <MdCall className="action-indicator call-indicator" />
            )}
          </div>
        )}
      </>
    );

    // Si es WhatsApp, envolver en un enlace de WhatsApp
    if (isWhatsApp(phone)) {
      return (
        <a
          key={index}
          href={createWhatsAppLink(phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="phone-item whatsapp-link"
          title="Abrir chat de WhatsApp"
        >
          {content}
        </a>
      );
    }

    // Si es llamable (teléfono, celular o gratuito), envolver en un enlace tel:
    if (isCallable(phone)) {
      const linkTitle = phone.tipo === 'gratuito'
        ? `Llamar gratis a ${formatPhoneNumber(phone)}`
        : `Llamar a ${formatPhoneNumber(phone)}`;

      return (
        <a
          key={index}
          href={createTelLink(phone)}
          className="phone-item tel-link"
          title={linkTitle}
        >
          {content}
        </a>
      );
    }

    // Para números gratuitos u otros, renderizar como div normal
    return (
      <div key={index} className="phone-item">
        <div className="phone-icon-wrapper">
          {getPhoneIcon(phone)}
        </div>
        <div className="phone-details">
          <span className="phone-label">{getPhoneLabel(phone)}</span>
          <span className="phone-number">{formatPhoneNumber(phone)}</span>
        </div>
      </div>
    );
  };

  const phoneList = parsePhones(phones);

  if (phoneList.length === 0) {
    return <span className={`no-phones ${className}`}>No hay teléfonos registrados</span>;
  }

  // Siempre mostrar como lista para mantener consistencia visual
  return (
    <div className={`phone-display-list ${className}`}>
      {phoneList.map((phone, index) => renderPhoneContent(phone, index))}
    </div>
  );
};

export default PhoneDisplay;