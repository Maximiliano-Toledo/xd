/**
 * Utilidades para formateo y normalización de teléfonos
 * Este módulo contiene funciones para convertir entre diferentes formatos de teléfono
 */

/**
 * Convierte un JSON de teléfonos al formato estructurado para CSV
 * @param {string} phoneJson - JSON de teléfonos o string con formato antiguo
 * @returns {string} - Formato estructurado para CSV
 */
export function phoneJsonToCSVFormat(phoneJson) {
  if (!phoneJson) return '';

  try {
    const phones = typeof phoneJson === 'string' ? JSON.parse(phoneJson) : phoneJson;
    if (!Array.isArray(phones)) return phoneJson; // Si no es array, devolver como está

    return phones.map(phone => {
      return `type:${phone.tipo || 'fijo'}|area:${phone.codigoArea || ''}|num:${phone.numero || ''}|ext:${phone.extension || ''}|desc:${phone.descripcion || ''}`;
    }).join(';');
  } catch (e) {
    // Si hay error en el parsing, devolver el valor original
    return phoneJson;
  }
}

/**
 * Convierte un formato CSV estructurado a JSON de teléfonos
 * @param {string} csvValue - Valor del CSV (puede ser formato estructurado o antiguo)
 * @returns {string} - JSON de teléfonos
 */
export function csvFormatToPhoneJson(csvValue) {
  if (!csvValue) return JSON.stringify([]);

  // Primero verificar si ya es JSON
  try {
    const parsed = JSON.parse(csvValue);
    if (Array.isArray(parsed)) {
      // Ya está en formato JSON, devolverlo tal cual
      return csvValue;
    }
  } catch (e) {
    // No es JSON, continuar con el procesamiento
  }

  // Verificar si tiene el formato estructurado
  if (csvValue.includes('type:') && csvValue.includes('|area:')) {
    const phones = csvValue.split(';').map(phoneStr => {
      const parts = phoneStr.split('|');
      const phone = {};

      parts.forEach(part => {
        const [key, value] = part.split(':');
        switch (key) {
          case 'type': phone.tipo = value; break;
          case 'area': phone.codigoArea = value; break;
          case 'num': phone.numero = value; break;
          case 'ext': phone.extension = value || null; break;
          case 'desc': phone.descripcion = value || null; break;
        }
      });

      return phone;
    });

    return JSON.stringify(phones);
  }

  // Si no tiene el formato estructurado, asumir que es formato antiguo y normalizarlo
  return normalizeOldPhoneFormat(csvValue);
}

/**
 * Normaliza un formato antiguo de teléfono al formato JSON
 * @param {string} oldFormat - Formato antiguo (puede tener múltiples teléfonos separados por comas)
 * @returns {string} - JSON de teléfonos
 */
export function normalizeOldPhoneFormat(oldFormat) {
  if (!oldFormat) return JSON.stringify([]);

  // Dividir por comas, punto y coma o barra si hay múltiples
  const phones = oldFormat.split(/[,;\/]+/).map(p => p.trim()).filter(p => p);

  // Si no hay teléfonos, devolver array vacío
  if (phones.length === 0) return JSON.stringify([]);

  // Convertir cada teléfono al formato nuevo
  const normalizedPhones = phones.map((phone, index) => {
    // Eliminar todos los caracteres no numéricos excepto el "+"
    const cleanNumber = phone.replace(/[^\d+]/g, '');

    // Si no hay número después de limpiar, saltear
    if (!cleanNumber) return null;

    // Detectar tipo y formato
    let tipo = "fijo";
    let codigoArea = "";
    let numero = cleanNumber;

    // Detectar 0800/0300
    if (cleanNumber.startsWith("0800") || cleanNumber.startsWith("0300")) {
      tipo = "gratuito";
      codigoArea = cleanNumber.substring(0, 4);
      numero = cleanNumber.substring(4);
    }
    // Detectar celular (asumiendo Argentina)
    else if (cleanNumber.length >= 10 && (cleanNumber.startsWith("11") || cleanNumber.startsWith("15"))) {
      tipo = "celular";

      // Extraer código de área (2-3 dígitos para celular)
      if (cleanNumber.startsWith("15")) {
        // Formato antiguo con 15 al principio
        codigoArea = "11"; // Asumimos Buenos Aires si empieza con 15
        numero = cleanNumber.substring(2);
      } else {
        codigoArea = cleanNumber.substring(0, 2);
        numero = cleanNumber.substring(2);
      }
    }
    // Teléfono fijo
    else {
      if (cleanNumber.length >= 8) {
        // Los primeros 2-4 dígitos son código de área
        const areaLength = Math.min(4, cleanNumber.length - 6);
        codigoArea = cleanNumber.substring(0, Math.max(2, areaLength));
        numero = cleanNumber.substring(codigoArea.length);
      }
    }

    return {
      tipo,
      codigoArea,
      numero,
      extension: null,
      descripcion: index === 0 ? "Principal" : `Teléfono ${index + 1}`
    };
  }).filter(p => p !== null); // Eliminar entradas nulas

  return JSON.stringify(normalizedPhones);
}

/**
 * Formatea un teléfono para mostrar en la interfaz de usuario
 * @param {Object} phone - Objeto de teléfono
 * @returns {string} - Teléfono formateado
 */
export function formatPhoneForDisplay(phone) {
  if (!phone) return '';

  const { tipo, codigoArea, numero, extension } = phone;

  // Formateo según tipo
  switch (tipo) {
    case 'gratuito':
      // Formato 0800-XXX-XXXX
      if (numero.length === 7) {
        return `${codigoArea}-${numero.substring(0, 3)}-${numero.substring(3)}`;
      }
      return `${codigoArea} ${numero}`;

    case 'celular':
      // Formato XX XXXX-XXXX
      if (numero.length === 8) {
        return `${codigoArea} ${numero.substring(0, 4)}-${numero.substring(4)}`;
      }
      return `${codigoArea} ${numero}`;

    case 'fijo':
    default:
      // Formato (XXX) XXXX-XXXX
      if (numero.length >= 8) {
        return `(${codigoArea}) ${numero.substring(0, 4)}-${numero.substring(4)}`;
      }
      return `(${codigoArea}) ${numero}`;
  }
}

/**
 * Formatea un conjunto de teléfonos para mostrar en la interfaz
 * @param {string} phones - JSON de teléfonos o string con formato antiguo
 * @returns {string} - Teléfonos formateados separados por comas
 */
export function formatPhonesForDisplay(phones) {
  if (!phones) return '';

  try {
    // Intentar parsear como JSON
    const parsed = typeof phones === 'string' ? JSON.parse(phones) : phones;

    if (Array.isArray(parsed)) {
      // Es formato nuevo, formatear cada teléfono
      return parsed.map(phone => formatPhoneForDisplay(phone))
        .join(', ');
    }

    // No es un array, devolver como está
    return phones;
  } catch (e) {
    // Error en el parsing, debe ser formato antiguo
    return phones;
  }
}

/**
 * Comprueba si un valor de teléfono está en formato JSON
 * @param {string} value - Valor a comprobar
 * @returns {boolean} - true si es formato JSON, false si es formato antiguo
 */
export function isPhoneJsonFormat(value) {
  if (!value) return false;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed);
  } catch (e) {
    return false;
  }
}

/**
 * Valida un número de teléfono según su tipo
 * @param {Object} phone - Objeto con datos del teléfono
 * @returns {Object} - Resultado de la validación {isValid, errors}
 */
export function validatePhone(phone) {
  const errors = [];

  if (!phone.tipo) {
    errors.push("El tipo de teléfono es requerido");
  }

  if (!phone.numero) {
    errors.push("El número de teléfono es requerido");
  }

  // Validación específica según tipo
  switch (phone.tipo) {
    case 'gratuito':
      if (!phone.codigoArea || !['0800', '0300'].includes(phone.codigoArea)) {
        errors.push("El código de área debe ser 0800 o 0300 para teléfonos gratuitos");
      }
      if (!/^\d{6,8}$/.test(phone.numero)) {
        errors.push("El número debe tener entre 6 y 8 dígitos");
      }
      break;

    case 'celular':
      if (!phone.codigoArea || !/^\d{2,3}$/.test(phone.codigoArea)) {
        errors.push("El código de área debe tener 2 o 3 dígitos para celulares");
      }
      if (!/^\d{7,8}$/.test(phone.numero)) {
        errors.push("El número debe tener entre 7 y 8 dígitos para celulares");
      }
      break;

    case 'fijo':
    default:
      if (!phone.codigoArea || !/^\d{2,4}$/.test(phone.codigoArea)) {
        errors.push("El código de área debe tener entre 2 y 4 dígitos");
      }
      if (!/^\d{6,8}$/.test(phone.numero)) {
        errors.push("El número debe tener entre 6 y 8 dígitos");
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Tipos de teléfono disponibles
 */
export const PHONE_TYPES = [
  { value: 'fijo', label: 'Teléfono Fijo' },
  { value: 'celular', label: 'Celular' },
  { value: 'gratuito', label: 'Línea Gratuita (0800/0300)' },
  { value: 'fax', label: 'Fax' },
  { value: 'otro', label: 'Otro' }
];