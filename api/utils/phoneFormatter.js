/**
 * Utilidades para formateo y normalización de teléfonos argentinos
 * @module utils/phoneFormatter
 *
 * NOTA: Este archivo ahora usa la librería phone-formatter ofuscada
 * Mantiene la misma API pública para compatibilidad
 */

const { PhoneFormatter } = require("../libs/phone-formatter");
const { phoneNumbersData } = require('./phoneNumbersData');

// Crear instancia única reutilizable
const formatter = new PhoneFormatter(phoneNumbersData);

// ============================================================================
// EXPORTAR TODAS LAS FUNCIONES CON LA MISMA API QUE ANTES
// ============================================================================

module.exports = {
  // Funciones básicas
  cleanPhone: (phone) => formatter.cleanPhone(phone),
  extractExtension: (text) => formatter.extractExtension(text),
  extractLabel: (text) => formatter.extractLabel(text),

  // Búsqueda de códigos
  findAreaCodeData: (phone) => formatter.findAreaCodeByLocation(phone),
  findAreaCodeByLocation: (provincia, localidad) => formatter.findAreaCodeByLocation(provincia, localidad),
  isValidAreaCode: (code) => formatter.isValidAreaCode(code),
  getAllAreaCodes: () => formatter.getAllAreaCodes(),

  // Detección y procesamiento
  detectPhoneType: (areaCode, number) => formatter.detectPhoneType(areaCode, number),
  detectAreaCodeInNumber: (number, provincia, localidad) => formatter.detectAreaCodeInNumber(number, provincia, localidad),

  // Procesamiento de patrones especiales
  parsePhoneLine: (rawText) => formatter.parsePhoneLine(rawText),
  parsePhoneTextToArray: (text) => formatter.parsePhoneTextToArray(text),
  formatPhonesToCSV: (phones) => formatter.formatPhonesToCSV(phones),
  processLongNumberWith15: (clean, provincia, localidad) => formatter.processLongNumberWith15(clean, provincia, localidad),
  processHistoricalCellularPattern: (phoneText) => formatter.processHistoricalCellularPattern(phoneText),
  processIndependentNumbers: (parts, provincia, localidad) => formatter.processIndependentNumbers(parts, provincia, localidad),
  validateAndAdjustPhone: (phoneResult) => formatter.validateAndAdjustPhone(phoneResult),
  processComplexArgentinePattern: (phoneText) => formatter.processComplexArgentinePattern(phoneText),
  processAbbreviatedNumbers: (fullNumber, shortDigits) => formatter.processAbbreviatedNumbers(fullNumber, shortDigits),
  detectSpecialPatterns: (phoneText, provincia, localidad) => formatter.detectSpecialPatterns(phoneText, provincia, localidad),

  // Conversiones entre formatos
  phoneJsonToCSVFormat: (phoneJson) => formatter.phoneJsonToCSVFormat(phoneJson),
  csvFormatToPhoneJson: (csvFormat) => formatter.csvFormatToPhoneJson(csvFormat),

  // Normalización principal - FUNCIONES MÁS IMPORTANTES
  normalizePhoneWithPrefixes: (phoneText, provincia, localidad) => formatter.normalizePhoneWithPrefixes(phoneText, provincia, localidad),
  normalizeOldPhoneFormat: (phoneText) => formatter.normalizeOldPhoneFormat(phoneText),

  // Formateo para visualización
  formatPhoneForDisplay: (phone) => formatter.formatPhoneForDisplay(phone),
  formatPhonesForDisplay: (phones) => formatter.formatPhonesForDisplay(phones),
  formatFirstPhoneForDisplay: (phones) => formatter.formatFirstPhoneForDisplay(phones),
  formatPhoneForPDF: (phoneValue) => formatter.formatPhoneForPDF(phoneValue),

  // Validación y utilidades
  isPhoneJsonFormat: (value) => formatter.isPhoneJsonFormat(value),
  validatePhone: (phone) => formatter.validatePhone(phone),

  // Exportación/importación
  exportPhonesToCSV: (phoneJson) => formatter.exportPhonesToCSV(phoneJson),
  importPhonesFromCSV: (csvText) => formatter.importPhonesFromCSV(csvText),

  // Constantes
  PHONE_TYPES: formatter.getPhoneTypes(),

  // Acceso directo a la instancia del formatter (por si se necesita)
  _formatter: formatter
};