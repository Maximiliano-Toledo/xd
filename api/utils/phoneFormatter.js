/**
 * Utilidades para formateo y normalización de teléfonos argentinos (versión backend completa)
 * @module utils/phoneFormatter
 */

const { phoneNumbersData } = require('./phoneNumbersData');

// ============================================================================
// UTILIDADES BÁSICAS
// ============================================================================

const cleanPhone = (phone) => phone?.replace(/\D/g, '') || '';

const extractExtension = (text) => text?.match(/int:?\s*(\d+)/i)?.[1] || null;

const extractLabel = (text) => {
  const match = text?.match(/^(WSP|TEL|CEL|FAX|WHATSAPP|TELEFONO|CELULAR)[\s:]+/i);
  return match?.[1]?.toUpperCase() || null;
};

// ============================================================================
// BÚSQUEDA EN BASE DE DATOS DE CÓDIGOS
// ============================================================================

function findAreaCodeData(phone) {
  for (const data of phoneNumbersData) {
    if (phone.startsWith(data.codigoArea)) {
      return data;
    }
  }
  return null;
}

// ============================================================================
// FORMATEO PRINCIPAL
// ============================================================================

function parsePhoneLine(rawText) {
  const cleaned = cleanPhone(rawText);
  const label = extractLabel(rawText);
  const extension = extractExtension(rawText);

  if (!cleaned) return null;

  const data = findAreaCodeData(cleaned);
  if (!data) return {
    tipo: label || 'desconocido',
    codigoArea: '',
    numero: cleaned,
    extension,
    descripcion: rawText
  };

  const phoneBody = cleaned.slice(data.codigoArea.length);

  return {
    tipo: data.tipo || label || 'desconocido',
    codigoArea: data.codigoArea,
    numero: phoneBody,
    extension,
    descripcion: rawText
  };
}

function parsePhoneTextToArray(text) {
  if (!text) return [];
  return text
    .split(/[;|\n]/)
    .map(t => t.trim())
    .map(parsePhoneLine)
    .filter(Boolean);
}

function formatPhonesToCSV(phones) {
  return phones.map(phone => {
    return `type:${phone.tipo || 'fijo'}|area:${phone.codigoArea || ''}|num:${phone.numero || ''}|ext:${phone.extension || ''}|desc:${phone.descripcion || ''}`;
  }).join(';');
}

function phoneJsonToCSVFormat(phoneJson) {
  if (!phoneJson) return '';

  try {
    const phones = typeof phoneJson === 'string' ? JSON.parse(phoneJson) : phoneJson;
    if (!Array.isArray(phones)) return phoneJson;

    return formatPhonesToCSV(phones);
  } catch (e) {
    return phoneJson;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  cleanPhone,
  extractExtension,
  extractLabel,
  findAreaCodeData,
  parsePhoneLine,
  parsePhoneTextToArray,
  formatPhonesToCSV,
  phoneJsonToCSVFormat,
};
