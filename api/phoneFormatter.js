/**
 * Módulo para el formateo y normalización de teléfonos (versión backend)
 * @module utils/phoneFormatter
 */

/**
 * Convierte un JSON de teléfonos al formato estructurado para CSV
 * @param {string} phoneJson - JSON de teléfonos o string con formato antiguo
 * @returns {string} - Formato estructurado para CSV
 */
function phoneJsonToCSVFormat(phoneJson) {
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
function csvFormatToPhoneJson(csvValue) {
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
function normalizeOldPhoneFormat(oldFormat) {
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
 * Comprueba si un valor de teléfono está en formato JSON
 * @param {string} value - Valor a comprobar
 * @returns {boolean} - true si es formato JSON, false si es formato antiguo
 */
function isPhoneJsonFormat(value) {
  if (!value) return false;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed);
  } catch (e) {
    return false;
  }
}

/**
 * Formatea teléfonos para visualización en PDF
 * @param {string} phoneValue - Valor de teléfono (puede ser JSON o formato antiguo)
 * @returns {string} - Teléfono formateado para PDF
 */
function formatPhoneForPDF(phoneValue) {
  if (!phoneValue) return '';

  try {
    // Si parece ser JSON, procesar como tal
    if (phoneValue.startsWith('[') ||
      (phoneValue.startsWith('"') && phoneValue.indexOf('[') === 1)) {
      // Si está envuelto en comillas adicionales, extraer el JSON interno
      let jsonStr = phoneValue;
      if (phoneValue.startsWith('"')) {
        jsonStr = JSON.parse(phoneValue);
      }

      // Parsear el JSON
      const phones = JSON.parse(jsonStr);

      if (!Array.isArray(phones) || phones.length === 0) return '';

      // Formatear cada teléfono
      return phones.map(phone => {
        const tipo = phone.tipo === 'celular' ? 'Cel:' :
          phone.tipo === 'gratuito' ? '' : 'Tel:';

        // Formatear según tipo
        let numero = '';
        if (phone.tipo === 'gratuito' && phone.codigoArea.startsWith('0')) {
          numero = `${phone.codigoArea}-${phone.numero.slice(0,3)}-${phone.numero.slice(3)}`;
        } else {
          const n = phone.numero;
          if (n && n.length > 4) {
            numero = `${phone.codigoArea} ${n.slice(0, n.length-4)}-${n.slice(-4)}`;
          } else {
            numero = `${phone.codigoArea} ${n || ''}`;
          }
        }

        // Añadir extensión si existe
        if (phone.extension) {
          numero += ` int:${phone.extension}`;
        }

        // Añadir descripción si existe
        const desc = phone.descripcion ? ` (${phone.descripcion})` : '';

        return `${tipo} ${numero}${desc}`;
      }).join(' | ');
    } else {
      // Si no es JSON, formatear texto plano básico
      // Dividir por separadores comunes
      const parts = phoneValue.split(/[,;\/]+/).map(p => p.trim()).filter(p => p);
      return parts.join(' | ');
    }
  } catch (e) {
    console.warn(`Error al formatear teléfono para PDF: ${e.message}`);
    // Si hay error, devolver el valor original
    return phoneValue;
  }
}

module.exports = {
  phoneJsonToCSVFormat,
  csvFormatToPhoneJson,
  normalizeOldPhoneFormat,
  isPhoneJsonFormat,
  formatPhoneForPDF
};