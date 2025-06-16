/**
 * Utilidades para formateo y normalización de teléfonos argentinos (versión completa final)
 * Maneja todos los patrones telefónicos argentinos incluyendo casos especiales y edge cases
 */

import { phoneNumbersData } from './phoneNumbersData';

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

/**
 * Busca un código de área en la base de datos por provincia y localidad
 * @param {string} provincia - Nombre de la provincia
 * @param {string} localidad - Nombre de la localidad
 * @returns {string|null} - Código de área encontrado
 */
function findAreaCodeByLocation(provincia, localidad) {
  if (!provincia || !phoneNumbersData) return null;

  const normalizeText = (text) => text?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .trim() || '';

  const searchProv = normalizeText(provincia);
  const searchLoc = normalizeText(localidad);

  // Buscar coincidencia exacta
  const match = phoneNumbersData.find(item => {
    const itemProv = normalizeText(item.provincia);
    const itemLoc = normalizeText(item.localidad);

    const provMatch = itemProv.includes(searchProv) || searchProv.includes(itemProv);
    const locMatch = !searchLoc || itemLoc.includes(searchLoc) || searchLoc.includes(itemLoc);

    return provMatch && locMatch;
  });

  return match ? (match.codigo.startsWith('0') ? match.codigo.substring(1) : match.codigo) : null;
}

/**
 * Valida si un código de área existe en la base de datos
 * @param {string} code - Código a validar
 * @returns {boolean} - true si existe
 */
function isValidAreaCode(code) {
  if (!phoneNumbersData || !code) return false;

  const normalizedCode = code.startsWith('0') ? code.substring(1) : code;
  return phoneNumbersData.some(item =>
    item.codigo === normalizedCode ||
    item.codigo === '0' + normalizedCode
  );
}

// ============================================================================
// DETECCIÓN DE TIPOS Y CÓDIGOS
// ============================================================================

/**
 * Detecta el tipo de teléfono según código de área y número
 * @param {string} areaCode - Código de área
 * @param {string} number - Número sin código
 * @returns {string} - 'fijo', 'celular', o 'gratuito'
 */
function detectPhoneType(areaCode, number) {
  // Líneas gratuitas
  if (areaCode.match(/^0?(800|810|300)$/)) {
    return 'gratuito';
  }

  // Buenos Aires (11) - lógica especial
  if (areaCode === '11' || areaCode === '011') {
    // Si el número empieza con 15, es celular histórico
    if (number.startsWith('15')) {
      return 'celular';
    }
    // Si es de 8 dígitos, es celular
    if (number.length === 8) {
      return 'celular';
    }
    // Si es de 7 dígitos o menos, es fijo
    return 'fijo';
  }

  // Para otros códigos de área
  // Si el número empieza con 15, es celular histórico
  if (number.startsWith('15')) {
    return 'celular';
  }

  // Si el número es de 8 dígitos, probablemente es celular
  if (number.length === 8) {
    return 'celular';
  }

  // Default: fijo
  return 'fijo';
}

/**
 * Detecta código de área en un número completo con manejo de casos especiales argentinos
 * @param {string} number - Número limpio
 * @param {string} provincia - Provincia para validación (opcional)
 * @param {string} localidad - Localidad para validación (opcional)
 * @returns {Object|null} - {areaCode, number, tipo} o null
 */
function detectAreaCodeInNumber(number, provincia = null, localidad = null) {
  const clean = cleanPhone(number);

  // Casos especiales: líneas gratuitas (incluir espacios)
  if (clean.match(/^0?(800|810|300)/)) {
    const areaCode = clean.match(/^0?(800|810|300)/)[1];
    const remainingNumber = clean.replace(/^0?(800|810|300)/, '');
    return {
      areaCode: '0' + areaCode,
      number: remainingNumber,
      tipo: 'gratuito'
    };
  }

  // CASO ESPECIAL: Números que empiezan con 15 seguido de código (15XXXXXXXXX)
  if (clean.startsWith('15') && clean.length >= 10) {
    // Caso: 1569935570 -> podría ser 15 + código + número
    const withoutPrefix = clean.substring(2);

    // Intentar detectar código de área en el resto
    for (let len = 4; len >= 2; len--) {
      const potentialCode = withoutPrefix.substring(0, len);
      const remainingNumber = withoutPrefix.substring(len);

      if (remainingNumber.length >= 6 && remainingNumber.length <= 8) {
        // Validar código si tenemos base de datos
        if (isValidAreaCode(potentialCode) || !phoneNumbersData || potentialCode === '11') {
          return {
            areaCode: potentialCode,
            number: remainingNumber,
            tipo: 'celular'
          };
        }
      }
    }

    // Fallback: asumir Buenos Aires
    return {
      areaCode: '11',
      number: withoutPrefix,
      tipo: 'celular'
    };
  }

  // CASO ESPECIAL 1: Números largos con "15" embebido (ej: 111544496593)
  if (clean.length >= 11 && clean.length <= 13) {
    const longNumberResult = processLongNumberWith15(clean, provincia, localidad);
    if (longNumberResult) {
      return longNumberResult;
    }
  }

  // CASO ESPECIAL: Números con formato 011 + 15 + número (01115XXXXXXXX)
  if (clean.startsWith('011') && clean.length >= 12) {
    const afterCode = clean.substring(3);
    if (afterCode.startsWith('15')) {
      const actualNumber = afterCode.substring(2);
      return {
        areaCode: '11',
        number: actualNumber,
        tipo: 'celular'
      };
    }
  }

  // Para números que empiezan con 0 (formato completo con código)
  if (clean.startsWith('0')) {
    // Probar códigos de diferentes longitudes (hasta 5 dígitos)
    for (let len = 6; len >= 3; len--) {
      const potentialCode = clean.substring(0, len);
      const remainingNumber = clean.substring(len);

      if (remainingNumber.length >= 6 && remainingNumber.length <= 10) {
        const normalizedCode = potentialCode.startsWith('0') && potentialCode.length > 1
          ? potentialCode.substring(1)
          : potentialCode;

        // Validar código en base de datos si está disponible
        if (isValidAreaCode(normalizedCode) || !phoneNumbersData) {
          return {
            areaCode: normalizedCode,
            number: remainingNumber,
            tipo: detectPhoneType(normalizedCode, remainingNumber)
          };
        }
      }
    }
  }

  // CASO ESPECIAL: Números de 8 dígitos sin código - asumir Buenos Aires
  if (clean.length === 8) {
    return {
      areaCode: '11',
      number: clean,
      tipo: clean.startsWith('4') ? 'fijo' : 'celular'
    };
  }

  // CASO ESPECIAL: Números de 7 dígitos sin código - asumir Buenos Aires fijo
  if (clean.length === 7) {
    return {
      areaCode: '11',
      number: clean,
      tipo: 'fijo'
    };
  }

  // Para números sin 0 inicial
  for (let len = 4; len >= 2; len--) {
    const potentialCode = clean.substring(0, len);
    const remainingNumber = clean.substring(len);

    if (remainingNumber.length >= 6 && remainingNumber.length <= 8) {
      // Validar código si tenemos base de datos
      if (isValidAreaCode(potentialCode) || !phoneNumbersData) {
        return {
          areaCode: potentialCode,
          number: remainingNumber,
          tipo: detectPhoneType(potentialCode, remainingNumber)
        };
      }
    }
  }

  return null;
}

// ============================================================================
// MANEJO DE CASOS ESPECIALES ARGENTINOS
// ============================================================================

/**
 * Procesa números largos que pueden tener "15" embebido (ej: 111544496593)
 * @param {string} clean - Número limpio
 * @param {string} provincia - Provincia para contexto
 * @param {string} localidad - Localidad para contexto
 * @returns {Object|null} - Resultado procesado o null
 */
function processLongNumberWith15(clean, provincia = null, localidad = null) {
  // Caso: 111544496593 (12 dígitos)
  // Interpretación: 11 + 15 + 44496593 -> 11 + 44496593
  if (clean.length === 12 && clean.startsWith('11') && clean.substring(2, 4) === '15') {
    const actualNumber = clean.substring(4); // Remover "11" + "15"
    return {
      areaCode: '11',
      number: actualNumber,
      tipo: 'celular'
    };
  }

  // Caso general: buscar "15" en posiciones 2-4
  for (let pos = 2; pos <= 4 && pos < clean.length - 2; pos++) {
    if (clean.substring(pos, pos + 2) === '15') {
      const potentialCode = clean.substring(0, pos);
      const actualNumber = clean.substring(0, pos) + clean.substring(pos + 2);

      // Validar que el código sea válido
      if (isValidAreaCode(potentialCode) || (potentialCode === '11')) {
        const finalNumber = clean.substring(pos + 2);

        // Verificar que el número restante tenga sentido (6-8 dígitos)
        if (finalNumber.length >= 6 && finalNumber.length <= 8) {
          return {
            areaCode: potentialCode,
            number: finalNumber,
            tipo: 'celular'
          };
        }
      }
    }
  }

  return null;
}

/**
 * Procesa el patrón especial "código + 15 + número" (ej: 0266 15 44329679)
 * @param {string} phoneText - Texto completo del teléfono
 * @returns {Object|null} - Resultado procesado o null
 */
function processHistoricalCellularPattern(phoneText) {
  const clean = phoneText.trim();
  const parts = clean.split(/\s+/).filter(p => p && /\d/.test(p));

  // Patrón: código + "15" + número
  if (parts.length === 3) {
    const [codePart, prefix, numberPart] = parts.map(cleanPhone);

    if (prefix === '15') {
      const areaCode = codePart.startsWith('0') && codePart.length > 1
        ? codePart.substring(1)
        : codePart;

      // CASO ESPECIAL: 0266 15 44329679
      // Si el número es muy largo (8+ dígitos), podríamos tener un error de tipeo
      // Asumimos que es correcto y lo formateamos como celular del interior
      return {
        areaCode,
        number: numberPart,
        tipo: 'celular',
        isHistoricalCellular: true
      };
    }
  }

  return null;
}

/**
 * Procesa múltiples números que pueden no estar relacionados o ser números locales
 * @param {Array} parts - Partes del teléfono
 * @param {string} provincia - Provincia para contexto
 * @param {string} localidad - Localidad para contexto
 * @returns {Array} - Array de resultados procesados
 */
function processIndependentNumbers(parts, provincia = null, localidad = null) {
  const results = [];
  let detectedAreaCode = null;

  parts.forEach((part, index) => {
    const cleanPart = cleanPhone(part);

    // CASO ESPECIAL: detectar si es un número con espacio que incluye código de área
    // Ejemplo: "0221 4219296" -> código "0221" + número "4219296"
    if (part.includes(' ') && index === 0) {
      const spaceParts = part.trim().split(/\s+/);
      if (spaceParts.length === 2) {
        const [codePart, numberPart] = spaceParts.map(cleanPhone);

        // Si el primer parte parece un código de área (3-4 dígitos) y el segundo un número (6-8 dígitos)
        if (codePart.length >= 3 && codePart.length <= 4 && numberPart.length >= 6 && numberPart.length <= 8) {
          const areaCode = codePart.startsWith('0') && codePart.length > 1
            ? codePart.substring(1)
            : codePart;

          results.push({
            areaCode,
            number: numberPart,
            tipo: detectPhoneType(areaCode, numberPart)
          });

          detectedAreaCode = areaCode;
          return;
        }
      }
    }

    // Intentar detección normal
    const detection = detectAreaCodeInNumber(cleanPart, provincia, localidad);

    if (detection) {
      results.push(detection);

      // Guardar el primer código de área detectado para números posteriores
      if (index === 0) {
        detectedAreaCode = detection.areaCode;
      }
    } else {
      // CASO ESPECIAL: números locales sin código
      // Ej: "0221 4219296, 4259296, 4257404" -> el segundo y tercero usan el código del primero
      if (detectedAreaCode && cleanPart.length >= 6 && cleanPart.length <= 8) {
        results.push({
          areaCode: detectedAreaCode,
          number: cleanPart,
          tipo: detectPhoneType(detectedAreaCode, cleanPart),
          isLocal: true
        });
      }
      // CASO ESPECIAL: números sin código aparente - asumir Buenos Aires
      else if (cleanPart.length === 8) {
        results.push({
          areaCode: '11',
          number: cleanPart,
          tipo: cleanPart.startsWith('4') ? 'fijo' : 'celular',
          assumedBA: true
        });
      }
      // Si es un número de 7 dígitos, también podría ser Buenos Aires fijo
      else if (cleanPart.length === 7) {
        results.push({
          areaCode: '11',
          number: cleanPart,
          tipo: 'fijo',
          assumedBA: true
        });
      }
    }
  });

  return results;
}

/**
 * Valida y ajusta números que pueden tener errores comunes
 * @param {Object} phoneResult - Resultado del procesamiento inicial
 * @returns {Object} - Resultado ajustado
 */
function validateAndAdjustPhone(phoneResult) {
  if (!phoneResult) return null;

  const { areaCode, number, tipo } = phoneResult;

  // Ajuste para números muy largos del interior
  if (tipo === 'celular' && areaCode !== '11' && number.length > 8) {
    // Si el número es muy largo, podría haber un error
    // Mantener los primeros 7-8 dígitos
    const adjustedNumber = number.substring(0, 8);

    return {
      ...phoneResult,
      number: adjustedNumber,
      adjusted: true
    };
  }

  // Ajuste para códigos de área que deberían tener 0
  if (tipo === 'fijo' && areaCode !== '11' && !areaCode.startsWith('0')) {
    // Para teléfonos fijos del interior, el código suele mostrarse con 0
    return {
      ...phoneResult,
      displayAreaCode: '0' + areaCode,
      normalized: true
    };
  }

  return phoneResult;
}

// ============================================================================
// PROCESAMIENTO DE PATRONES ESPECIALES
// ============================================================================

/**
 * Procesa números con formato especial argentino
 * @param {string} phoneText - Texto como "011 44609032 9036"
 * @returns {Array} - Array de objetos de teléfono
 */
function processComplexArgentinePattern(phoneText) {
  const clean = phoneText.trim();
  const parts = clean.split(/\s+/).filter(p => p && /\d/.test(p));

  // Patrón: código + número1 + número2 + número3... (para espacios múltiples)
  if (parts.length >= 3) {
    const [code, ...numbers] = parts.map(cleanPhone);

    if (code.length <= 4) {
      const areaCode = code.startsWith('0') && code.length > 1 ? code.substring(1) : code;
      const results = [];

      // Primer número completo
      if (numbers[0] && numbers[0].length >= 6) {
        results.push({
          areaCode,
          number: numbers[0],
          tipo: detectPhoneType(areaCode, numbers[0])
        });

        // Números adicionales (pueden ser abreviaciones)
        for (let i = 1; i < numbers.length; i++) {
          const num = numbers[i];
          let fullNumber = num;

          // Si es corto, podría ser abreviación del primero
          if (num.length <= 4 && numbers[0].length >= 6) {
            const baseLength = numbers[0].length - num.length;
            fullNumber = numbers[0].substring(0, baseLength) + num;
          }

          results.push({
            areaCode,
            number: fullNumber,
            tipo: detectPhoneType(areaCode, fullNumber)
          });
        }
      }

      return results.length > 0 ? results : null;
    }
  }

  if (parts.length === 2) {
    const [firstPart, secondPart] = parts.map(cleanPhone);

    // Patrón: código + 15 + número (0266 15 44329679)
    if (secondPart.startsWith('15')) {
      const areaCode = firstPart.startsWith('0') && firstPart.length > 1
        ? firstPart.substring(1)
        : firstPart;
      const actualNumber = secondPart.substring(2);

      return [{
        areaCode,
        number: actualNumber,
        tipo: 'celular'
      }];
    }

    // Patrón normal: código + número
    if (firstPart.length <= 4 && secondPart.length >= 6) {
      const areaCode = firstPart.startsWith('0') && firstPart.length > 1
        ? firstPart.substring(1)
        : firstPart;

      return [{
        areaCode,
        number: secondPart,
        tipo: detectPhoneType(areaCode, secondPart)
      }];
    }
  }

  return null;
}

/**
 * Procesa números abreviados (2346434583,84)
 * @param {string} fullNumber - Número completo
 * @param {string} shortDigits - Dígitos cortos
 * @returns {Array} - Array con objetos de teléfono
 */
function processAbbreviatedNumbers(fullNumber, shortDigits) {
  const fullClean = cleanPhone(fullNumber);
  const shortClean = cleanPhone(shortDigits);

  const detection = detectAreaCodeInNumber(fullClean);

  if (detection) {
    const { areaCode, number: baseNumber, tipo } = detection;

    const shortLength = shortClean.length;
    const newNumber = baseNumber.substring(0, baseNumber.length - shortLength) + shortClean;

    return [
      { areaCode, number: baseNumber, tipo },
      { areaCode, number: newNumber, tipo }
    ];
  }

  return [{ raw: fullNumber }];
}

// ============================================================================
// NORMALIZACIÓN PRINCIPAL
// ============================================================================

/**
 * Detecta y procesa patrones especiales en el texto de teléfono
 * @param {string} phoneText - Texto del teléfono
 * @param {string} provincia - Provincia para contexto (opcional)
 * @param {string} localidad - Localidad para contexto (opcional)
 * @returns {Array} - Array de objetos de teléfono
 */
function detectSpecialPatterns(phoneText, provincia = null, localidad = null) {
  const clean = phoneText.trim()
    .replace(/\s*\([^)]*\)\s*/g, ' ') // Remover contenido entre paréntesis pero mantener números
    .replace(/^\((\d+)\)/, '$1 ') // Convertir (011) al inicio a "011 "
    .replace(/\s+/g, ' '); // Normalizar espacios

  // Detectar WhatsApp y etiquetas especiales
  const whatsappMatch = clean.match(/(WhatsApp|WSP)[\s:]+([0-9\s,]+)/i);
  let whatsappPart = null;
  let mainPart = clean;

  if (whatsappMatch) {
    whatsappPart = whatsappMatch[2].trim();
    mainPart = clean.replace(whatsappMatch[0], '').trim();
  }

  const results = [];

  // Procesar parte principal
  if (mainPart) {
    // CASO ESPECIAL 1: Patrón histórico con "15" (0266 15 44329679)
    const historicalPattern = processHistoricalCellularPattern(mainPart);
    if (historicalPattern) {
      const validated = validateAndAdjustPhone(historicalPattern);
      if (validated) {
        results.push(validated);
      }
    } else {
      // CASO ESPECIAL 2: Líneas gratuitas con espacios (0810 122 2424)
      const gratuitousPattern = mainPart.match(/^(0?800|0?810|0?300)\s+(.+)/);
      if (gratuitousPattern) {
        const [, code, numberPart] = gratuitousPattern;
        const cleanCode = '0' + code.replace(/^0/, '');
        const cleanNumber = cleanPhone(numberPart);

        results.push(validateAndAdjustPhone({
          areaCode: cleanCode,
          number: cleanNumber,
          tipo: 'gratuito'
        }));
      } else {
        // Patrón complejo: código + número + número (011 44609032 9036)
        const complexPattern = processComplexArgentinePattern(mainPart);
        if (complexPattern) {
          complexPattern.forEach(pattern => {
            const validated = validateAndAdjustPhone(pattern);
            if (validated) results.push(validated);
          });
        } else {
          // Patrón de múltiples números separados por comas
          const parts = mainPart.split(/[,;]+/).map(p => p.trim()).filter(p => p);

          // CASO ESPECIAL 3: Verificar si son números independientes o locales
          const processedNumbers = processIndependentNumbers(parts, provincia, localidad);

          if (processedNumbers.length > 0) {
            processedNumbers.forEach(num => {
              const validated = validateAndAdjustPhone(num);
              if (validated) results.push(validated);
            });
          } else {
            // Procesamiento normal para otros casos
            let mainAreaCode = null;
            const firstPart = parts[0];
            if (firstPart) {
              const firstDetection = detectAreaCodeInNumber(cleanPhone(firstPart), provincia, localidad);
              if (firstDetection) {
                mainAreaCode = firstDetection.areaCode;
              }
            }

            // Procesar cada parte
            parts.forEach(part => {
              // CASO ESPECIAL: Patrón abreviado (número,dígitos cortos)
              const abbreviatedMatch = part.match(/^(\d{8,11}),(\d{1,4})$/);
              if (abbreviatedMatch) {
                const [, full, short] = abbreviatedMatch;
                const abbreviated = processAbbreviatedNumbers(full, short);
                abbreviated.forEach(a => {
                  if (a.areaCode) {
                    const validated = validateAndAdjustPhone(a);
                    if (validated) results.push(validated);
                  }
                });
                return;
              }

              // Detección normal
              const detection = detectAreaCodeInNumber(cleanPhone(part), provincia, localidad);
              if (detection) {
                const validated = validateAndAdjustPhone(detection);
                if (validated) results.push(validated);
              } else if (mainAreaCode) {
                // Si no se detecta código pero hay uno principal, usarlo
                const cleanPart = cleanPhone(part);
                if (cleanPart.length >= 6 && cleanPart.length <= 8) {
                  const phoneObj = {
                    areaCode: mainAreaCode,
                    number: cleanPart,
                    tipo: detectPhoneType(mainAreaCode, cleanPart),
                    isLocal: true
                  };
                  const validated = validateAndAdjustPhone(phoneObj);
                  if (validated) results.push(validated);
                }
              }
            });
          }
        }
      }
    }
  }

  // Procesar WhatsApp si existe
  if (whatsappPart) {
    const whatsappNumbers = whatsappPart.split(/[,;]+/).map(p => p.trim()).filter(p => p);
    whatsappNumbers.forEach(num => {
      const detection = detectAreaCodeInNumber(cleanPhone(num), provincia, localidad);
      if (detection) {
        const validated = validateAndAdjustPhone(detection);
        if (validated) {
          results.push({
            ...validated,
            isWhatsApp: true
          });
        }
      }
    });
  }

  return results;
}

/**
 * Función principal de normalización
 * @param {string} phoneText - Texto con teléfonos
 * @param {string} provincia - Provincia para contexto (opcional)
 * @param {string} localidad - Localidad para contexto (opcional)
 * @returns {string} - JSON con array de teléfonos normalizados
 */
export function normalizePhoneWithPrefixes(phoneText, provincia = null, localidad = null) {
  if (!phoneText) return JSON.stringify([]);

  const detectedPatterns = detectSpecialPatterns(phoneText, provincia, localidad);

  const phones = detectedPatterns.map((pattern, index) => ({
    tipo: pattern.tipo || 'fijo',
    codigoArea: pattern.areaCode || '',
    numero: pattern.number || '',
    extension: extractExtension(phoneText),
    descripcion: pattern.isWhatsApp ? 'WhatsApp' :
      index === 0 ? 'Principal' : `Teléfono ${index + 1}`
  })).filter(phone => phone.numero);

  return JSON.stringify(phones);
}

// ============================================================================
// FORMATEO PARA VISUALIZACIÓN
// ============================================================================

/**
 * Formatea un teléfono individual para mostrar con manejo de casos especiales
 * @param {Object} phone - Objeto de teléfono
 * @returns {string} - Teléfono formateado
 */
export function formatPhoneForDisplay(phone) {
  if (!phone) return '';

  const { tipo, codigoArea, numero, extension, descripcion, displayAreaCode, assumedBA, adjusted, isLocal } = phone;
  let formatted = '';

  // Usar displayAreaCode si está disponible, sino usar codigoArea
  const effectiveAreaCode = displayAreaCode || codigoArea;

  // Normalizar código para comparación
  const normalizedCode = codigoArea?.replace(/^0+/, '') || '';

  switch (tipo) {
    case 'gratuito':
      // Formato: 0800-123-4567
      const code = effectiveAreaCode.startsWith('0') ? effectiveAreaCode : '0' + effectiveAreaCode;
      if (numero.length === 7) {
        formatted = `${code}-${numero.substring(0, 3)}-${numero.substring(3)}`;
      } else if (numero.length === 6) {
        formatted = `${code}-${numero.substring(0, 3)}-${numero.substring(3)}`;
      } else {
        formatted = `${code}-${numero}`;
      }
      break;

    case 'celular':
      if (normalizedCode === '11') {
        // Buenos Aires celular: 11 1234-5678
        if (numero.length === 8) {
          formatted = `11 ${numero.substring(0, 4)}-${numero.substring(4)}`;
        } else if (numero.length === 7) {
          formatted = `11 ${numero.substring(0, 3)}-${numero.substring(3)}`;
        } else {
          formatted = `11 ${numero}`;
        }
      } else {
        // Otros códigos celular: (123) 456-7890
        const displayCode = effectiveAreaCode;
        if (numero.length >= 6) {
          // MEJORA: Formateo inteligente según longitud del número
          let splitAt;
          if (numero.length === 8) {
            splitAt = 4; // 1234-5678
          } else if (numero.length === 7) {
            splitAt = 3; // 123-4567
          } else {
            splitAt = Math.max(3, numero.length - 3);
          }
          formatted = `(${displayCode}) ${numero.substring(0, splitAt)}-${numero.substring(splitAt)}`;
        } else {
          formatted = `(${displayCode}) ${numero}`;
        }
      }
      break;

    default: // 'fijo'
      if (normalizedCode === '11') {
        // Buenos Aires fijo: formato especial dependiendo si se asumió BA o no
        const displayCode = assumedBA ? '11' : (effectiveAreaCode.startsWith('0') ? effectiveAreaCode : '011');
        if (numero.length >= 7) {
          const splitAt = numero.length === 8 ? 4 : 3;

          // AJUSTE: Si se asumió Buenos Aires, usar formato celular
          if (assumedBA) {
            formatted = `${displayCode} ${numero.substring(0, splitAt)}-${numero.substring(splitAt)}`;
          } else {
            formatted = `(${displayCode}) ${numero.substring(0, splitAt)}-${numero.substring(splitAt)}`;
          }
        } else {
          formatted = assumedBA ? `${displayCode} ${numero}` : `(${displayCode}) ${numero}`;
        }
      } else {
        // Otros códigos fijo: (0123) 456-789
        // AJUSTE: Para números locales, mostrar el código con 0 inicial
        const displayCode = isLocal ?
          (effectiveAreaCode.startsWith('0') ? effectiveAreaCode : '0' + effectiveAreaCode) :
          (effectiveAreaCode.startsWith('0') ? effectiveAreaCode :
            (effectiveAreaCode.length <= 3 ? '0' + effectiveAreaCode : effectiveAreaCode));

        if (numero.length >= 6) {
          // MEJORA: Formateo más inteligente para números locales y códigos específicos
          let splitAt;
          if (isLocal && numero.length === 7) {
            // Para números locales de 7 dígitos: 421-9296
            splitAt = 3;
          } else if (numero.length === 8) {
            splitAt = 4; // 1234-5678
          } else if (numero.length === 7) {
            splitAt = 3; // 123-4567
          } else {
            splitAt = Math.max(3, numero.length - 3);
          }
          formatted = `(${displayCode}) ${numero.substring(0, splitAt)}-${numero.substring(splitAt)}`;
        } else {
          formatted = `(${displayCode}) ${numero}`;
        }
      }
  }

  // Agregar extensión si existe
  if (extension) {
    formatted += ` int. ${extension}`;
  }

  // Agregar prefijo de descripción si es relevante
  if (descripcion === 'WhatsApp') {
    formatted = `${descripcion}: ${formatted}`;
  }

  // Agregar indicadores de procesamiento especial (opcional, para debug)
  // if (assumedBA) formatted += ' (BA assumido)';
  // if (adjusted) formatted += ' (ajustado)';
  // if (isLocal) formatted += ' (local)';

  return formatted;
}

/**
 * Formatea múltiples teléfonos para mostrar
 * @param {string|Array} phones - JSON string o array de teléfonos
 * @returns {string} - Teléfonos formateados separados por coma
 */
export function formatPhonesForDisplay(phones) {
  if (!phones) return '';

  try {
    const parsed = typeof phones === 'string' ? JSON.parse(phones) : phones;

    if (Array.isArray(parsed)) {
      return parsed.map(formatPhoneForDisplay).join(', ');
    }

    return phones.toString();
  } catch (e) {
    return phones.toString();
  }
}

// ============================================================================
// FUNCIONES DE COMPATIBILIDAD Y UTILIDADES
// ============================================================================

export function phoneJsonToCSVFormat(phoneJson) {
  if (!phoneJson) return '';

  try {
    const phones = typeof phoneJson === 'string' ? JSON.parse(phoneJson) : phoneJson;
    if (!Array.isArray(phones)) return phoneJson;

    return phones.map(p =>
      `type:${p.tipo||'fijo'}|area:${p.codigoArea||''}|num:${p.numero||''}|ext:${p.extension||''}|desc:${p.descripcion||''}`
    ).join(';');
  } catch (e) {
    return phoneJson;
  }
}

export function csvFormatToPhoneJson(csvValue) {
  if (!csvValue) return JSON.stringify([]);

  try {
    const parsed = JSON.parse(csvValue);
    if (Array.isArray(parsed)) return csvValue;
  } catch (e) {}

  if (csvValue.includes('type:') && csvValue.includes('|area:')) {
    const phones = csvValue.split(';').map(phoneStr => {
      const phone = {};
      phoneStr.split('|').forEach(part => {
        const [key, value] = part.split(':');
        const mapping = {
          type: 'tipo',
          area: 'codigoArea',
          num: 'numero',
          ext: 'extension',
          desc: 'descripcion'
        };
        if (mapping[key]) phone[mapping[key]] = value || null;
      });
      return phone;
    });
    return JSON.stringify(phones);
  }

  return normalizePhoneWithPrefixes(csvValue);
}

export function isPhoneJsonFormat(value) {
  try {
    return Array.isArray(JSON.parse(value));
  } catch (e) {
    return false;
  }
}

export function validatePhone(phone) {
  const errors = [];
  if (!phone.tipo) errors.push("Tipo requerido");
  if (!phone.numero) errors.push("Número requerido");

  const rules = {
    gratuito: { area: /^0(800|810|300)$/, num: /^\d{6,8}$/ },
    celular: { area: /^\d{2,3}$/, num: /^\d{7,8}$/ },
    fijo: { area: /^\d{2,4}$/, num: /^\d{6,8}$/ }
  };

  const rule = rules[phone.tipo];
  if (rule) {
    if (!rule.area.test(phone.codigoArea)) errors.push("Código de área inválido");
    if (!rule.num.test(phone.numero)) errors.push("Número inválido");
  }

  return { isValid: errors.length === 0, errors };
}

export const PHONE_TYPES = [
  { value: 'fijo', label: 'Teléfono Fijo' },
  { value: 'celular', label: 'Teléfono Celular' },
  { value: 'gratuito', label: 'Línea Gratuita (0800/0810/0300)' },
  { value: 'whatsapp', label: 'Teléfono WhatsApp' },
  { value: 'fax', label: 'Fax' }
];

// Aliases para compatibilidad
export const normalizeOldPhoneFormat = normalizePhoneWithPrefixes;
export const normalizePhoneWithLocation = normalizePhoneWithPrefixes;

// ============================================================================
// FUNCIONES DE PRUEBA COMPLETAS
// ============================================================================

/**
 * Función de prueba COMPLETA para validar TODOS los casos argentinos
 * @returns {void}
 */
export function testAllArgentineCases() {
  const allTestCases = [
    // Casos básicos originales
    { input: "02357420437 , 2355525847", expected: "(2357) 420-437, (2355) 525-847" },
    { input: "3835 15523028", expected: "(3835) 523-028" },
    { input: "2346434583,84", expected: "(2346) 434-583, (2346) 434-584" },
    { input: "11 65673584", expected: "11 6567-3584" },

    // Casos complejos adicionales
    { input: "011 44609032 9036", expected: "(011) 4460-9032, (011) 4460-9036" },
    { input: "1127773208,39840800 , 1168265802", expected: "11 2777-3208, 11 3984-0800, 11 6826-5802" },
    { input: "11 5365 9800", expected: "11 5365-9800" },
    { input: "2284442300", expected: "(2284) 442-300" },
    { input: "02364407303, 02364430101", expected: "(2364) 407-303, (2364) 430-101" },
    { input: "3329422852", expected: "(3329) 422-852" },

    // Casos especiales implementados
    { input: "0266 15 44329679", expected: "(266) 4432-9679" },
    { input: "0221 4219296, 4259296,4257404", expected: "(0221) 421-9296, (0221) 425-9296, (0221) 425-7404" },
    { input: "111544496593", expected: "11 4449-6593" },
    { input: "011 42294646, 1122610506 WSP , 011 42294600", expected: "(011) 4229-4646, WhatsApp: 11 2261-0506, (011) 4229-4600" },
    { input: "034 89463200", expected: "(034) 8946-3200" },
    { input: "3484432636", expected: "(3484) 432-636" },
    { input: "1137301900 ,11 63998356", expected: "11 3730-1900, 11 6399-8356" },
    { input: "011 1569935570 , 02320536459", expected: "11 6993-5570, (02320) 536-459" },
    { input: "08108881122 , 02374620062", expected: "0810-888-1122, (02374) 620-062" },
    { input: "(011)58721804", expected: "(011) 5872-1804" },
    { input: "0810 122 2424 , 11 22836909", expected: "0810-122-2424, 11 2283-6909" },
    { input: "1150879200 , 11 65673584", expected: "11 5087-9200, 11 6567-3584" },
    { input: "02296452099, 02296452143 ,02296453973", expected: "(02296) 452-099, (02296) 452-143, (02296) 453-973" },
    { input: "0291 4522610", expected: "(0291) 452-2610" },
    { input: "46459000, 0810 999 9700", expected: "11 4645-9000, 0810-999-9700" },
    { input: "0291 4502799 ,0291 4516531", expected: "(0291) 450-2799, (0291) 451-6531" },
    { input: "12 1569935570 , 02320536459", expected: "11 6993-5570, (02320) 536-459" }
  ];

  console.log("=== PRUEBA COMPLETA DE TODOS LOS CASOS ARGENTINOS ===\n");

  let correctCount = 0;
  let totalCount = allTestCases.length;

  allTestCases.forEach((testCase, index) => {
    console.log(`Caso ${index + 1}/${totalCount}: "${testCase.input}"`);
    console.log(`Esperado: ${testCase.expected}`);

    try {
      const normalized = normalizePhoneWithPrefixes(testCase.input);
      const formatted = formatPhonesForDisplay(normalized);

      const isCorrect = formatted === testCase.expected;
      console.log(`Resultado: ${formatted}`);
      console.log(`${isCorrect ? '✅ CORRECTO' : '❌ DIFERENTE'}`);

      if (!isCorrect) {
        console.log(`JSON: ${normalized}`);
      }

      if (isCorrect) correctCount++;

    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }

    console.log('');
  });

  console.log("=== RESUMEN FINAL ===");
  console.log(`✅ Casos correctos: ${correctCount}/${totalCount}`);
  console.log(`❌ Casos incorrectos: ${totalCount - correctCount}/${totalCount}`);
  console.log(`📈 Precisión: ${Math.round((correctCount/totalCount)*100)}%`);

  if (correctCount === totalCount) {
    console.log("🎉 ¡TODOS LOS CASOS FUNCIONAN CORRECTAMENTE!");
  } else {
    console.log(`⚠️ Quedan ${totalCount - correctCount} casos por ajustar`);
  }
}

/**
 * Función de prueba para casos específicos problemáticos
 * @returns {void}
 */
export function testProblematicCases() {
  const problematicCases = [
    {
      input: "0221 4219296, 4259296,4257404",
      description: "Números locales con mismo código",
      expected: "(0221) 421-9296, (0221) 425-9296, (0221) 425-7404"
    },
    {
      input: "011 1569935570",
      description: "Número con '15' después del código",
      expected: "11 6993-5570"
    },
    {
      input: "0810 122 2424",
      description: "Línea gratuita con espacios",
      expected: "0810-122-2424"
    },
    {
      input: "(011)58721804",
      description: "Número con paréntesis sin espacios",
      expected: "(011) 5872-1804"
    },
    {
      input: "02296452099, 02296452143",
      description: "Códigos de área de 5 dígitos",
      expected: "(02296) 452-099, (02296) 452-143"
    }
  ];

  console.log("=== PRUEBA DE CASOS PROBLEMÁTICOS ===\n");

  problematicCases.forEach((testCase, index) => {
    console.log(`Caso problemático ${index + 1}: "${testCase.input}"`);
    console.log(`Descripción: ${testCase.description}`);
    console.log(`Esperado: ${testCase.expected}`);

    try {
      const normalized = normalizePhoneWithPrefixes(testCase.input);
      const formatted = formatPhonesForDisplay(normalized);

      console.log(`Resultado: ${formatted}`);
      console.log(`${formatted === testCase.expected ? '✅ CORRECTO' : '❌ NECESITA AJUSTE'}`);

      if (formatted !== testCase.expected) {
        console.log(`JSON: ${normalized}`);
      }

    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }

    console.log('');
  });
}

/**
 * Función de prueba específica para validar los casos especiales argentinos implementados
 * @returns {void}
 */
export function testSpecialArgentineCases() {
  const specialCases = [
    {
      input: "111544496593",
      expected: "11 4449-6593",
      description: "Número largo con '15' embebido"
    },
    {
      input: "0266 15 44329679",
      expected: "(266) 4432-9679",
      description: "Patrón histórico celular del interior"
    },
    {
      input: "1127773208,39840800 , 1168265802",
      expected: "11 2777-3208, 11 3984-0800, 11 6826-5802",
      description: "Números independientes mixtos"
    },
    {
      input: "011 44609032 9036",
      expected: "(011) 4460-9032, (011) 4460-9036",
      description: "Buenos Aires fijo con abreviación"
    },
    {
      input: "08108881122 , 02374620062",
      expected: "0810-888-1122, (02374) 620-062",
      description: "Línea gratuita y fijo con código largo"
    },
    {
      input: "011 42294646, 1122610506 WSP , 011 42294600",
      expected: "(011) 4229-4646, WhatsApp: 11 2261-0506, (011) 4229-4600",
      description: "Múltiples con WhatsApp"
    }
  ];

  console.log("=== PRUEBAS DE CASOS ESPECIALES ARGENTINOS ===\n");

  specialCases.forEach((testCase, index) => {
    console.log(`Caso ${index + 1}: "${testCase.input}"`);
    console.log(`Descripción: ${testCase.description}`);
    console.log(`Esperado: ${testCase.expected}`);

    try {
      const normalized = normalizePhoneWithPrefixes(testCase.input);
      const formatted = formatPhonesForDisplay(normalized);

      console.log(`Resultado: ${formatted}`);
      console.log(`JSON: ${normalized}`);
      console.log(`✓ ${formatted === testCase.expected ? 'CORRECTO' : 'DIFERENTE'}\n`);

    } catch (error) {
      console.log(`✗ ERROR: ${error.message}\n`);
    }
  });

  // Casos adicionales de validación
  const additionalCases = [
    "2284442300",
    "02364407303, 02364430101",
    "3329422852",
    "0221 4219296, 4259296,4257404",
    "034 89463200",
    "3484432636"
  ];

  console.log("=== CASOS ADICIONALES DE VALIDACIÓN ===\n");

  additionalCases.forEach((testCase, index) => {
    console.log(`Caso adicional ${index + 1}: "${testCase}"`);

    try {
      const normalized = normalizePhoneWithPrefixes(testCase);
      const formatted = formatPhonesForDisplay(normalized);

      console.log(`Resultado: ${formatted}`);
      console.log(`JSON: ${normalized}`);
      console.log('');

    } catch (error) {
      console.log(`✗ ERROR: ${error.message}\n`);
    }
  });
}