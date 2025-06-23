// libs/csv-processor/index.js
/**
 * CSV Processor Library
 * Maneja el procesamiento masivo de archivos CSV de prestadores
 */

const fs = require('fs');
const csv = require('csv-parser');
const { Transform } = require('stream');

class CSVProcessor {
  constructor(pool, abmRepository, phoneFormatter) {
    this.pool = pool;
    this.abmRepository = abmRepository;
    this.phoneFormatter = phoneFormatter;

    // console.log('phoneFormatter methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.phoneFormatter)));
  }

  /**
   * Procesa un archivo CSV masivo de prestadores médicos con streams
   * @async
   * @param {string} filePath - Ruta del archivo CSV
   * @param {Object} [options] - Opciones de configuración
   * @param {string} [options.delimiter=','] - Delimitador de campos
   * @param {number} [options.batchSize=1000] - Tamaño del lote para inserción
   * @param {Function} [options.progressCallback] - Callback para notificar progreso
   * @returns {Promise<Object>} - Resultados del proceso
   */
  async processMassiveCSVStream(filePath, options = {}) {
    const {
      delimiter = ",",
      batchSize = 1000,
      progressCallback,
      enablePhoneParsing = true
    } = options;

    let processedCount = 0;
    let successfulCount = 0;
    let failedCount = 0;
    let warnings = [];
    let phoneParsingSkipped = 0;
    let connection;

    // Variables para calcular porcentaje
    let fileSize = 0;
    let estimatedTotalRows = 0;
    const startTime = Date.now();

    console.log(`🔧 Parseo automático de teléfonos: ${enablePhoneParsing ? 'HABILITADO' : 'DESHABILITADO'}`);

    try {
      // Obtener el tamaño del archivo y estimar total de filas
      const stats = await fs.promises.stat(filePath);
      fileSize = stats.size;

      // Estimar número total de filas leyendo una muestra
      const sampleSize = Math.min(1024 * 100, fileSize); // 100KB muestra
      const sampleBuffer = Buffer.alloc(sampleSize);
      const fd = await fs.promises.open(filePath, 'r');
      await fd.read(sampleBuffer, 0, sampleSize, 0);
      await fd.close();

      const sampleText = sampleBuffer.toString('utf8');
      const sampleLines = sampleText.split('\n').length - 1; // -1 por header
      const avgBytesPerLine = sampleSize / sampleLines;
      estimatedTotalRows = Math.floor(fileSize / avgBytesPerLine) - 1; // -1 por header

      console.log(`📊 Archivo CSV: ${(fileSize / (1024 * 1024)).toFixed(2)} MB (~${estimatedTotalRows.toLocaleString()} filas estimadas)`);

      connection = await this.pool.getConnection();
      await connection.beginTransaction();

      // 1. Limpiar cartilla inicialmente
      await connection.query("CALL LimpiarCartilla()");

      let batchValues = [];
      let batchNumber = 0;

      // Store reference to phoneFormatter for use in transform function
      const phoneFormatter = this.phoneFormatter;

      // Función auxiliar para mostrar progreso con porcentaje
      const showProgress = () => {
        const percentageByRows = estimatedTotalRows > 0 ? (processedCount / estimatedTotalRows * 100) : 0;
        const elapsed = Date.now() - startTime;
        const rate = processedCount > 0 ? (processedCount / elapsed * 1000) : 0;
        const eta = rate > 0 && estimatedTotalRows > processedCount
          ? ((estimatedTotalRows - processedCount) / rate)
          : 0;

        console.log(`
🚀 PROGRESO CSV:
   📈 Porcentaje: ${Math.min(percentageByRows, 100).toFixed(1)}% (${processedCount.toLocaleString()}/${estimatedTotalRows.toLocaleString()} filas)
   ✅ Exitosos: ${successfulCount.toLocaleString()}
   ❌ Fallidos: ${failedCount.toLocaleString()}
   ⚠️  Advertencias: ${warnings.length}
   📞 Teléfonos omitidos: ${phoneParsingSkipped}
   ⏱️  Velocidad: ${rate.toFixed(0)} reg/seg
   ⏰ Tiempo transcurrido: ${(elapsed / 1000).toFixed(1)}s
   🕐 Tiempo estimado restante: ${eta > 0 ? (eta / 1000).toFixed(1) + 's' : 'calculando...'}
   💾 Archivo: ${(fileSize / (1024 * 1024)).toFixed(2)} MB
        `);
      };

      // Función auxiliar para normalización segura con timeout
      const safePhoneNormalization = (phoneText, timeout = 5000) => {
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            reject(new Error('Phone normalization timeout'));
          }, timeout);

          try {
            // Usar método más simple si está obfuscado
            let result;
            if (enablePhoneParsing) {
              // Intentar método simple primero
              if (phoneFormatter.csvFormatToPhoneJson && typeof phoneFormatter.csvFormatToPhoneJson === 'function') {
                result = phoneFormatter.csvFormatToPhoneJson(phoneText);
              } else {
                // Fallback a JSON vacío
                result = JSON.stringify([]);
              }
            } else {
              // Solo convertir si es formato estructurado
              if (phoneText && phoneText.includes('type:') && phoneText.includes('|area:')) {
                result = phoneFormatter.csvFormatToPhoneJson(phoneText);
              } else {
                result = phoneText; // Mantener original
              }
            }

            clearTimeout(timer);
            resolve(result);
          } catch (error) {
            clearTimeout(timer);
            reject(error);
          }
        });
      };

      // Transform stream para procesar cada línea
      const csvTransformer = new Transform({
        objectMode: true,
        transform(row, encoding, callback) {
          try {
            // Validación básica de campos requeridos
            if (!row.nombre_prestador || !row.plan || !row.especialidad) {
              failedCount++;
              warnings.push(`Fila ${processedCount + 1}: Faltan campos requeridos (nombre_prestador, plan, especialidad)`);
              callback();
              return;
            }

            // LÓGICA MODIFICADA: Normalizar teléfonos de forma segura
            const processPhones = async () => {
              if (row.telefonos) {
                const originalPhones = row.telefonos;
                let phoneProcessed = false;

                try {
                  // Usar normalización segura con timeout
                  row.telefonos = await safePhoneNormalization(originalPhones);
                  phoneProcessed = true;

                  if (process.env.NODE_ENV === 'development') {
                    console.log(`✅ Teléfono procesado en fila ${processedCount + 1}`);
                  }
                } catch (phoneError) {
                  console.warn(`⚠️ Error normalizando teléfono en fila ${processedCount + 1}: ${phoneError.message}`);

                  if (phoneError.message.includes('timeout')) {
                    // Si hay timeout, usar método más simple
                    warnings.push(`Fila ${processedCount + 1}: Timeout en normalización, usando método simple`);

                    try {
                      // Método super simple para casos problemáticos
                      if (originalPhones.includes('type:') && originalPhones.includes('|')) {
                        // Es formato estructurado, convertir a JSON básico
                        row.telefonos = JSON.stringify([{
                          tipo: 'fijo',
                          codigoArea: '',
                          numero: originalPhones.replace(/\D/g, ''),
                          extension: null,
                          descripcion: 'Convertido por método simple'
                        }]);
                      } else {
                        // Para otros casos, crear estructura mínima
                        const cleanedNumber = originalPhones.replace(/\D/g, '');
                        if (cleanedNumber.length > 6) {
                          row.telefonos = JSON.stringify([{
                            tipo: 'fijo',
                            codigoArea: '',
                            numero: cleanedNumber,
                            extension: null,
                            descripcion: 'Procesado automáticamente'
                          }]);
                        } else {
                          row.telefonos = JSON.stringify([]);
                        }
                      }
                      phoneProcessed = true;
                    } catch (simpleError) {
                      warnings.push(`Fila ${processedCount + 1}: Error en método simple, mantenido original`);
                      // Mantener valor original como último recurso
                    }
                  } else {
                    warnings.push(`Fila ${processedCount + 1}: Error de normalización, mantenido original`);
                    // Mantener el valor original
                  }
                }

                if (!enablePhoneParsing && !phoneProcessed) {
                  phoneParsingSkipped++;
                }

                // Log detallado para debugging
                if (phoneProcessed && process.env.NODE_ENV === 'development') {
                  console.log(`📞 Teléfono fila ${processedCount + 1}:`);
                  console.log(`   Original: "${originalPhones}"`);
                  console.log(`   Procesado: "${row.telefonos}"`);
                }
              } else {
                // Si no hay teléfonos, establecer valor por defecto según configuración
                row.telefonos = enablePhoneParsing ? JSON.stringify([]) : '';
              }

              // Validar y normalizar otros campos
              const processedRow = {
                plan: (row.plan || "").trim(),
                categoria_prestador: (row.categoria_prestador || "").trim(),
                especialidad: (row.especialidad || "").trim(),
                provincia: (row.provincia || "").trim(),
                localidad: (row.localidad || "").trim(),
                nombre_prestador: (row.nombre_prestador || "").trim(),
                direccion: (row.direccion || "").trim(),
                telefonos: row.telefonos,
                email: (row.email || "").trim(),
                atencion_virtual: row.atencion_virtual || "No",
                informacion_adicional: (row.informacion_adicional || "").trim(),
                estado: (row.estado || "Activo").trim()
              };

              // Validaciones adicionales
              if (processedRow.nombre_prestador.length < 2) {
                failedCount++;
                warnings.push(`Fila ${processedCount + 1}: Nombre del prestador demasiado corto`);
                callback();
                return;
              }

              if (processedRow.plan.length < 2) {
                failedCount++;
                warnings.push(`Fila ${processedCount + 1}: Plan inválido`);
                callback();
                return;
              }

              // Preparar valores para la inserción
              const values = [
                processedRow.plan,
                processedRow.categoria_prestador,
                processedRow.especialidad,
                processedRow.provincia,
                processedRow.localidad,
                processedRow.nombre_prestador,
                processedRow.direccion,
                processedRow.telefonos,
                processedRow.email,
                processedRow.atencion_virtual,
                processedRow.informacion_adicional,
                processedRow.estado,
              ];

              batchValues.push(values);
              processedCount++;
              successfulCount++;

              // Mostrar progreso con porcentaje cada 500 registros
              if (processedCount % 500 === 0) {
                showProgress();
              }

              // Notificar progreso cada 1000 registros
              if (progressCallback && processedCount % 1000 === 0) {
                const percentageByRows = estimatedTotalRows > 0 ? (processedCount / estimatedTotalRows * 100) : 0;
                const elapsed = Date.now() - startTime;

                progressCallback({
                  totalProcessed: processedCount,
                  successful: successfulCount,
                  failed: failedCount,
                  warnings: warnings.length,
                  phoneParsingSkipped: phoneParsingSkipped,
                  enablePhoneParsing: enablePhoneParsing,
                  batchNumber: Math.floor(processedCount / batchSize),
                  status: "processing",
                  percentage: Math.min(percentageByRows, 100),
                  estimatedTotalRows: estimatedTotalRows,
                  fileSize: fileSize,
                  rate: processedCount > 0 ? (processedCount / elapsed * 1000) : 0,
                  elapsedTime: elapsed
                });
              }

              // Si el batch está lleno, insertar
              if (batchValues.length >= batchSize) {
                this.push(batchValues);
                batchValues = [];
                batchNumber++;
              }

              callback();
            };

            // Ejecutar procesamiento de teléfonos de forma asíncrona
            processPhones().catch(error => {
              failedCount++;
              warnings.push(`Fila ${processedCount + 1}: Error de procesamiento - ${error.message}`);
              console.error(`Error procesando fila ${processedCount + 1}:`, error);
              callback();
            });

          } catch (error) {
            failedCount++;
            warnings.push(`Fila ${processedCount + 1}: Error de procesamiento - ${error.message}`);
            console.error(`Error procesando fila ${processedCount + 1}:`, error);
            callback();
          }
        },
        flush(callback) {
          // Insertar los registros restantes en el último batch
          if (batchValues.length > 0) {
            this.push(batchValues);
          }
          callback();
        },
      });

      // Stream para insertar los batches en la base de datos
      const dbInserter = new Transform({
        objectMode: true,
        async transform(batch, encoding, callback) {
          try {
            await connection.query(
              `INSERT INTO cartilla
               (plan, categoria_prestador, especialidad, provincia, localidad,
                nombre_prestador, direccion, telefonos, email, atencion_virtual, informacion_adicional, estado)
               VALUES ?`,
              [batch]
            );
            callback();
          } catch (error) {
            console.error('Error insertando batch en base de datos:', error);
            // Contar los registros fallidos de este batch
            failedCount += batch.length;
            successfulCount -= batch.length;
            warnings.push(`Error insertando lote de ${batch.length} registros: ${error.message}`);
            callback(error);
          }
        },
      });

      // Pipeline completo
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(
            csv({
              separator: delimiter,
              mapValues: ({ value }) => value ? value.toString().trim() : '',
              skipEmptyLines: true,
              skipLinesWithError: true,
            })
          )
          .on("error", (error) => {
            console.error('Error en stream de lectura CSV:', error);
            reject(error);
          })
          .pipe(csvTransformer)
          .on("error", (error) => {
            console.error('Error en transformación CSV:', error);
            reject(error);
          })
          .pipe(dbInserter)
          .on("error", (error) => {
            console.error('Error en inserción a DB:', error);
            reject(error);
          })
          .on("finish", () => {
            console.log('Pipeline CSV completado exitosamente');
            // Mostrar progreso final
            showProgress();
            resolve();
          });
      });

      // 3. Limpiar tablas de cartilla
      await connection.query("CALL LimpiarTablasCartilla()");

      // 4. Procesar la cartilla para poblar las tablas relacionadas
      await connection.query("CALL ProcesarCartilla()");

      await connection.commit();

      // Mostrar resumen final con tiempo total
      const totalTime = Date.now() - startTime;
      console.log(`
🎉 PROCESAMIENTO COMPLETADO:
   ✅ Total procesados: ${processedCount.toLocaleString()} registros
   ✅ Exitosos: ${successfulCount.toLocaleString()}
   ❌ Fallidos: ${failedCount.toLocaleString()}
   ⚠️  Advertencias: ${warnings.length}
   📞 Teléfonos omitidos: ${phoneParsingSkipped}
   ⏰ Tiempo total: ${(totalTime / 1000).toFixed(1)}s
   📊 Velocidad promedio: ${((processedCount / totalTime) * 1000).toFixed(0)} reg/seg
   💾 Archivo procesado: ${(fileSize / (1024 * 1024)).toFixed(2)} MB
      `);

      // Notificación final de progreso
      if (progressCallback) {
        progressCallback({
          totalProcessed: processedCount,
          successful: successfulCount,
          failed: failedCount,
          warnings: warnings.length,
          phoneParsingSkipped: phoneParsingSkipped,
          enablePhoneParsing: enablePhoneParsing,
          status: "completed",
          percentage: 100,
          estimatedTotalRows: estimatedTotalRows,
          fileSize: fileSize,
          elapsedTime: totalTime
        });
      }

      // Resultado detallado
      const finalMessage = enablePhoneParsing
        ? `CSV procesado exitosamente. ${successfulCount} registros cargados exitosamente, ${failedCount} fallaron. Parseo automático aplicado.`
        : `CSV procesado exitosamente. ${successfulCount} registros cargados exitosamente, ${failedCount} fallaron. Parseo automático omitido (${phoneParsingSkipped} teléfonos mantenidos en formato original).`;

      return {
        success: true,
        totalProcessed: processedCount,
        successful: successfulCount,
        failed: failedCount,
        warnings: warnings,
        phoneParsingSkipped: phoneParsingSkipped,
        enablePhoneParsing: enablePhoneParsing,
        message: finalMessage,
        processingTime: totalTime,
        fileSize: fileSize
      };
    } catch (error) {
      if (connection) await connection.rollback();

      if (progressCallback) {
        progressCallback({
          error: error.message,
          status: "failed",
          totalProcessed: processedCount || 0,
          successful: successfulCount || 0,
          failed: failedCount || 0,
          warnings: warnings.length || 0,
          phoneParsingSkipped: phoneParsingSkipped || 0,
          enablePhoneParsing: enablePhoneParsing,
        });
      }

      console.error("Error al procesar CSV:", error);
      throw new Error(`Error al procesar CSV: ${error.message}`);
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Procesa un lote de registros
   * @private
   */
  async _processBatch(connection, batch, batchNumber) {
    if (batch.length === 0) return;

    try {
      console.log(`Procesando lote ${batchNumber + 1} con ${batch.length} registros...`);

      const insertValues = batch.map(row => [
        row.nombre_prestador,
        row.direccion,
        row.telefonos,
        row.email || null,
        row.informacion_adicional || null,
        row.estado,
        row.id_plan,
        row.id_especialidad,
        row.id_categoria,
        row.id_provincia,
        row.id_localidad,
        row.atencion_virtual === 'Sí' || row.atencion_virtual === 'Si' || row.atencion_virtual === 'YES' || row.atencion_virtual === 'Yes' ? 1 : 0
      ]);

      await connection.query(`
          INSERT INTO cartilla (
              nombre_prestador, direccion, telefonos, email, informacion_adicional, estado,
              id_plan, id_especialidad, id_categoria, id_provincia, id_localidad, atencion_virtual
          ) VALUES ?
      `, [insertValues]);

      console.log(`Lote ${batchNumber + 1} procesado exitosamente`);

    } catch (error) {
      console.error(`Error procesando lote ${batchNumber + 1}:`, error);
      throw error;
    }
  }
}

module.exports = CSVProcessor;