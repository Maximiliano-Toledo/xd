// libs/phone-formatter/index.js
/**
 * Phone Formatter Library
 * Utilidades para formateo y normalización de teléfonos argentinos (Backend - Versión Completa)
 * Maneja todos los patrones telefónicos argentinos incluyendo casos especiales y edge cases
 */

// const { phoneNumbersData } = require('../../utils/phoneNumbersData');

class PhoneFormatter {
  constructor(phoneNumbersData) {
    this.phoneNumbersData = phoneNumbersData;
    // console.log(phoneNumbersData)
  }

  // ============================================================================
  // UTILIDADES BÁSICAS
  // ============================================================================

  cleanPhone(phone) {
    return phone?.replace(/\D/g, '') || '';
  }

  extractExtension(text) {
    return text?.match(/int:?\s*(\d+)/i)?.[1] || null;
  }

  extractLabel(text) {
    const match = text?.match(/^(WSP|TEL|CEL|FAX|WHATSAPP|TELEFONO|CELULAR)[\s:]+/i);
    return match?.[1]?.toUpperCase() || null;
  }

  // ============================================================================
  // BÚSQUEDA EN BASE DE DATOS DE CÓDIGOS
  // ============================================================================

  /**
   * Busca un código de área en la base de datos por provincia y localidad
   * @param {string} provincia - Nombre de la provincia
   * @param {string} localidad - Nombre de la localidad
   * @returns {string|null} - Código de área encontrado
   */
  findAreaCodeByLocation(provincia, localidad) {
    if (!provincia || !this.phoneNumbersData) return null;

    const normalizeText = (text) => text?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .trim() || '';

    const searchProv = normalizeText(provincia);
    const searchLoc = normalizeText(localidad);

    // Buscar coincidencia exacta
    const match = this.phoneNumbersData.find(item => {
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
  isValidAreaCode(code) {
    if (!this.phoneNumbersData || !code) return false;

    const normalizedCode = code.startsWith('0') ? code.substring(1) : code;
    return this.phoneNumbersData.some(item =>
      item.codigo === normalizedCode ||
      item.codigo === '0' + normalizedCode
    );
  }

  /**
   * Obtiene todos los códigos de área posibles desde la base de datos
   * @returns {Array} - Array de códigos sin el 0 inicial
   */
  getAllAreaCodes() {
    if (this.phoneNumbersData && Array.isArray(this.phoneNumbersData)) {
      return [...new Set(this.phoneNumbersData.map(item =>
        item.codigo.startsWith('0') ? item.codigo.substring(1) : item.codigo
      ))].sort((a, b) => b.length - a.length);
    }

    // Fallback a códigos básicos si no hay data
    const BASIC_AREA_CODES = [
      '11', '220', '221', '223', '224', '225', '226', '227', '228', '229',
      '237', '249', '260', '261', '263', '264', '265', '266', '280', '291', '299',
      '341', '342', '343', '351', '353', '354', '358', '362', '364', '370', '376', '379',
      '380', '381', '382', '383', '385', '387', '388'
    ];
    return BASIC_AREA_CODES.sort((a, b) => b.length - a.length);
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
  detectPhoneType(areaCode, number) {
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
   * Detecta código de área en un número completo con manejo mejorado de casos argentinos
   * REGLA 1: Líneas gratuitas (0800/0810/0300) tienen PRIORIDAD sobre regla de "0 = fijo"
   * REGLA 2: Si el número comienza con "0" y NO es gratuito = TELÉFONO FIJO
   * @param {string} number - Número limpio
   * @param {string} provincia - Provincia para validación (opcional)
   * @param {string} localidad - Localidad para validación (opcional)
   * @returns {Object|null} - {areaCode, number, tipo} o null
   */
  detectAreaCodeInNumber(number, provincia = null, localidad = null) {
    const clean = this.cleanPhone(number);

    // Casos especiales: números muy cortos (incompletos)
    if (clean.length < 6) {
      return {
        areaCode: '',
        number: clean,
        tipo: 'fijo',
        isIncomplete: true
      };
    }

    // PRIORIDAD 1: Casos especiales: líneas gratuitas (ANTES de la regla del 0)
    if (clean.match(/^0?(800|810|300)/)) {
      const areaCode = clean.match(/^0?(800|810|300)/)[1];
      const remainingNumber = clean.replace(/^0?(800|810|300)/, '');
      return {
        areaCode: '0' + areaCode,
        number: remainingNumber,
        tipo: 'gratuito' // LÍNEA GRATUITA tiene prioridad
      };
    }

    // CASO ESPECIAL: Números que empiezan con 15 seguido de código (15XXXXXXXXX)
    if (clean.startsWith('15') && clean.length >= 10) {
      const withoutPrefix = clean.substring(2);

      // Intentar detectar código de área en el resto
      const allCodes = this.getAllAreaCodes();
      for (const code of allCodes) {
        if (withoutPrefix.startsWith(code)) {
          const remainingNumber = withoutPrefix.substring(code.length);
          if (remainingNumber.length >= 6 && remainingNumber.length <= 8) {
            return {
              areaCode: code,
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
      const longNumberResult = this.processLongNumberWith15(clean, provincia, localidad);
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

    // REGLA 2: Para números que empiezan con 0 (formato completo con código)
    // IMPORTANTE: Solo aplicar "fijo" si NO es línea gratuita (ya verificada arriba)
    if (clean.startsWith('0')) {
      const allCodes = this.getAllAreaCodes();

      // Probar códigos ordenados por longitud (más largos primero)
      for (const code of allCodes) {
        const fullCode = '0' + code;
        if (clean.startsWith(fullCode)) {
          const remainingNumber = clean.substring(fullCode.length);
          if (remainingNumber.length >= 6 && remainingNumber.length <= 10) {
            return {
              areaCode: code, // Devolver sin el 0
              number: remainingNumber,
              tipo: 'fijo' // FIJO porque empieza con 0 y no es gratuito
            };
          }
        }
      }

      // Si no se encontró coincidencia exacta, usar heurística por longitud
      if (clean.length >= 10) {
        let areaCodeLength = 3; // Por defecto 3 dígitos después del 0
        if (clean.length === 11) areaCodeLength = 3; // 0XXX XXXXXXX
        if (clean.length === 12) areaCodeLength = 4; // 0XXXX XXXXXXX

        const detectedCode = clean.substring(1, areaCodeLength + 1); // Sin el 0 inicial
        const remainingNumber = clean.substring(areaCodeLength + 1);

        return {
          areaCode: detectedCode,
          number: remainingNumber,
          tipo: 'fijo' // FIJO porque empieza con 0 y no es gratuito
        };
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

    // LÓGICA PRINCIPAL: Para números sin 0 inicial - usar base de datos de códigos
    const allCodes = this.getAllAreaCodes();
    for (const code of allCodes) {
      if (clean.startsWith(code)) {
        const remainingNumber = clean.substring(code.length);
        if (remainingNumber.length >= 6 && remainingNumber.length <= 8) {
          return {
            areaCode: code,
            number: remainingNumber,
            tipo: this.detectPhoneType(code, remainingNumber)
          };
        }
      }
    }

    // Si no se pudo detectar y es un número corto, marcarlo como incompleto
    if (clean.length < 8) {
      return {
        areaCode: '',
        number: clean,
        tipo: 'fijo',
        isIncomplete: true
      };
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
  processLongNumberWith15(clean, provincia = null, localidad = null) {
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
    const allCodes = this.getAllAreaCodes();

    for (const code of allCodes) {
      if (clean.startsWith(code + '15')) {
        const finalNumber = clean.substring(code.length + 2); // +2 para remover "15"

        // Verificar que el número restante tenga sentido (6-8 dígitos)
        if (finalNumber.length >= 6 && finalNumber.length <= 8) {
          return {
            areaCode: code,
            number: finalNumber,
            tipo: 'celular'
          };
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
  processHistoricalCellularPattern(phoneText) {
    const clean = phoneText.trim();
    const parts = clean.split(/\s+/).filter(p => p && /\d/.test(p));

    // Patrón: código + "15" + número
    if (parts.length === 3) {
      const [codePart, prefix, numberPart] = parts.map(p => this.cleanPhone(p));

      if (prefix === '15') {
        const areaCode = codePart.startsWith('0') && codePart.length > 1
          ? codePart.substring(1)
          : codePart;

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
   * Procesa números con formato especial que incluyen puntos, comas Y números separados por espacios
   * ACTUALIZADO: Respeta la prioridad de líneas gratuitas
   * @param {string} phoneText - Texto con números especiales
   * @returns {Array} - Array de objetos de teléfono
   */
  processComplexNumberPattern(phoneText) {
    const results = [];
    const clean = phoneText.trim();

    // NUEVO: Patrón para números separados por espacios que empiezan con 0
    // Ejemplo: "03466494314 03404483210" O "08005556722 08108883226"
    const spacePattern = /0\d{9,11}/g;
    const spaceMatches = clean.match(spacePattern);

    if (spaceMatches && spaceMatches.length > 1) {
      // Encontramos múltiples números que empiezan con 0
      spaceMatches.forEach(numberStr => {
        const detection = this.detectAreaCodeInNumber(numberStr);
        if (detection) {
          results.push({
            areaCode: detection.areaCode,
            number: detection.number,
            tipo: detection.tipo // Usar el tipo detectado (puede ser 'gratuito' o 'fijo')
          });
        }
      });

      if (results.length > 0) {
        return results;
      }
    }

    // Patrón original para números con puntos y comas como "0114951.5842,7318"
    const complexPattern = /0?(\d{2,4})(\d{4})\.(\d{4}),(\d{4})/g;
    let match;

    while ((match = complexPattern.exec(phoneText)) !== null) {
      const [fullMatch, areaCode, baseNumber, firstExtension, secondExtension] = match;

      // Verificar si es línea gratuita antes de asumir fijo
      const isGratuito = fullMatch.match(/^0?(800|810|300)/);
      const startsWith0 = fullMatch.startsWith('0');

      // Normalizar código de área
      const normalizedAreaCode = areaCode;

      // Crear números completos
      const firstNumber = baseNumber + firstExtension;
      const secondNumber = baseNumber + secondExtension;

      // Determinar tipo correctamente
      let tipoDetectado;
      if (isGratuito) {
        tipoDetectado = 'gratuito';
      } else if (startsWith0) {
        tipoDetectado = 'fijo';
      } else {
        tipoDetectado = this.detectPhoneType(normalizedAreaCode, firstNumber);
      }

      results.push({
        areaCode: normalizedAreaCode,
        number: firstNumber,
        tipo: tipoDetectado
      });

      results.push({
        areaCode: normalizedAreaCode,
        number: secondNumber,
        tipo: tipoDetectado
      });
    }

    // Si encontró el patrón de puntos/comas, devolver esos resultados
    if (results.length > 0) {
      return results;
    }

    // Patrón para múltiples elementos separados por espacios
    const parts = clean.split(/\s+/).filter(p => p && /\d/.test(p));

    // CASO ESPECIAL: Si hay múltiples partes y cada una empieza con 0
    if (parts.length >= 2) {
      const allStartWithZero = parts.every(part => part.startsWith('0') && part.length >= 10);

      if (allStartWithZero) {
        // Cada parte es un número completo con código de área
        parts.forEach(part => {
          const detection = this.detectAreaCodeInNumber(part);
          if (detection) {
            results.push({
              areaCode: detection.areaCode,
              number: detection.number,
              tipo: detection.tipo // Usar el tipo detectado (gratuito, fijo, etc.)
            });
          }
        });

        if (results.length > 0) {
          return results;
        }
      }
    }

    // Patrón: código + número1 + número2 + número3... (para espacios múltiples)
    if (parts.length >= 3) {
      const [code, ...numbers] = parts.map(p => this.cleanPhone(p));

      if (code.length <= 5) {
        // Determinar tipo basado en detección, no solo en si tiene 0
        const firstPart = parts[0];
        const sampleDetection = this.detectAreaCodeInNumber(firstPart + (numbers[0] || ''));
        const detectedType = sampleDetection ? sampleDetection.tipo : 'fijo';

        const areaCode = code.startsWith('0') ? code.substring(1) : code;

        // Primer número completo
        if (numbers[0] && numbers[0].length >= 6) {
          results.push({
            areaCode,
            number: numbers[0],
            tipo: detectedType
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
              tipo: detectedType
            });
          }
        }
      }
    }

    return results.length > 0 ? results : null;
  }

  /**
   * Procesa múltiples números que pueden no estar relacionados o ser números locales
   * @param {Array} parts - Partes del teléfono
   * @param {string} provincia - Provincia para contexto
   * @param {string} localidad - Localidad para contexto
   * @returns {Array} - Array de resultados procesados
   */
  processIndependentNumbers(parts, provincia = null, localidad = null) {
    const results = [];
    let detectedAreaCode = null;

    parts.forEach((part, index) => {
      const cleanPart = this.cleanPhone(part);

      // CASO ESPECIAL: detectar si es un número con espacio que incluye código de área
      // Ejemplo: "0221 4219296" -> código "0221" + número "4219296"
      if (part.includes(' ') && index === 0) {
        const spaceParts = part.trim().split(/\s+/);
        if (spaceParts.length === 2) {
          const [codePart, numberPart] = spaceParts.map(p => this.cleanPhone(p));

          // Si el primer parte parece un código de área (3-4 dígitos) y el segundo un número (6-8 dígitos)
          if (codePart.length >= 3 && codePart.length <= 5 && numberPart.length >= 6 && numberPart.length <= 8) {
            const areaCode = codePart.startsWith('0') && codePart.length > 1
              ? codePart.substring(1)
              : codePart;

            results.push({
              areaCode,
              number: numberPart,
              tipo: this.detectPhoneType(areaCode, numberPart)
            });

            detectedAreaCode = areaCode;
            return;
          }
        }
      }

      // Intentar detección normal
      const detection = this.detectAreaCodeInNumber(cleanPart, provincia, localidad);

      if (detection) {
        results.push(detection);

        // Guardar el primer código de área detectado para números posteriores
        if (index === 0 && !detection.isIncomplete) {
          detectedAreaCode = detection.areaCode;
        }
      } else {
        // CASO ESPECIAL: números locales sin código
        // Ej: "0221 4219296, 4259296, 4257404" -> el segundo y tercero usan el código del primero
        if (detectedAreaCode && cleanPart.length >= 6 && cleanPart.length <= 8) {
          results.push({
            areaCode: detectedAreaCode,
            number: cleanPart,
            tipo: this.detectPhoneType(detectedAreaCode, cleanPart),
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
        // Números muy cortos - marcar como incompletos
        else if (cleanPart.length < 6) {
          results.push({
            areaCode: '',
            number: cleanPart,
            tipo: 'fijo',
            isIncomplete: true
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
  validateAndAdjustPhone(phoneResult) {
    if (!phoneResult) return null;

    const { areaCode, number, tipo } = phoneResult;

    // No ajustar números incompletos
    if (phoneResult.isIncomplete) {
      return phoneResult;
    }

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
  processComplexArgentinePattern(phoneText) {
    const clean = phoneText.trim();

    // Primero verificar patrón complejo con puntos y comas
    const complexNumbers = this.processComplexNumberPattern(clean);
    if (complexNumbers && complexNumbers.length > 0) {
      return complexNumbers;
    }

    const parts = clean.split(/\s+/).filter(p => p && /\d/.test(p));

    // Patrón: código + número1 + número2 + número3... (para espacios múltiples)
    if (parts.length >= 3) {
      const [code, ...numbers] = parts.map(p => this.cleanPhone(p));

      if (code.length <= 5) {
        const areaCode = code.startsWith('0') && code.length > 1 ? code.substring(1) : code;
        const results = [];

        // Primer número completo
        if (numbers[0] && numbers[0].length >= 6) {
          results.push({
            areaCode,
            number: numbers[0],
            tipo: this.detectPhoneType(areaCode, numbers[0])
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
              tipo: this.detectPhoneType(areaCode, fullNumber)
            });
          }
        }

        return results.length > 0 ? results : null;
      }
    }

    if (parts.length === 2) {
      const [firstPart, secondPart] = parts.map(p => this.cleanPhone(p));

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
      if (firstPart.length <= 5 && secondPart.length >= 6) {
        const areaCode = firstPart.startsWith('0') && firstPart.length > 1
          ? firstPart.substring(1)
          : firstPart;

        return [{
          areaCode,
          number: secondPart,
          tipo: this.detectPhoneType(areaCode, secondPart)
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
  processAbbreviatedNumbers(fullNumber, shortDigits) {
    const fullClean = this.cleanPhone(fullNumber);
    const shortClean = this.cleanPhone(shortDigits);

    const detection = this.detectAreaCodeInNumber(fullClean);

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
   * ACTUALIZADO: Mejor manejo de números separados por espacios
   * @param {string} phoneText - Texto del teléfono
   * @param {string} provincia - Provincia para contexto (opcional)
   * @param {string} localidad - Localidad para contexto (opcional)
   * @returns {Array} - Array de objetos de teléfono
   */
  detectSpecialPatterns(phoneText, provincia = null, localidad = null) {
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
      const historicalPattern = this.processHistoricalCellularPattern(mainPart);
      if (historicalPattern) {
        const validated = this.validateAndAdjustPhone(historicalPattern);
        if (validated) {
          results.push(validated);
        }
      } else {
        // CASO ESPECIAL 2: Líneas gratuitas con espacios (0810 122 2424)
        const gratuitousPattern = mainPart.match(/^(0?800|0?810|0?300)\s+(.+)/);
        if (gratuitousPattern) {
          const [, code, numberPart] = gratuitousPattern;
          const cleanCode = '0' + code.replace(/^0/, '');
          const cleanNumber = this.cleanPhone(numberPart);

          results.push(this.validateAndAdjustPhone({
            areaCode: cleanCode,
            number: cleanNumber,
            tipo: 'gratuito'
          }));
        } else {
          // CASE ESPECIAL 3: Patrón complejo ACTUALIZADO
          const complexPattern = this.processComplexArgentinePattern(mainPart);
          if (complexPattern) {
            complexPattern.forEach(pattern => {
              const validated = this.validateAndAdjustPhone(pattern);
              if (validated) results.push(validated);
            });
          } else {
            // Patrón de múltiples números separados por comas
            const parts = mainPart.split(/[,;]+/).map(p => p.trim()).filter(p => p);

            // CASO ESPECIAL 4: Verificar si son números independientes o locales
            const processedNumbers = this.processIndependentNumbers(parts, provincia, localidad);

            if (processedNumbers.length > 0) {
              processedNumbers.forEach(num => {
                const validated = this.validateAndAdjustPhone(num);
                if (validated) results.push(validated);
              });
            } else {
              // Procesamiento normal para otros casos
              let mainAreaCode = null;
              const firstPart = parts[0];
              if (firstPart) {
                const firstDetection = this.detectAreaCodeInNumber(this.cleanPhone(firstPart), provincia, localidad);
                if (firstDetection && !firstDetection.isIncomplete) {
                  mainAreaCode = firstDetection.areaCode;
                }
              }

              // Procesar cada parte
              parts.forEach(part => {
                // CASO ESPECIAL: Patrón abreviado (número,dígitos cortos)
                const abbreviatedMatch = part.match(/^(\d{8,11}),(\d{1,4})$/);
                if (abbreviatedMatch) {
                  const [, full, short] = abbreviatedMatch;
                  const abbreviated = this.processAbbreviatedNumbers(full, short);
                  abbreviated.forEach(a => {
                    if (a.areaCode) {
                      const validated = this.validateAndAdjustPhone(a);
                      if (validated) results.push(validated);
                    }
                  });
                  return;
                }

                // Detección normal
                const detection = this.detectAreaCodeInNumber(this.cleanPhone(part), provincia, localidad);
                if (detection) {
                  const validated = this.validateAndAdjustPhone(detection);
                  if (validated) results.push(validated);
                } else if (mainAreaCode) {
                  // Si no se detecta código pero hay uno principal, usarlo
                  const cleanPart = this.cleanPhone(part);
                  if (cleanPart.length >= 6 && cleanPart.length <= 8) {
                    const phoneObj = {
                      areaCode: mainAreaCode,
                      number: cleanPart,
                      tipo: this.detectPhoneType(mainAreaCode, cleanPart),
                      isLocal: true
                    };
                    const validated = this.validateAndAdjustPhone(phoneObj);
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
        const detection = this.detectAreaCodeInNumber(this.cleanPhone(num), provincia, localidad);
        if (detection) {
          const validated = this.validateAndAdjustPhone(detection);
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
   * Función principal de normalización mejorada
   * @param {string} phoneText - Texto con teléfonos
   * @param {string} provincia - Provincia para contexto (opcional)
   * @param {string} localidad - Localidad para contexto (opcional)
   * @returns {string} - JSON con array de teléfonos normalizados
   */
  normalizePhoneWithPrefixes(phoneText, provincia = null, localidad = null) {
    if (!phoneText) return JSON.stringify([]);

    try {
      const detectedPatterns = this.detectSpecialPatterns(phoneText, provincia, localidad);

      const phones = detectedPatterns.map((pattern, index) => ({
        tipo: pattern.tipo || 'fijo',
        codigoArea: pattern.areaCode || '',
        numero: pattern.number || '',
        extension: this.extractExtension(phoneText),
        descripcion: pattern.isWhatsApp ? 'WhatsApp' :
          pattern.isIncomplete ? 'Incompleto' :
            index === 0 ? 'Principal' : `Teléfono ${index + 1}`
      })).filter(phone => phone.numero);

      return JSON.stringify(phones);
    } catch (error) {
      console.warn('Error en normalizePhoneWithPrefixes:', error);
      // Fallback al método original si hay error
      return this.normalizeOldPhoneFormat(phoneText);
    }
  }

  /**
   * Normaliza un formato antiguo de teléfono al formato JSON (fallback mejorado)
   */
  normalizeOldPhoneFormat(phone, index = 0) {
    const cleanNumber = this.cleanPhone(phone);

    if (!cleanNumber || cleanNumber.length < 6) {
      return JSON.stringify([{
        tipo: "fijo",
        codigoArea: "",
        numero: cleanNumber,
        extension: this.extractExtension(phone),
        descripcion: "Incompleto"
      }]);
    }

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
      const allCodes = this.getAllAreaCodes();

      // Intentar identificar el código de área usando la base de datos
      for (const code of allCodes) {
        const fullCode = '0' + code;
        if (cleanNumber.startsWith(fullCode)) {
          const remainingNumber = cleanNumber.substring(fullCode.length);
          if (remainingNumber.length >= 6 && remainingNumber.length <= 8) {
            codigoArea = fullCode;
            numero = remainingNumber;
            tipo = this.detectPhoneType(code, remainingNumber);
            break;
          }
        }
      }

      // Si no se encontró, usar heurística
      if (!codigoArea) {
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
      const allCodes = this.getAllAreaCodes();

      // Buscar código que coincida
      for (const code of allCodes) {
        if (cleanNumber.startsWith(code)) {
          const remainingNumber = cleanNumber.substring(code.length);
          if (remainingNumber.length >= 6 && remainingNumber.length <= 8) {
            codigoArea = code;
            numero = remainingNumber;
            tipo = this.detectPhoneType(code, remainingNumber);
            break;
          }
        }
      }

      // Si no se encontró, usar heurística por longitud
      if (!codigoArea) {
        if (cleanNumber.startsWith('11')) {
          codigoArea = '11';
          numero = cleanNumber.substring(2);
          tipo = numero.length === 8 ? "celular" : "fijo";
        } else {
          // Por defecto, asumir código de 2 dígitos
          codigoArea = cleanNumber.substring(0, 2);
          numero = cleanNumber.substring(2);
        }
      }
    }
    // Números más cortos
    else if (cleanNumber.length >= 6) {
      const allCodes = this.getAllAreaCodes();

      // Intentar detectar código de área
      for (const code of allCodes) {
        if (cleanNumber.startsWith(code)) {
          const remainingNumber = cleanNumber.substring(code.length);
          if (remainingNumber.length >= 4 && remainingNumber.length <= 8) {
            codigoArea = code;
            numero = remainingNumber;
            tipo = this.detectPhoneType(code, remainingNumber);
            break;
          }
        }
      }

      // Si no se encontró, usar heurística
      if (!codigoArea) {
        if (cleanNumber.length === 8) {
          // Número local sin código de área - asumir Buenos Aires
          codigoArea = '11';
          numero = cleanNumber;
          tipo = cleanNumber.startsWith('4') ? 'fijo' : 'celular';
        } else {
          // Asumir código de 2-3 dígitos basado en la longitud
          const codeLength = cleanNumber.length === 9 ? 2 : 3;
          codigoArea = cleanNumber.substring(0, codeLength);
          numero = cleanNumber.substring(codeLength);
        }
      }
    }

    const phoneObj = {
      tipo,
      codigoArea,
      numero,
      extension: this.extractExtension(phone),
      descripcion: index === 0 ? "Principal" : `Teléfono ${index + 1}`
    };

    return JSON.stringify([phoneObj]);
  }

  // ============================================================================
  // FORMATEO PARA VISUALIZACIÓN
  // ============================================================================

  /**
   * Formatea un teléfono individual para mostrar con manejo de casos especiales
   * @param {Object} phone - Objeto de teléfono
   * @returns {string} - Teléfono formateado
   */
  formatPhoneForDisplay(phone) {
    if (!phone) return '';

    const { tipo, codigoArea, numero, extension, descripcion, displayAreaCode, assumedBA, adjusted, isLocal, isIncomplete } = phone;

    // Si está incompleto, mostrar tal como está
    if (isIncomplete) {
      return numero || '';
    }

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
            // Formateo inteligente según longitud del número
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

            // Si se asumió Buenos Aires, usar formato celular
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
          // Para números locales, mostrar el código con 0 inicial
          const displayCode = isLocal ?
            (effectiveAreaCode.startsWith('0') ? effectiveAreaCode : '0' + effectiveAreaCode) :
            (effectiveAreaCode.startsWith('0') ? effectiveAreaCode :
              (effectiveAreaCode.length <= 3 ? '0' + effectiveAreaCode : effectiveAreaCode));

          if (numero.length >= 6) {
            // Formateo más inteligente para números locales y códigos específicos
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

    // Agregar prefijo de descripción si es WhatsApp (por descripción, no por tipo)
    if (descripcion && descripcion.toLowerCase().includes('whatsapp')) {
      formatted = `WhatsApp: ${formatted}`;
    }

    return formatted;
  }

  /**
   * Formatea múltiples teléfonos para mostrar
   * @param {string|Array} phones - JSON string o array de teléfonos
   * @returns {string} - Teléfonos formateados separados por coma
   */
  formatPhonesForDisplay(phones) {
    if (!phones) return 'No disponible';

    try {
      const parsed = typeof phones === 'string' ? JSON.parse(phones) : phones;

      if (Array.isArray(parsed)) {
        return parsed.map(phone => this.formatPhoneForDisplay(phone)).join(' | ');
      }

      return phones.toString();
    } catch (e) {
      return phones.toString();
    }
  }

  /**
   * Versión simplificada para mostrar solo el primer teléfono (útil para tablas compactas)
   * @param {string} phones - JSON de teléfonos o string con formato antiguo
   * @returns {string} - Primer teléfono formateado
   */
  formatFirstPhoneForDisplay(phones) {
    if (!phones) return 'No disponible';

    try {
      const parsed = typeof phones === 'string' ? JSON.parse(phones) : phones;

      if (Array.isArray(parsed) && parsed.length > 0) {
        const firstPhone = this.formatPhoneForDisplay(parsed[0]);
        const additionalCount = parsed.length - 1;

        if (additionalCount > 0) {
          return `${firstPhone} (+${additionalCount} más)`;
        }
        return firstPhone;
      }

      return phones || 'No disponible';
    } catch (e) {
      // Formato antiguo - tomar solo el primer número
      if (typeof phones === 'string' && phones.trim()) {
        const firstPhone = phones.split(/[,;\/]+/)[0].trim();
        return firstPhone || 'No disponible';
      }
      return 'No disponible';
    }
  }

  /**
   * Formatea teléfonos para visualización en PDF
   * @param {string} phoneValue - Valor de teléfono (puede ser JSON o formato antiguo)
   * @returns {string} - Teléfono formateado para PDF
   */
  formatPhoneForPDF(phoneValue) {
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
          // Si está incompleto, solo mostrar el número
          if (phone.descripcion === 'Incompleto') {
            return phone.numero || '';
          }

          // Determinar el prefijo según el tipo
          let tipo = '';
          if (phone.tipo === 'celular') {
            tipo = 'Cel:';
          } else if (phone.tipo === 'whatsapp') {
            tipo = 'WhatsApp:';
          } else if (phone.tipo === 'gratuito') {
            tipo = ''; // Las líneas gratuitas no llevan prefijo
          } else {
            tipo = 'Tel:'; // Fijo y otros tipos
          }

          // Formatear según tipo
          let numero = '';
          if (phone.tipo === 'gratuito' && phone.codigoArea && phone.codigoArea.startsWith('0')) {
            // Líneas gratuitas: 0800-123-4567
            const n = phone.numero || '';
            if (n.length >= 6) {
              numero = `${phone.codigoArea}-${n.slice(0,3)}-${n.slice(3)}`;
            } else {
              numero = `${phone.codigoArea}-${n}`;
            }
          } else {
            // Otros tipos: código área número
            const n = phone.numero || '';
            const area = phone.codigoArea || '';

            if (n && n.length > 4) {
              // Formatear como: 11 1234-5678
              numero = `${area} ${n.slice(0, n.length-4)}-${n.slice(-4)}`;
            } else if (n && n.length > 0) {
              // Para números más cortos
              numero = `${area} ${n}`;
            } else {
              numero = area;
            }
          }

          // Añadir extensión si existe
          if (phone.extension) {
            numero += ` int:${phone.extension}`;
          }

          // No agregar descripción adicional si ya está incluida en el prefijo
          let desc = '';
          if (phone.descripcion && !phone.descripcion.toLowerCase().includes('whatsapp') && phone.descripcion !== 'Principal' && phone.descripcion !== 'Incompleto') {
            desc = ` (${phone.descripcion})`;
          }

          return `${tipo} ${numero}${desc}`.trim();
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

  // ============================================================================
  // FUNCIONES DE COMPATIBILIDAD Y CONVERSIÓN
  // ============================================================================

  /**
   * Convierte un JSON de teléfonos al formato estructurado para CSV
   * @param {string} phoneJson - JSON de teléfonos o string con formato antiguo
   * @returns {string} - Formato estructurado para CSV
   */
  phoneJsonToCSVFormat(phoneJson) {
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
   * Convierte un formato CSV estructurado a JSON de teléfonos (MEJORADA)
   * @param {string} csvValue - Valor del CSV (puede ser formato estructurado o antiguo)
   * @returns {string} - JSON de teléfonos
   */
  csvFormatToPhoneJson(csvValue) {
    if (!csvValue || csvValue.trim() === '') return JSON.stringify([]);

    // Primero verificar si ya es JSON válido
    try {
      const parsed = JSON.parse(csvValue);
      if (Array.isArray(parsed)) {
        // Ya está en formato JSON correcto, devolverlo tal cual
        return csvValue;
      }
    } catch (e) {
      // No es JSON, continuar con el procesamiento
    }

    // Verificar si tiene el formato estructurado (mejorado)
    if (csvValue.includes('type:') && csvValue.includes('|')) {
      try {
        // Dividir por punto y coma para múltiples teléfonos
        const phoneStrings = csvValue.split(';').filter(str => str.trim());
        const phones = [];

        phoneStrings.forEach(phoneStr => {
          const parts = phoneStr.split('|');
          const phone = {};

          parts.forEach(part => {
            if (part.includes(':')) {
              const [key, value] = part.split(':', 2); // Limitar a 2 partes por si hay : en el valor
              const cleanValue = value?.trim();

              switch (key.trim()) {
                case 'type':
                  phone.tipo = cleanValue || 'fijo';
                  break;
                case 'area':
                  phone.codigoArea = cleanValue || '';
                  break;
                case 'num':
                  phone.numero = cleanValue || '';
                  break;
                case 'ext':
                  phone.extension = cleanValue || null;
                  break;
                case 'desc':
                  phone.descripcion = cleanValue || null;
                  break;
                default:
                  console.warn(`Campo desconocido en formato CSV: ${key}`);
              }
            }
          });

          // Solo agregar si tiene al menos número
          if (phone.numero) {
            phones.push(phone);
          }
        });

        if (phones.length > 0) {
          const result = JSON.stringify(phones);
          console.log(`✅ Conversión CSV estructurado exitosa: ${phones.length} teléfono(s)`);
          return result;
        }
      } catch (e) {
        console.warn('Error procesando formato CSV estructurado:', e);
      }
    }

    // Si no es formato estructurado, usar la función de normalización avanzada
    // console.log('📞 Formato no estructurado, aplicando normalización avanzada...');
    return this.normalizePhoneWithPrefixes(csvValue);
  }

  /**
   * Comprueba si un valor de teléfono está en formato JSON
   * @param {string} value - Valor a comprobar
   * @returns {boolean} - true si es formato JSON, false si es formato antiguo
   */
  isPhoneJsonFormat(value) {
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
  validatePhone(phone) {
    const errors = [];

    if (!phone.tipo) {
      errors.push("El tipo de teléfono es requerido");
    }

    // Si está marcado como incompleto, es válido pero con advertencia
    if (phone.descripcion === 'Incompleto') {
      return {
        isValid: true,
        errors: ['Número incompleto - requiere código de área'],
        isIncomplete: true
      };
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
  getPhoneTypes() {
    return [
      { value: 'fijo', label: 'Teléfono Fijo' },
      { value: 'celular', label: 'Celular' },
      { value: 'gratuito', label: 'Línea Gratuita (0800/0810/0300)' },
      { value: 'fax', label: 'Fax' },
      { value: 'otro', label: 'Otro' }
    ];
  }

  // ============================================================================
  // FUNCIONES DE COMPATIBILIDAD LEGACY
  // ============================================================================

  /**
   * Normaliza un formato antiguo de teléfono al formato JSON
   * @param {string} oldFormat - Formato antiguo (puede tener múltiples teléfonos separados por comas)
   * @returns {string} - JSON de teléfonos
   */
  normalizeOldPhoneFormat(oldFormat) {
    // Usar la función avanzada por defecto
    return this.normalizePhoneWithPrefixes(oldFormat);
  }

  // ============================================================================
  // FUNCIONES DE EXPORTACIÓN COMPATIBLES
  // ============================================================================

  /**
   * Exporta teléfonos a formato CSV
   */
  exportPhonesToCSV(phoneJson) {
    return this.phoneJsonToCSVFormat(phoneJson);
  }

  /**
   * Importa teléfonos desde formato CSV
   */
  importPhonesFromCSV(csvText) {
    return this.csvFormatToPhoneJson(csvText);
  }
}

// ============================================================================
// FUNCIONES ESTÁTICAS PARA COMPATIBILIDAD
// ============================================================================

// Funciones principales de normalización
const normalizePhoneWithPrefixes = (phoneText, provincia = null, localidad = null) => {
  const formatter = new PhoneFormatter();
  return formatter.normalizePhoneWithPrefixes(phoneText, provincia, localidad);
};

const normalizeOldPhoneFormat = (oldFormat) => {
  const formatter = new PhoneFormatter();
  return formatter.normalizeOldPhoneFormat(oldFormat);
};

// Funciones de conversión entre formatos
const phoneJsonToCSVFormat = (phoneJson) => {
  const formatter = new PhoneFormatter();
  return formatter.phoneJsonToCSVFormat(phoneJson);
};

const csvFormatToPhoneJson = (csvFormat) => {
  const formatter = new PhoneFormatter();
  return formatter.csvFormatToPhoneJson(csvFormat);
};

// Funciones de formateo para visualización
const formatPhoneForDisplay = (phone) => {
  const formatter = new PhoneFormatter();
  return formatter.formatPhoneForDisplay(phone);
};

const formatPhonesForDisplay = (phones) => {
  const formatter = new PhoneFormatter();
  return formatter.formatPhonesForDisplay(phones);
};

const formatFirstPhoneForDisplay = (phones) => {
  const formatter = new PhoneFormatter();
  return formatter.formatFirstPhoneForDisplay(phones);
};

const formatPhoneForPDF = (phoneValue) => {
  const formatter = new PhoneFormatter();
  return formatter.formatPhoneForPDF(phoneValue);
};

// Funciones de validación y utilidades
const isPhoneJsonFormat = (value) => {
  const formatter = new PhoneFormatter();
  return formatter.isPhoneJsonFormat(value);
};

const validatePhone = (phone) => {
  const formatter = new PhoneFormatter();
  return formatter.validatePhone(phone);
};

const PHONE_TYPES = [
  { value: 'fijo', label: 'Teléfono Fijo' },
  { value: 'celular', label: 'Celular' },
  { value: 'gratuito', label: 'Línea Gratuita (0800/0810/0300)' },
  { value: 'fax', label: 'Fax' },
  { value: 'otro', label: 'Otro' }
];

// Funciones auxiliares expuestas para casos avanzados
const findAreaCodeByLocation = (provincia, localidad) => {
  const formatter = new PhoneFormatter();
  return formatter.findAreaCodeByLocation(provincia, localidad);
};

const detectPhoneType = (areaCode, number) => {
  const formatter = new PhoneFormatter();
  return formatter.detectPhoneType(areaCode, number);
};

const extractExtension = (text) => {
  const formatter = new PhoneFormatter();
  return formatter.extractExtension(text);
};

const extractLabel = (text) => {
  const formatter = new PhoneFormatter();
  return formatter.extractLabel(text);
};

const detectAreaCodeInNumber = (number, provincia = null, localidad = null) => {
  const formatter = new PhoneFormatter();
  return formatter.detectAreaCodeInNumber(number, provincia, localidad);
};

const processLongNumberWith15 = (clean, provincia = null, localidad = null) => {
  const formatter = new PhoneFormatter();
  return formatter.processLongNumberWith15(clean, provincia, localidad);
};

const processHistoricalCellularPattern = (phoneText) => {
  const formatter = new PhoneFormatter();
  return formatter.processHistoricalCellularPattern(phoneText);
};

const processIndependentNumbers = (parts, provincia = null, localidad = null) => {
  const formatter = new PhoneFormatter();
  return formatter.processIndependentNumbers(parts, provincia, localidad);
};

const validateAndAdjustPhone = (phoneResult) => {
  const formatter = new PhoneFormatter();
  return formatter.validateAndAdjustPhone(phoneResult);
};

const processComplexArgentinePattern = (phoneText) => {
  const formatter = new PhoneFormatter();
  return formatter.processComplexArgentinePattern(phoneText);
};

const processAbbreviatedNumbers = (fullNumber, shortDigits) => {
  const formatter = new PhoneFormatter();
  return formatter.processAbbreviatedNumbers(fullNumber, shortDigits);
};

const detectSpecialPatterns = (phoneText, provincia = null, localidad = null) => {
  const formatter = new PhoneFormatter();
  return formatter.detectSpecialPatterns(phoneText, provincia, localidad);
};

const isValidAreaCode = (code) => {
  const formatter = new PhoneFormatter();
  return formatter.isValidAreaCode(code);
};

const cleanPhone = (phone) => {
  const formatter = new PhoneFormatter();
  return formatter.cleanPhone(phone);
};

const getAllAreaCodes = () => {
  const formatter = new PhoneFormatter();
  return formatter.getAllAreaCodes();
};

module.exports = {
  // Clase principal
  PhoneFormatter,

  // Funciones principales de normalización
  normalizePhoneWithPrefixes,
  normalizeOldPhoneFormat,

  // Funciones de conversión entre formatos
  phoneJsonToCSVFormat,
  csvFormatToPhoneJson,

  // Funciones de formateo para visualización
  formatPhoneForDisplay,
  formatPhonesForDisplay,
  formatFirstPhoneForDisplay,
  formatPhoneForPDF,

  // Funciones de validación y utilidades
  isPhoneJsonFormat,
  validatePhone,
  PHONE_TYPES,

  // Funciones auxiliares expuestas para casos avanzados
  findAreaCodeByLocation,
  detectPhoneType,
  extractExtension,
  extractLabel,
  detectAreaCodeInNumber,
  processLongNumberWith15,
  processHistoricalCellularPattern,
  processIndependentNumbers,
  validateAndAdjustPhone,
  processComplexArgentinePattern,
  processAbbreviatedNumbers,
  detectSpecialPatterns,
  isValidAreaCode,
  cleanPhone,
  getAllAreaCodes
};