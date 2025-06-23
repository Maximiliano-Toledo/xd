// libs/pdf-generator/index.js
/**
 * PDF Generator Library
 * Maneja la generación de PDFs de cartilla médica
 */

const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");

class PDFGenerator {
  constructor(pool, phoneFormatter) {
    this.pool = pool;
    this.phoneFormatter = phoneFormatter;
  }

  /**
   * Genera y descarga un PDF de la cartilla médica
   * @async
   * @param {number} id_plan - ID del plan
   * @param {number} id_provincia - ID de la provincia
   * @returns {Promise<Object>} - Objeto con bytes del PDF y nombre del archivo
   */
  async generateDocumentOutput(id_plan, id_provincia) {
    let connection;
    try {
      connection = await this.pool.getConnection();
      await connection.beginTransaction();

      console.log(`🎯 Generando PDF para plan ${id_plan} y provincia ${id_provincia}`);

      // 1. Obtener nombres de plan y provincia
      const [planResult] = await connection.query(
        "SELECT nombre FROM planes WHERE id_plan = ?",
        [id_plan]
      );
      const [provinciaResult] = await connection.query(
        "SELECT nombre FROM provincias WHERE id_provincia = ?",
        [id_provincia]
      );

      if (!planResult.length || !provinciaResult.length) {
        throw new Error("Plan o provincia no encontrados");
      }

      const planNombre = planResult[0].nombre;
      const provinciaNombre = provinciaResult[0].nombre;

      console.log(`📋 Generando PDF para: ${planNombre} - ${provinciaNombre}`);

      // 2. Obtener todos los prestadores (presenciales y virtuales)
      const [prestadoresResult] = await connection.query(
        "CALL getCartillaPDF(?, ?)",
        [planNombre, provinciaNombre]
      );

      if (!prestadoresResult[0].length) {
        throw new Error(
          "No se encontraron prestadores para la combinación especificada"
        );
      }

      // Separar prestadores presenciales y virtuales
      const prestadores = prestadoresResult[0].filter(p => p.tipo_atencion === 'Presencial');
      const prestadoresVirtuales = prestadoresResult[0].filter(p => p.tipo_atencion === 'Virtual');

      console.log(`👥 Prestadores encontrados: ${prestadores.length} presenciales, ${prestadoresVirtuales.length} virtuales`);

      // 3. Organizar prestadores presenciales por especialidad
      const prestadoresPorEspecialidad = prestadores.reduce(
        (acc, prestador) => {
          // Normalizar los teléfonos para cada prestador
          prestador = { ...prestador };

          // Procesar el campo de teléfonos si existe usando la librería
          if (prestador.telefonos) {
            prestador.telefonos = this._formatPhoneForPDF(prestador.telefonos);
          }

          if (!acc[prestador.especialidad]) {
            acc[prestador.especialidad] = [];
          }
          acc[prestador.especialidad].push(prestador);
          return acc;
        },
        {}
      );

      // Ordenar especialidades alfabéticamente
      const especialidadesOrdenadas = Object.keys(prestadoresPorEspecialidad).sort();

      // Ordenar prestadores por localidad dentro de cada especialidad
      for (const especialidad of especialidadesOrdenadas) {
        prestadoresPorEspecialidad[especialidad].sort((a, b) => {
          return a.localidad.localeCompare(b.localidad);
        });
      }

      // 4. Cargar la portada del PDF
      const portadaPath = path.join(
        __dirname, "..", "..", "templates", id_plan.toString(), `${id_provincia}.pdf`
      );

      const portadaExists = await fsPromises
        .access(portadaPath)
        .then(() => true)
        .catch(() => false);

      if (!portadaExists) {
        throw new Error(
          `No se encontró la portada para ${planNombre} - ${provinciaNombre}. ` +
          `Archivo esperado: ${portadaPath}`
        );
      }

      console.log(`📄 Cargando portada desde: ${portadaPath}`);

      const portadaBytes = await fsPromises.readFile(portadaPath);
      const pdfDoc = await PDFDocument.load(portadaBytes);

      // Registrar el plugin de fuentes
      pdfDoc.registerFontkit(fontkit);

      const font = await this._loadFont(pdfDoc);

      // 6. Obtener información temporal para pie de página
      const { currentMonth, currentYear } = this._getCurrentDateInfo();

      console.log(`📅 Fecha de vigencia: ${currentMonth} ${currentYear}`);

      // 7. Crear página de índice y contenido
      await this._createIndexAndContent(
        pdfDoc,
        font,
        especialidadesOrdenadas,
        prestadoresPorEspecialidad,
        prestadoresVirtuales,
        currentMonth,
        currentYear
      );

      // 8. Guardar el PDF final
      console.log(`💾 Guardando PDF...`);
      const pdfBytes = await pdfDoc.save();
      await connection.commit();

      const nombreArchivo = `${planNombre} - ${provinciaNombre}.pdf`;

      console.log(`✅ PDF generado exitosamente: ${nombreArchivo} (${(pdfBytes.length / 1024 / 1024).toFixed(2)} MB)`);

      // 9. Devolver el PDF y el nombre del archivo
      return {
        pdfBytes,
        nombreArchivo,
      };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error("❌ Error en downloadCartillaPDF:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Formatea teléfonos para PDF usando la librería de phone formatter
   * @private
   */
  _formatPhoneForPDF(phoneValue) {
    try {
      // Usar el método de la librería phone formatter
      if (this.phoneFormatter && typeof this.phoneFormatter.formatPhoneForPDF === 'function') {
        return this.phoneFormatter.formatPhoneForPDF(phoneValue);
      }

      // Fallback si no está disponible el método
      return this._basicPhoneFormat(phoneValue);
    } catch (error) {
      console.warn(`⚠️ Error formateando teléfono para PDF:`, error);
      return this._basicPhoneFormat(phoneValue);
    }
  }

  /**
   * Formato básico de teléfono como fallback
   * @private
   */
  _basicPhoneFormat(phoneValue) {
    if (!phoneValue) return '';

    try {
      // Si parece ser JSON, procesar como tal
      if (phoneValue.startsWith('[') || (phoneValue.startsWith('"') && phoneValue.indexOf('[') === 1)) {
        let jsonStr = phoneValue;
        if (phoneValue.startsWith('"')) {
          jsonStr = JSON.parse(phoneValue);
        }

        const phones = JSON.parse(jsonStr);
        if (!Array.isArray(phones) || phones.length === 0) return '';

        return phones.map(phone => {
          if (phone.descripcion === 'Incompleto') {
            return phone.numero || '';
          }

          let tipo = '';
          if (phone.tipo === 'celular') {
            tipo = 'Cel:';
          } else if (phone.tipo === 'whatsapp') {
            tipo = 'WhatsApp:';
          } else if (phone.tipo === 'gratuito') {
            tipo = '';
          } else {
            tipo = 'Tel:';
          }

          let numero = '';
          if (phone.tipo === 'gratuito' && phone.codigoArea && phone.codigoArea.startsWith('0')) {
            const n = phone.numero || '';
            if (n.length >= 6) {
              numero = `${phone.codigoArea}-${n.slice(0,3)}-${n.slice(3)}`;
            } else {
              numero = `${phone.codigoArea}-${n}`;
            }
          } else {
            const n = phone.numero || '';
            const area = phone.codigoArea || '';

            if (n && n.length > 4) {
              numero = `${area} ${n.slice(0, n.length-4)}-${n.slice(-4)}`;
            } else if (n && n.length > 0) {
              numero = `${area} ${n}`;
            } else {
              numero = area;
            }
          }

          if (phone.extension) {
            numero += ` int:${phone.extension}`;
          }

          return `${tipo} ${numero}`.trim();
        }).join(' | ');
      } else {
        // Si no es JSON, formatear texto plano básico
        const parts = phoneValue.split(/[,;\/]+/).map(p => p.trim()).filter(p => p);
        return parts.join(' | ');
      }
    } catch (e) {
      console.warn(`⚠️ Error en formato básico de teléfono: ${e.message}`);
      return phoneValue;
    }
  }

  /**
   * Carga la fuente para el PDF
   * @private
   */
  async _loadFont(pdfDoc) {
    let font;
    try {
      const fontBytes = await fsPromises.readFile(
        path.join(__dirname, "..", "..", "assets", "fonts", "WorkSans-Regular.ttf")
      );
      font = await pdfDoc.embedFont(fontBytes);
      console.log(`🔤 Fuente personalizada cargada exitosamente`);
    } catch (e) {
      console.warn("⚠️ No se pudo cargar fuente personalizada, usando fuentes estándar");
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }
    return font;
  }

  /**
   * Obtiene información de fecha actual
   * @private
   */
  _getCurrentDateInfo() {
    const now = new Date();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const currentMonth = monthNames[now.getMonth()];
    const currentYear = now.getFullYear();

    return { currentMonth, currentYear };
  }

  /**
   * Agrega pie de página a una página
   * @private
   */
  _addFooter(page, font, currentMonth, currentYear) {
    const footerText = `Vigencia ${currentMonth} ${currentYear}`;
    const footerWidth = font.widthOfTextAtSize(footerText, 10);
    page.drawText(footerText, {
      x: (page.getWidth() - footerWidth) / 2,
      y: 30,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  /**
   * Crea el índice y contenido del PDF
   * @private
   */
  async _createIndexAndContent(pdfDoc, font, especialidadesOrdenadas, prestadoresPorEspecialidad, prestadoresVirtuales, currentMonth, currentYear) {
    const pageWidth = 595;
    const pageHeight = 842;
    const margin = { top: 70, bottom: 70, left: 50, right: 50 };

    // 1. Crear página de índice
    let currentIndexPage = pdfDoc.insertPage(1, [pageWidth, pageHeight]);
    let yPosition = pageHeight - margin.top;
    let pageCount = 2;

    // Título del índice centrado
    const indexTitle = "Índice de Especialidades";
    const indexTitleWidth = font.widthOfTextAtSize(indexTitle, 20);
    currentIndexPage.drawText(indexTitle, {
      x: (pageWidth - indexTitleWidth) / 2,
      y: yPosition,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });

    yPosition -= 40;

    // Agregar pie de página al índice
    this._addFooter(currentIndexPage, font, currentMonth, currentYear);

    // Crear un mapa de especialidad -> número
    const especialidadNumeros = {};
    especialidadesOrdenadas.forEach((especialidad, index) => {
      especialidadNumeros[especialidad] = index + 1;
    });

    // Agregar entradas de índice para especialidades presenciales
    for (const especialidad of especialidadesOrdenadas) {
      if (yPosition < margin.bottom + 30) {
        currentIndexPage = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin.top;
        this._addFooter(currentIndexPage, font, currentMonth, currentYear);
      }

      const especialidadNum = especialidadNumeros[especialidad];
      const numeradaEspecialidad = `${especialidadNum}. ${especialidad}`;

      currentIndexPage.drawText(numeradaEspecialidad, {
        x: margin.left,
        y: yPosition,
        size: 12,
        font,
      });

      const prestadoresCount = prestadoresPorEspecialidad[especialidad].length;
      const pagesNeeded = Math.ceil(prestadoresCount / 15);
      pageCount += pagesNeeded;

      yPosition -= 25;
    }

    // Agregar entrada para atención virtual si hay prestadores virtuales
    if (prestadoresVirtuales.length > 0) {
      if (yPosition < margin.bottom + 30) {
        currentIndexPage = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin.top;
        this._addFooter(currentIndexPage, font, currentMonth, currentYear);
      }

      const virtualNum = especialidadesOrdenadas.length + 1;
      const virtualEntry = `${virtualNum}. Atención Virtual`;

      currentIndexPage.drawText(virtualEntry, {
        x: margin.left,
        y: yPosition,
        size: 12,
        font,
      });

      yPosition -= 25;
    }

    // 2. Crear páginas para cada especialidad presencial
    await this._createContentPages(
      pdfDoc,
      font,
      especialidadesOrdenadas,
      prestadoresPorEspecialidad,
      especialidadNumeros,
      currentMonth,
      currentYear,
      pageWidth,
      pageHeight,
      margin
    );

    // 3. Agregar sección de atención virtual si hay prestadores virtuales
    if (prestadoresVirtuales.length > 0) {
      await this._createVirtualSection(
        pdfDoc,
        font,
        prestadoresVirtuales,
        especialidadesOrdenadas.length + 1,
        currentMonth,
        currentYear,
        pageWidth,
        pageHeight,
        margin
      );
    }

    console.log(`📖 Páginas creadas: ${pdfDoc.getPageCount()}`);
  }

  /**
   * Crea las páginas de contenido para especialidades presenciales
   * @private
   */
  async _createContentPages(pdfDoc, font, especialidadesOrdenadas, prestadoresPorEspecialidad, especialidadNumeros, currentMonth, currentYear, pageWidth, pageHeight, margin) {
    const columnWidth = 120;
    const maxTextWidth = columnWidth - 10;
    const lineHeight = 12;
    const rowSpacing = 5;
    const tableWidth = columnWidth * 4;
    const tableStartX = (pageWidth - tableWidth) / 2;

    console.log(`📝 Creando páginas de contenido para ${especialidadesOrdenadas.length} especialidades`);

    for (const especialidad of especialidadesOrdenadas) {
      const prestadores = prestadoresPorEspecialidad[especialidad];
      let currentPage;
      let prestadoresInPage = 0;
      let currentY = pageHeight - margin.top;

      console.log(`   📄 Procesando especialidad: ${especialidad} (${prestadores.length} prestadores)`);

      for (let i = 0; i < prestadores.length; i++) {
        if (prestadoresInPage === 0 || currentY <= margin.bottom) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          this._addFooter(currentPage, font, currentMonth, currentYear);

          const especialidadNum = especialidadNumeros[especialidad];
          const tituloNumerado = `${especialidadNum}. ${especialidad}`;
          const titleWidth = font.widthOfTextAtSize(tituloNumerado, 18);
          currentPage.drawText(tituloNumerado, {
            x: (pageWidth - titleWidth) / 2,
            y: currentY,
            size: 18,
            font,
            color: rgb(0, 0, 0),
          });

          currentY -= 30;

          // Encabezados de columna
          this._drawTableHeaders(currentPage, font, tableStartX, currentY);

          // Línea divisoria
          currentPage.drawLine({
            start: { x: tableStartX, y: currentY - 5 },
            end: { x: tableStartX + tableWidth, y: currentY - 5 },
            thickness: 0.5,
            color: rgb(0.8, 0.8, 0.8),
          });

          currentY -= 20;
          prestadoresInPage = 0;
        }

        const prestador = prestadores[i];

        // Calcular altura necesaria para esta fila
        const nombreLines = this._splitTextToFit(prestador.nombre, maxTextWidth, 9, font);
        const localidadLines = this._splitTextToFit(prestador.localidad, maxTextWidth, 9, font);
        const direccionLines = this._splitTextToFit(prestador.direccion, maxTextWidth, 9, font);
        const telefonoLines = this._splitTextToFit(prestador.telefonos, maxTextWidth, 9, font);

        const maxLines = Math.max(
          nombreLines.length,
          direccionLines.length,
          localidadLines.length,
          telefonoLines.length,
          1
        );
        const rowNeededHeight = maxLines * lineHeight + rowSpacing;

        if (currentY - rowNeededHeight < margin.bottom) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          this._addFooter(currentPage, font, currentMonth, currentYear);

          currentY = pageHeight - margin.top;
          prestadoresInPage = 0;
          currentY -= 30;

          // Encabezados de columna
          this._drawTableHeaders(currentPage, font, tableStartX, currentY);

          // Línea divisoria
          currentPage.drawLine({
            start: { x: tableStartX, y: currentY - 5 },
            end: { x: tableStartX + tableWidth, y: currentY - 5 },
            thickness: 0.5,
            color: rgb(0.8, 0.8, 0.8),
          });

          currentY -= 20;
        }

        // Dibujar contenido de la fila
        this._drawTableRow(
          currentPage,
          font,
          tableStartX,
          columnWidth,
          currentY,
          lineHeight,
          nombreLines,
          localidadLines,
          direccionLines,
          telefonoLines,
          maxTextWidth
        );

        currentY -= rowNeededHeight;
        prestadoresInPage++;
      }
    }
  }

  /**
   * Crea la sección de atención virtual
   * @private
   */
  async _createVirtualSection(pdfDoc, font, prestadoresVirtuales, virtualNum, currentMonth, currentYear, pageWidth, pageHeight, margin) {
    const columnWidth = 120;
    const maxTextWidth = columnWidth - 10;
    const lineHeight = 12;
    const rowSpacing = 5;
    const tableWidth = columnWidth * 4;
    const tableStartX = (pageWidth - tableWidth) / 2;

    console.log(`🌐 Creando sección de atención virtual (${prestadoresVirtuales.length} prestadores)`);

    // Ordenar prestadores virtuales por especialidad alfabéticamente
    const virtualesOrdenados = [...prestadoresVirtuales].sort((a, b) =>
      a.especialidad.localeCompare(b.especialidad)
    );

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    this._addFooter(currentPage, font, currentMonth, currentYear);
    let currentY = pageHeight - margin.top;

    // Título de la sección de atención virtual
    const tituloVirtual = `${virtualNum}. Atención Virtual`;
    const titleWidth = font.widthOfTextAtSize(tituloVirtual, 18);
    currentPage.drawText(tituloVirtual, {
      x: (pageWidth - titleWidth) / 2,
      y: currentY,
      size: 18,
      font,
      color: rgb(0, 0, 0),
    });

    currentY -= 30;

    // Encabezados de columna para atención virtual
    currentPage.drawText("PRESTADOR", {
      x: tableStartX,
      y: currentY,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    currentPage.drawText("ESPECIALIDAD", {
      x: tableStartX + columnWidth,
      y: currentY,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    currentPage.drawText("TELÉFONO", {
      x: tableStartX + columnWidth * 2,
      y: currentY,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    currentPage.drawText("EMAIL", {
      x: tableStartX + columnWidth * 3,
      y: currentY,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Línea divisoria
    currentPage.drawLine({
      start: { x: tableStartX, y: currentY - 5 },
      end: { x: tableStartX + tableWidth, y: currentY - 5 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });

    currentY -= 20;

    for (const prestador of virtualesOrdenados) {
      // Verificar si necesitamos nueva página
      if (currentY <= margin.bottom + 50) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        this._addFooter(currentPage, font, currentMonth, currentYear);
        currentY = pageHeight - margin.top - 50;
      }

      // Calcular altura necesaria para esta fila
      const nombreLines = this._splitTextToFit(prestador.nombre, maxTextWidth, 9, font);
      const especialidadLines = this._splitTextToFit(prestador.especialidad, maxTextWidth, 9, font);
      const telefonoLines = this._splitTextToFit(prestador.telefonos, maxTextWidth, 9, font);
      const emailLines = this._splitTextToFit(prestador.email, maxTextWidth, 9, font);

      const maxLines = Math.max(
        nombreLines.length,
        especialidadLines.length,
        telefonoLines.length,
        emailLines.length,
        1
      );
      const rowNeededHeight = maxLines * lineHeight + rowSpacing;

      // Dibujar contenido de la fila virtual
      this._drawVirtualTableRow(
        currentPage,
        font,
        tableStartX,
        columnWidth,
        currentY,
        lineHeight,
        nombreLines,
        especialidadLines,
        telefonoLines,
        emailLines,
        maxTextWidth
      );

      currentY -= rowNeededHeight;
    }
  }

  /**
   * Dibuja los encabezados de tabla
   * @private
   */
  _drawTableHeaders(page, font, tableStartX, currentY) {
    page.drawText("PRESTADOR", {
      x: tableStartX,
      y: currentY,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText("LOCALIDAD", {
      x: tableStartX + 120,
      y: currentY,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText("DIRECCIÓN", {
      x: tableStartX + 240,
      y: currentY,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText("TELÉFONO", {
      x: tableStartX + 360,
      y: currentY,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  /**
   * Dibuja una fila de tabla para prestadores presenciales
   * @private
   */
  _drawTableRow(page, font, tableStartX, columnWidth, currentY, lineHeight, nombreLines, localidadLines, direccionLines, telefonoLines, maxTextWidth) {
    nombreLines.forEach((line, idx) => {
      page.drawText(line, {
        x: tableStartX,
        y: currentY - idx * lineHeight,
        size: 9,
        font,
        maxWidth: maxTextWidth,
      });
    });

    localidadLines.forEach((line, idx) => {
      page.drawText(line, {
        x: tableStartX + columnWidth,
        y: currentY - idx * lineHeight,
        size: 9,
        font,
        maxWidth: maxTextWidth,
      });
    });

    direccionLines.forEach((line, idx) => {
      page.drawText(line, {
        x: tableStartX + columnWidth * 2,
        y: currentY - idx * lineHeight,
        size: 9,
        font,
        maxWidth: maxTextWidth,
      });
    });

    telefonoLines.forEach((line, idx) => {
      page.drawText(line, {
        x: tableStartX + columnWidth * 3,
        y: currentY - idx * lineHeight,
        size: 9,
        font,
        maxWidth: maxTextWidth,
      });
    });
  }

  /**
   * Dibuja una fila de tabla para prestadores virtuales
   * @private
   */
  _drawVirtualTableRow(page, font, tableStartX, columnWidth, currentY, lineHeight, nombreLines, especialidadLines, telefonoLines, emailLines, maxTextWidth) {
    nombreLines.forEach((line, idx) => {
      page.drawText(line, {
        x: tableStartX,
        y: currentY - idx * lineHeight,
        size: 9,
        font,
        maxWidth: maxTextWidth,
      });
    });

    especialidadLines.forEach((line, idx) => {
      page.drawText(line, {
        x: tableStartX + columnWidth,
        y: currentY - idx * lineHeight,
        size: 9,
        font,
        maxWidth: maxTextWidth,
      });
    });

    telefonoLines.forEach((line, idx) => {
      page.drawText(line, {
        x: tableStartX + columnWidth * 2,
        y: currentY - idx * lineHeight,
        size: 9,
        font,
        maxWidth: maxTextWidth,
      });
    });

    emailLines.forEach((line, idx) => {
      page.drawText(line, {
        x: tableStartX + columnWidth * 3,
        y: currentY - idx * lineHeight,
        size: 9,
        font,
        maxWidth: maxTextWidth,
      });
    });
  }

  /**
   * Divide texto para que quepa en un ancho específico
   * @private
   */
  _splitTextToFit(text, maxWidth, fontSize, font) {
    if (!text) return [""];
    const words = text.split(" ");
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + " " + word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  /**
   * Actualiza/reemplaza la portada PDF para un plan y provincia específicos
   * @async
   * @param {number} id_plan - ID del plan
   * @param {number} id_provincia - ID de la provincia
   * @param {Buffer} pdfFile - Buffer del archivo PDF
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el resultado de la operación
   */
  async updateTemplateAsset(id_plan, id_provincia, pdfFile) {
    try {
      console.log(`📄 Actualizando portada PDF para plan ${id_plan}, provincia ${id_provincia}`);

      // 1. Verificar que el plan y la provincia existen
      const [planResult] = await this.pool.query(
        "SELECT id_plan FROM planes WHERE id_plan = ?",
        [id_plan]
      );
      const [provinciaResult] = await this.pool.query(
        "SELECT id_provincia FROM provincias WHERE id_provincia = ?",
        [id_provincia]
      );

      if (!planResult.length || !provinciaResult.length) {
        throw new Error("Plan o provincia no encontrados");
      }

      // 2. Crear la estructura de directorios si no existe
      const templatesDir = path.join(__dirname, "..", "..", "templates");
      const planDir = path.join(templatesDir, id_plan.toString());
      const filePath = path.join(planDir, `${id_provincia}.pdf`);

      // Verificar si el directorio del plan existe, si no, crearlo
      try {
        await fsPromises.access(planDir);
      } catch (error) {
        await fsPromises.mkdir(planDir, { recursive: true });
        console.log(`📁 Directorio creado: ${planDir}`);
      }

      // 3. Guardar el archivo PDF
      await fsPromises.writeFile(filePath, pdfFile);

      // 4. Verificar que el archivo se guardó correctamente
      const fileStats = await fsPromises.stat(filePath);
      if (!fileStats.isFile()) {
        throw new Error("No se pudo guardar el archivo PDF");
      }

      console.log(`✅ Portada PDF actualizada: ${filePath} (${(fileStats.size / 1024).toFixed(2)} KB)`);

      return {
        success: true,
        message: "Portada PDF actualizada correctamente",
        path: filePath,
        size: fileStats.size
      };
    } catch (error) {
      console.error("❌ Error al actualizar portada PDF:", error);
      throw new Error(`Error al actualizar portada PDF: ${error.message}`);
    }
  }
}

module.exports = PDFGenerator;