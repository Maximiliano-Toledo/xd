/**
 * Utilidades para formateo y normalización de teléfonos
 * Este módulo contiene funciones para convertir entre diferentes formatos de teléfono
 */

// Importar los datos de prefijos (puedes copiar el array del data.js o crear un archivo separado)
import { phoneNumbersData } from './phoneNumbersData'; // Crear este archivo con los datos

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
  return normalizePhoneWithPrefixes(csvValue);
}

/**
 * Encuentra el código de área más largo que coincida con el inicio del número
 */
function findAreaCode(number) {
  let cleanNumber = number.replace(/\D/g, '');

  // Si el número empieza con 0 (excluyendo 0800, 0810, 0300),
  // intentar buscar sin el 0 inicial
  let searchWithoutZero = false;
  if (cleanNumber.startsWith('0') &&
    !cleanNumber.startsWith('0800') &&
    !cleanNumber.startsWith('0810') &&
    !cleanNumber.startsWith('0300')) {
    searchWithoutZero = true;
  }

  // Función para buscar el código
  const findCode = (numToSearch, addZeroBack = false) => {
    // Buscar coincidencias ordenadas por longitud de código (más largo primero)
    const codes = [...new Set(phoneNumbersData.map(item => item.codigo))];
    const sortedCodes = codes.sort((a, b) => b.length - a.length);

    for (const code of sortedCodes) {
      if (numToSearch.startsWith(code)) {
        // Verificar que después del código queden al menos 6 dígitos para el número
        const remainingLength = numToSearch.length - code.length;
        if (remainingLength >= 6 && remainingLength <= 8) {
          // Buscar la primera localidad que coincida con este código
          const location = phoneNumbersData.find(item => item.codigo === code);

          // Si es un código compartido por múltiples localidades,
          // buscar si hay alguna que sea capital o ciudad principal
          const allLocations = phoneNumbersData.filter(item => item.codigo === code);
          let selectedLocation = location;

          if (allLocations.length > 1) {
            // Priorizar capitales o ciudades principales
            const mainCity = allLocations.find(loc =>
              loc.localidad.toLowerCase().includes('capital') ||
              loc.localidad.toLowerCase().includes('san miguel') || // Para Tucumán
              loc.localidad.toLowerCase().includes('rosario') || // Para Santa Fe
              loc.localidad.toLowerCase().includes('mar del plata') // Para Buenos Aires
            );

            if (mainCity) {
              selectedLocation = mainCity;
            }
          }

          return {
            areaCode: addZeroBack ? '0' + code : code,
            remainingNumber: numToSearch.substring(code.length),
            location: selectedLocation
          };
        }
      }
    }
    return null;
  };

  // Primero intentar con el número completo
  let result = findCode(cleanNumber);

  // Si no se encontró y el número empieza con 0, intentar sin el 0
  if (!result && searchWithoutZero) {
    const numberWithoutZero = cleanNumber.substring(1);
    result = findCode(numberWithoutZero, true); // true indica que debemos agregar el 0 de vuelta
  }

  return result;
}

/**
 * Detecta el tipo de teléfono basado en el código de área y número
 */
function detectPhoneType(areaCode, number) {
  // Líneas gratuitas
  if (areaCode.startsWith('0800') || areaCode.startsWith('0810') || areaCode.startsWith('0300')) {
    return 'gratuito';
  }

  // Detectar celulares por patrón
  // En Argentina, los celulares suelen tener 10 dígitos totales (incluyendo código de área)
  const totalLength = areaCode.length + number.length;

  // Si el código de área empieza con 11 o tiene formato de celular
  if (areaCode === '11' && totalLength === 10) {
    return 'celular';
  }

  // Para otros códigos de área, si el total es 10 dígitos, probablemente sea celular
  if (totalLength === 10 && number.startsWith('15')) {
    return 'celular';
  }

  return 'fijo';
}

/**
 * Extrae extensión del texto original
 */
function extractExtension(originalText) {
  const extMatch = originalText.match(/int:?\s*(\d+)/i);
  return extMatch ? extMatch[1] : null;
}

/**
 * Extrae etiqueta descriptiva del texto original
 */
function extractLabel(originalText) {
  // Buscar etiquetas comunes como WSP:, TEL:, CEL:, etc.
  const labelMatch = originalText.match(/^(WSP|TEL|CEL|FAX|WHATSAPP|TELEFONO|CELULAR):\s*/i);
  if (labelMatch) {
    return labelMatch[1].toUpperCase();
  }
  return null;
}

/**
 * Normaliza un número telefónico argentino usando los prefijos conocidos
 */
export function normalizePhoneWithPrefixes(phoneText) {
  if (!phoneText) return JSON.stringify([]);

  // Primero, separar por comas y limpiar espacios
  let phoneGroups = phoneText.split(/[,;]+/).map(p => p.trim()).filter(p => p);

  // Si no hay comas, intentar detectar múltiples números por patrones
  if (phoneGroups.length === 1 && phoneText.includes(':')) {
    // Dividir por etiquetas (WSP:, TEL:, etc.)
    phoneGroups = phoneText.split(/(?=(?:WSP|TEL|CEL|FAX|WHATSAPP|TELEFONO|CELULAR):\s*)/i)
      .map(p => p.trim())
      .filter(p => p);
  }

  const normalizedPhones = [];

  phoneGroups.forEach((phoneGroup, groupIndex) => {
    // Extraer etiqueta si existe
    const label = extractLabel(phoneGroup);
    const phoneWithoutLabel = label ?
      phoneGroup.replace(new RegExp(`^${label}:\\s*`, 'i'), '') :
      phoneGroup;

    // Dividir números múltiples que puedan estar separados por espacios, comas o puntos
    const individualPhones = phoneWithoutLabel
      .split(/[,\s]+/)
      .map(p => p.trim())
      .filter(p => p && /\d/.test(p)); // Solo mantener elementos que contengan dígitos

    individualPhones.forEach((phone, index) => {
      // Limpiar el número pero preservar la estructura para análisis
      const cleanNumber = phone.replace(/[^\d]/g, '');

      if (!cleanNumber || cleanNumber.length < 6) return;

      let normalizedPhone = null;

      // Casos especiales primero
      // 0800, 0810, 0300
      if (cleanNumber.startsWith('0800') || cleanNumber.startsWith('0810') || cleanNumber.startsWith('0300')) {
        normalizedPhone = {
          tipo: 'gratuito',
          codigoArea: cleanNumber.substring(0, 4),
          numero: cleanNumber.substring(4),
          extension: extractExtension(phone),
          descripcion: label || (normalizedPhones.length === 0 ? "Principal" : `Teléfono ${normalizedPhones.length + 1}`)
        };
      }
      // WhatsApp con 11 al principio (celular Buenos Aires)
      else if ((label === 'WSP' || label === 'WHATSAPP') && cleanNumber.startsWith('11')) {
        normalizedPhone = {
          tipo: 'celular',
          codigoArea: '11',
          numero: cleanNumber.substring(2),
          extension: null,
          descripcion: 'WhatsApp'
        };
      }
      // Números cortos sin código de área (como 4501.4864)
      else if (cleanNumber.length === 8 && !cleanNumber.startsWith('0')) {
        // Asumir que es un número local de Buenos Aires si no tiene código
        normalizedPhone = {
          tipo: 'fijo',
          codigoArea: '11', // Asumir Buenos Aires para números locales
          numero: cleanNumber,
          extension: extractExtension(phone),
          descripcion: label === 'TEL' ? 'Teléfono' : (normalizedPhones.length === 0 ? "Principal" : `Teléfono ${normalizedPhones.length + 1}`)
        };
      }
      else {
        // Intentar encontrar el código de área usando la tabla
        const match = findAreaCode(cleanNumber);

        if (match) {
          const { areaCode, remainingNumber, location } = match;

          normalizedPhone = {
            tipo: detectPhoneType(areaCode, remainingNumber),
            codigoArea: areaCode,
            numero: remainingNumber,
            extension: extractExtension(phone),
            descripcion: label ?
              (label === 'WSP' ? 'WhatsApp' : label === 'TEL' ? 'Teléfono' : label) :
              (location ? `${location.localidad}, ${location.provincia}` :
                (normalizedPhones.length === 0 ? "Principal" : `Teléfono ${normalizedPhones.length + 1}`))
          };
        } else {
          // Fallback: intentar detectar el formato manualmente
          const fallbackPhone = normalizeOldFormatPhone(phone, normalizedPhones.length);
          if (fallbackPhone) {
            // Preservar la etiqueta si existe
            if (label) {
              fallbackPhone.descripcion = label === 'WSP' ? 'WhatsApp' :
                label === 'TEL' ? 'Teléfono' : label;
            }
            normalizedPhone = fallbackPhone;
          }
        }
      }

      if (normalizedPhone) {
        normalizedPhones.push(normalizedPhone);
      }
    });
  });

  return JSON.stringify(normalizedPhones);
}

/**
 * Normaliza un formato antiguo de teléfono al formato JSON (fallback)
 */
function normalizeOldFormatPhone(phone, index) {
  const cleanNumber = phone.replace(/\D/g, '');

  if (!cleanNumber || cleanNumber.length < 6) return null;

  let tipo = "fijo";
  let codigoArea = "";
  let numero = cleanNumber;

  // Detectar 0800/0810/0300
  if (cleanNumber.startsWith("0800") || cleanNumber.startsWith("0810") || cleanNumber.startsWith("0300")) {
    tipo = "gratuito";
    codigoArea = cleanNumber.substring(0, 4);
    numero = cleanNumber.substring(4);
  }
  // Detectar celular con 15 al principio
  else if (cleanNumber.startsWith("15") && cleanNumber.length >= 10) {
    tipo = "celular";
    codigoArea = "11"; // Asumimos Buenos Aires
    numero = cleanNumber.substring(2);
  }
  // Número que empieza con 0 (posible código de área con 0)
  else if (cleanNumber.startsWith("0") && cleanNumber.length >= 10) {
    // Intentar identificar el código de área
    // Los códigos con 0 pueden ser: 0XXX (4 dígitos) o 0XX (3 dígitos)
    let possibleAreaCode = "";

    // Primero intentar con 4 dígitos (0299, 0291, etc.)
    if (cleanNumber.length >= 10) {
      const fourDigitCode = cleanNumber.substring(1, 4); // Sin el 0 inicial
      if (phoneNumbersData.some(item => item.codigo === fourDigitCode)) {
        possibleAreaCode = cleanNumber.substring(0, 4); // Con el 0
        numero = cleanNumber.substring(4);
        codigoArea = possibleAreaCode;
      }
    }

    // Si no funcionó, intentar con 3 dígitos (011, etc.)
    if (!possibleAreaCode && cleanNumber.length >= 9) {
      const threeDigitCode = cleanNumber.substring(1, 3); // Sin el 0 inicial
      if (phoneNumbersData.some(item => item.codigo === threeDigitCode)) {
        possibleAreaCode = cleanNumber.substring(0, 3); // Con el 0
        numero = cleanNumber.substring(3);
        codigoArea = possibleAreaCode;
      }
    }

    // Si no se encontró, usar heurística
    if (!possibleAreaCode) {
      if (cleanNumber.length === 11) {
        // Probablemente 0XX XXXX-XXXX
        codigoArea = cleanNumber.substring(0, 3);
        numero = cleanNumber.substring(3);
      } else if (cleanNumber.length === 12) {
        // Probablemente 0XXX XXXX-XXXX
        codigoArea = cleanNumber.substring(0, 4);
        numero = cleanNumber.substring(4);
      }
    }
  }
  // Número de 10 dígitos (posible celular)
  else if (cleanNumber.length === 10) {
    // Verificar si empieza con código de área conocido de 2 o 3 dígitos
    const twoDigitCode = cleanNumber.substring(0, 2);
    const threeDigitCode = cleanNumber.substring(0, 3);

    // Buscar en la tabla de prefijos
    const hasThreeDigitCode = phoneNumbersData.some(item => item.codigo === threeDigitCode);
    const hasTwoDigitCode = phoneNumbersData.some(item => item.codigo === twoDigitCode);

    if (hasThreeDigitCode) {
      codigoArea = threeDigitCode;
      numero = cleanNumber.substring(3);
      tipo = "fijo"; // Los códigos de 3 dígitos suelen ser fijos
    } else if (hasTwoDigitCode) {
      codigoArea = twoDigitCode;
      numero = cleanNumber.substring(2);
      tipo = numero.length === 8 ? "celular" : "fijo";
    } else {
      // Por defecto, asumir código de 2 dígitos
      codigoArea = twoDigitCode;
      numero = cleanNumber.substring(2);
    }
  }
  // Números más cortos (fijos locales)
  else if (cleanNumber.length >= 8) {
    // Intentar detectar código de área
    const possibleCodes = [
      cleanNumber.substring(0, 4), // 4 dígitos
      cleanNumber.substring(0, 3), // 3 dígitos
      cleanNumber.substring(0, 2)  // 2 dígitos
    ];

    for (const code of possibleCodes) {
      if (phoneNumbersData.some(item => item.codigo === code)) {
        codigoArea = code;
        numero = cleanNumber.substring(code.length);
        break;
      }
    }

    // Si no se encontró, usar heurística
    if (!codigoArea) {
      if (cleanNumber.length === 8) {
        // Número local sin código de área
        numero = cleanNumber;
      } else {
        // Asumir código de 2-3 dígitos basado en la longitud
        const codeLength = cleanNumber.length === 9 ? 2 : 3;
        codigoArea = cleanNumber.substring(0, codeLength);
        numero = cleanNumber.substring(codeLength);
      }
    }
  }

  return {
    tipo,
    codigoArea,
    numero,
    extension: extractExtension(phone),
    descripcion: index === 0 ? "Principal" : `Teléfono ${index + 1}`
  };
}

/**
 * Normaliza un formato antiguo de teléfono al formato JSON
 * @param {string} oldFormat - Formato antiguo (puede tener múltiples teléfonos separados por comas)
 * @returns {string} - JSON de teléfonos
 */
export function normalizeOldPhoneFormat(oldFormat) {
  return normalizePhoneWithPrefixes(oldFormat);
}

/**
 * Formatea un teléfono para mostrar en la interfaz de usuario
 * @param {Object} phone - Objeto de teléfono
 * @returns {string} - Teléfono formateado
 */
export function formatPhoneForDisplay(phone) {
  if (!phone) return '';

  const { tipo, codigoArea, numero, extension, descripcion } = phone;
  let formatted = '';

  // Formateo según tipo
  switch (tipo) {
    case 'gratuito':
      // Formato 0800-XXX-XXXX
      if (numero.length === 7) {
        formatted = `${codigoArea}-${numero.substring(0, 3)}-${numero.substring(3)}`;
      } else {
        formatted = `${codigoArea} ${numero}`;
      }
      break;

    case 'celular':
      // Formato XX XXXX-XXXX o 15-XXXX-XXXX para celulares
      if (numero.length === 8) {
        formatted = `${codigoArea} ${numero.substring(0, 4)}-${numero.substring(4)}`;
      } else if (numero.length === 10 && numero.startsWith('15')) {
        // Formato con 15
        formatted = `${codigoArea} ${numero.substring(0, 2)}-${numero.substring(2, 6)}-${numero.substring(6)}`;
      } else {
        formatted = `${codigoArea} ${numero}`;
      }
      break;

    case 'fijo':
    default:
      // Para números fijos, no mostrar paréntesis si no hay código de área
      if (!codigoArea || codigoArea === '') {
        formatted = numero;
      } else {
        // Formato (XXX) XXXX-XXXX o (XXX) XXX-XXXX dependiendo de la longitud
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

  // Agregar extensión si existe
  if (extension) {
    formatted += ` int. ${extension}`;
  }

  // Agregar descripción especial si es WhatsApp o tiene etiqueta específica
  if (descripcion && (descripcion === 'WhatsApp' || descripcion === 'Teléfono')) {
    formatted = `${descripcion}: ${formatted}`;
  }

  return formatted;
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
      if (!phone.codigoArea || !['0800', '0810', '0300'].includes(phone.codigoArea)) {
        errors.push("El código de área debe ser 0800, 0810 o 0300 para teléfonos gratuitos");
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
  { value: 'gratuito', label: 'Línea Gratuita (0800/0810/0300)' },
  { value: 'fax', label: 'Fax' },
  { value: 'otro', label: 'Otro' }
];