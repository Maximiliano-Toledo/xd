import '../../styles/cargar-cartilla.css'
import { MdSubdirectoryArrowLeft } from "react-icons/md";
import { CiCircleAlert } from "react-icons/ci";
import { MdNotStarted } from "react-icons/md";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { Footer } from '../../layouts/Footer';
import HeaderStaff from '../../layouts/HeaderStaff';
import { useCallback, useState, useRef } from 'react';
import useCartillaCSV from '../../hooks/useCartillaCSV';
import Swal from 'sweetalert2';

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

  // Mostrar spinner de carga
  const swalInstance = Swal.fire({
    title: 'Procesando archivo',
    html: 'Por favor espera mientras se carga el archivo...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const result = await uploadCSV(file);
    
    // Cerrar el loading
    await swalInstance.close();
    
    if (result.status === 200) {
      // Éxito - Mostrar mensaje y resetear al hacer clic en OK
      await Swal.fire({
        icon: 'success',
        title: '¡Carga exitosa!',
        html: `
          <div class="text-left">
            <p>${result.message}</p>
            <p>${result.data.message}</p>
            <p><strong>Registros cargados:</strong> ${result.data.data?.totalProcessed || 'N/A'}</p>
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
                <p className='fw-bold fs-5 text-center'>Archivo seleccionado: {file.name}</p>
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
                    <span className="fs-6">El tamaño del archivo no debe superar los 100MB</span>
                    <CiCircleAlert className="icono-verde" />
                  </div>
                  <div className="linea-verde"></div>
                </div>
              </div>
            </div>

            <button
              className="mt-5 btn btn-search text-white text-center text-uppercase d-block mx-auto my-4"
              type="button"
              onClick={handleSubmit}
              disabled={isUploading || !file}
            >
              {isUploading ? 'Subiendo...' : 'Subir archivo'}
            </button>

            <p className="fw-bold mb-0 text-center">
              ¿Tenés dudas de cómo preparar tu archivo? [Consultá la guía]
            </p>
          </div>
        </div>
      </div>

      <button 
        className='btn btn-volver rounded-pill text-white text-center text-uppercase' 
        type='button' 
        onClick={handleVolver}
      >            
        <MdSubdirectoryArrowLeft className='text-white' /> Volver
      </button>

      <Footer/>
    </div>
  )
}