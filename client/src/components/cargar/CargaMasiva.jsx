import '../../styles/cargar-cartilla.css'
import '../../styles/virtual-attention.css'
import { MdSubdirectoryArrowLeft } from "react-icons/md";
import { CiCircleAlert } from "react-icons/ci";
import { MdNotStarted } from "react-icons/md";
import { IoCloudUploadOutline } from "react-icons/io5";
import { LuBrainCircuit, LuPhone, LuCircleCheck, LuTriangleAlert, LuClock, LuZap } from "react-icons/lu";
import { BiRefresh } from "react-icons/bi";
import { RiFileListLine } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import { Footer } from '../../layouts/Footer';
import HeaderStaff from '../../layouts/HeaderStaff';
import { useCallback, useState, useRef } from 'react';
import useCartillaCSV from '../../hooks/useCartillaCSV';
import Swal from 'sweetalert2';
import '../../styles/panel-usuario-nuevo.css'

export default function CargaMasiva() {
  const navigate = useNavigate();
  const {
    uploadCSV,
    uploadProgress,
    uploadError,
    uploadResult,
    isUploading,
    uploadSuccess,
    resetUploadStatus
  } = useCartillaCSV();

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [enablePhoneParsing, setEnablePhoneParsing] = useState(true); // NUEVO: Estado para el check
  const fileInputRef = useRef(null);

  const handleVolver = () => {
    navigate(-1);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelection(droppedFiles[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      Swal.fire({
        icon: 'error',
        title: 'Formato incorrecto',
        text: 'Por favor, sube un archivo con extensión .csv',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    if (uploadResult || uploadError) {
      resetUploadStatus();
    }

    setFile(selectedFile);
  };

  // NUEVO: Manejador para el toggle de parseo de teléfonos
  const handlePhoneParsingToggle = (e) => {
    // Solo activar cuando se hace clic en el toggle switch
    e.stopPropagation();
    setEnablePhoneParsing(!enablePhoneParsing);
  };

  const handleSubmit = async () => {
    if (!file) {
      Swal.fire({
        icon: 'warning',
        title: 'Archivo faltante',
        text: 'Por favor, selecciona un archivo primero',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    // Mostrar spinner de carga con información del parseo
    const swalInstance = Swal.fire({
      title: 'Procesando archivo',
      html: `
        <p>Por favor espera mientras se carga el archivo...</p>
        <p><small>Parseo automático de teléfonos: <strong>${enablePhoneParsing ? 'HABILITADO' : 'DESHABILITADO'}</strong></small></p>
      `,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // MODIFICADO: Incluir la opción de parseo en la carga
      const result = await uploadCSV(file, { enablePhoneParsing });

      // Cerrar el loading
      await swalInstance.close();

      if (result.status === 200) {
        // Éxito - Mostrar mensaje con información del parseo
        await Swal.fire({
          icon: 'success',
          title: '¡Carga exitosa!',
          html: `
            <div class="text-left">
              <p>${result.message}</p>
              <p>${result.data.message}</p>
              <p><strong>Registros cargados:</strong> ${result.data.data?.totalProcessed || 'N/A'}</p>
              <p><strong>Parseo de teléfonos:</strong> ${enablePhoneParsing ? '✅ Aplicado' : '⏭️ Omitido'}</p>
              ${result.data.data?.phoneParsingSkipped ? `
                <p><strong>Teléfonos sin procesar:</strong> ${result.data.data.phoneParsingSkipped}</p>
              ` : ''}
              ${result.data.data?.warnings?.length > 0 ? `
                <p><strong>Advertencias:</strong></p>
                <ul>
                  ${result.data.data.warnings.map(warning => `<li>${warning}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `,
          confirmButtonColor: '#3085d6',
        });

        // Resetear todo después del éxito
        resetAll();
      } else {
        // Error del servidor (pero no excepción)
        throw new Error(result.message || 'Error al procesar el archivo');
      }
    } catch (err) {
      await swalInstance.close();
      await Swal.fire({
        icon: 'error',
        title: 'Error en la carga',
        text: err.message || 'Ocurrió un error al subir el archivo',
        confirmButtonColor: '#3085d6',
      });

      // Resetear todo después del error
      resetAll();
    }
  };

  // Función para resetear todo el estado
  const resetAll = () => {
    resetUploadStatus();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsDragging(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <HeaderStaff />

      <h1 className="w-50 fs-4 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 m-4 ">
        Carga masiva
      </h1>
      <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
        <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5 ms-4 me-4 ">
          <h6 className="fs-2 h1-titulo fw-bold ">Desde aquí podés subir una cartilla.</h6>
        </div>
      </div>

      <div className="d-flex justify-content-center align-items-center min-vh-100 mt-4">
        <div className="w-75 d-flex border mb-4 shadow-input border rounded">
          <div className="m-2 p-2 w-100">
            <h2 className="title-dashboard">
              <MdNotStarted className="me-3" /> Cargar
            </h2>

            {/* NUEVO: Configuración de Parseo de Teléfonos */}
            <div className="virtual-attention-container mb-4">
              <div className="virtual-attention-header">
                <h6 className="virtual-attention-title">
                  <LuBrainCircuit className="me-2" />
                  Procesamiento Automático de Teléfonos
                </h6>
                <p className="virtual-attention-subtitle">
                  Configura si aplicar normalización automática a los números telefónicos durante la carga masiva
                </p>
              </div>

              <div
                className={`virtual-attention-card ${enablePhoneParsing ? 'active' : ''}`}
                // REMOVIDO: onClick del card principal
                role="button"
                tabIndex={0}
              >
                <div className="virtual-attention-card-content">
                  <div className="virtual-attention-icon-wrapper">
                    <LuPhone className={`virtual-attention-icon ${enablePhoneParsing ? 'active' : ''}`} />
                  </div>

                  <div className="virtual-attention-info">
                    <div className="virtual-attention-label">
                      <span className="virtual-attention-main-text">
                        Normalización Inteligente
                      </span>
                      <div className="virtual-attention-status">
                        <span className={`status-badge ${enablePhoneParsing ? 'virtual' : 'presential'}`}>
                          {enablePhoneParsing ? 'HABILITADO' : 'DESHABILITADO'}
                        </span>
                      </div>
                    </div>
                    <div className="virtual-attention-description">
                      {enablePhoneParsing
                        ? 'Los teléfonos se procesarán automáticamente para mejorar formato y detectar tipos'
                        : 'Los teléfonos se mantendrán en su formato original sin procesar'
                      }
                    </div>
                  </div>

                  <div className="virtual-attention-toggle">
                    <div
                      className={`toggle-switch ${enablePhoneParsing ? 'active' : ''}`}
                      onClick={handlePhoneParsingToggle}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handlePhoneParsingToggle(e);
                        }
                      }}
                      role="switch"
                      aria-checked={enablePhoneParsing}
                      tabIndex={0}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="toggle-slider">
                        <div className="toggle-circle">
                          {enablePhoneParsing ? <LuBrainCircuit /> : <LuPhone />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mostrar beneficios cuando está habilitado */}
                {enablePhoneParsing && (
                  <div className="virtual-attention-benefits">
                    <div className="benefits-header">
                      <LuCircleCheck className="me-1" />
                      Beneficios del procesamiento automático:
                    </div>
                    <div className="benefits-list">
                      <span className="benefit-item">
                        <BiRefresh className="me-1" />
                        Formato unificado
                      </span>
                      <span className="benefit-item">
                        <LuPhone className="me-1" />
                        Detección tipo celular/fijo
                      </span>
                      <span className="benefit-item">
                        <LuCircleCheck className="me-1" />
                        Líneas gratuitas identificadas
                      </span>
                      <span className="benefit-item">
                        <LuZap className="me-1" />
                        Validación automática
                      </span>
                    </div>
                  </div>
                )}

                {/* Mostrar posibles problemas cuando está habilitado */}
                {enablePhoneParsing && (
                  <div className="virtual-attention-benefits" style={{
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05), rgba(255, 152, 0, 0.02))',
                    borderTop: '1px dashed #ff9800'
                  }}>
                    <div className="benefits-header" style={{ color: '#e65100' }}>
                      <LuTriangleAlert className="me-1" />
                      Posibles consideraciones:
                    </div>
                    <div className="benefits-list">
                      <span className="benefit-item" style={{
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        color: '#e65100'
                      }}>
                        <LuClock className="me-1" />
                        Procesamiento más lento
                      </span>
                      <span className="benefit-item" style={{
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        color: '#e65100'
                      }}>
                        <LuTriangleAlert className="me-1" />
                        Posibles cambios de formato
                      </span>
                      <span className="benefit-item" style={{
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        color: '#e65100'
                      }}>
                        <RiFileListLine className="me-1" />
                        Revisar resultados
                      </span>
                    </div>
                  </div>
                )}

                {/* Mostrar cuando está deshabilitado */}
                {!enablePhoneParsing && (
                  <div className="virtual-attention-benefits" style={{
                    background: 'linear-gradient(135deg, rgba(117, 117, 117, 0.05), rgba(117, 117, 117, 0.02))',
                    borderTop: '1px dashed #757575'
                  }}>
                    <div className="benefits-header" style={{ color: '#424242' }}>
                      <RiFileListLine className="me-1" />
                      Modo sin procesamiento:
                    </div>
                    <div className="benefits-list">
                      <span className="benefit-item" style={{
                        backgroundColor: 'rgba(117, 117, 117, 0.1)',
                        color: '#424242'
                      }}>
                        <LuZap className="me-1" />
                        Carga más rápida
                      </span>
                      <span className="benefit-item" style={{
                        backgroundColor: 'rgba(117, 117, 117, 0.1)',
                        color: '#424242'
                      }}>
                        <LuCircleCheck className="me-1" />
                        Sin modificaciones
                      </span>
                      <span className="benefit-item" style={{
                        backgroundColor: 'rgba(117, 117, 117, 0.1)',
                        color: '#424242'
                      }}>
                        <RiFileListLine className="me-1" />
                        Formato original preservado
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Área de Drag & Drop */}
            <div
              className={`m-4 justify-content-center drap-drop-style text-center ${isDragging ? 'dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              style={{ cursor: 'pointer' }}
            >
              <IoCloudUploadOutline className='cloud-icon' />
              <span className="fs-4 fw-bold">Drag & drop files</span>

              {file ? (
                <div>
                  <p className='fw-bold fs-5 text-center'>Archivo seleccionado: {file.name}</p>
                  <p className='text-center fw-light'>
                    Parseo de teléfonos: {enablePhoneParsing ? (
                    <span style={{ color: '#64A70B' }}>
                          <BiRefresh className="me-1" />
                          HABILITADO
                        </span>
                  ) : (
                    <span style={{ color: '#757575' }}>
                          <RiFileListLine className="me-1" />
                          DESHABILITADO
                        </span>
                  )}
                  </p>
                </div>
              ) : (
                <>
                  <p className='fw-bold fs-5 text-center'>Arrastrá y soltá el archivo que deseas subir</p>
                  <p className='text-center fw-light'>FORMATO ACEPTADO .CSV</p>
                </>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".csv"
                style={{ display: 'none' }}
              />
            </div>

            <div className="w-100 d-flex justify-content-center">
              <div className="div-pautas-size text-center">
                <p className="fw-bold fs-6 mb-2">
                  Importante: los archivos deben cumplir con las siguientes pautas:
                </p>
                <div className="border m-2">
                  <div className="texto-y-icono">
                    <span className='p-2 fs-6'>El archivo debe estar en formato .csv</span>
                    <CiCircleAlert className="icono-verde" />
                  </div>
                  <div className="linea-verde"></div>
                </div>

                <div className="border m-2">
                  <div className="texto-y-icono">
                    <span className="p-2 fs-6">Respeta los estándares de grillas, columnas y filas</span>
                    <CiCircleAlert className="icono-verde" />
                  </div>
                  <div className="linea-verde"></div>
                </div>

                <div className="border m-2">
                  <div className="texto-y-icono">
                    <span className="p-2 fs-6">No debe tener fuentes incrustadas</span>
                    <CiCircleAlert className="icono-verde" />
                  </div>
                  <div className="linea-verde"></div>
                </div>

                <div className="border m-2">
                  <div className="texto-y-icono">
                    <span className="p-2 fs-6">El tamaño del archivo no debe superar los 100MB</span>
                    <CiCircleAlert className="icono-verde" />
                  </div>
                  <div className="linea-verde"></div>
                </div>

                <div className="border m-2" style={{
                  borderColor: enablePhoneParsing ? '#64A70B' : '#e0e0e0',
                  backgroundColor: enablePhoneParsing ? 'rgba(100, 167, 11, 0.05)' : 'transparent'
                }}>
                  <div className="texto-y-icono">
                    <span className="p-2 fs-6">
                      {enablePhoneParsing
                        ? 'Los teléfonos se procesarán automáticamente para mejor formato'
                        : 'Los teléfonos se mantendrán en formato original (sin procesar)'
                      }
                    </span>
                    {enablePhoneParsing ? (
                      <LuBrainCircuit className="icono-verde" style={{ color: '#64A70B' }} />
                    ) : (
                      <LuPhone className="icono-verde" />
                    )}
                  </div>
                  <div className="linea-verde" style={{
                    backgroundColor: enablePhoneParsing ? '#64A70B' : '#e0e0e0'
                  }}></div>
                </div>
              </div>
            </div>

            <button
              className="mt-5 btn btn-search text-white text-center text-uppercase d-block mx-auto my-4"
              type="button"
              onClick={handleSubmit}
              disabled={isUploading || !file}
            >
              {isUploading ? 'Subiendo...' : (
                <>
                  {enablePhoneParsing ? (
                    <BiRefresh className="me-1" />
                  ) : (
                    <RiFileListLine className="me-1" />
                  )}
                  Subir archivo
                  {enablePhoneParsing && ' (con procesamiento)'}
                </>
              )}
            </button>

            <p className="fw-bold mb-0 text-center">
              ¿Tenés dudas de cómo preparar tu archivo? [Consultá la guía]
            </p>
          </div>
        </div>
      </div>

      <div className="back-button-container">
        <button className="back-button" onClick={handleVolver}>
          <MdSubdirectoryArrowLeft />
          <span>Volver</span>
        </button>
      </div>

      <Footer/>
    </div>
  )
}