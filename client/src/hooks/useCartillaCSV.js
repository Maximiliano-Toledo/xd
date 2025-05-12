import { useState, useCallback, useRef, useEffect } from 'react';
import { CartillaService } from '../api/services/cartillaService';

/**
 * Hook personalizado para gestionar operaciones CSV de la cartilla médica
 * @returns {Object} Métodos y estados para manejar operaciones CSV
 */
const useCartillaCSV = () => {
  // Estado para el progreso de carga
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Estados para la descarga
  const [downloadStatus, setDownloadStatus] = useState('idle'); // idle, downloading, success, error
  const [downloadError, setDownloadError] = useState(null);

  // Referencia para limpieza
  const isMounted = useRef(true);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Maneja la subida de un archivo CSV de prestadores
   * @param {File} file - Archivo CSV a subir
   * @returns {Promise<Object>} Resultado de la operación
   */
  const uploadCSV = useCallback(async (file) => {
    if (!file) {
      setUploadError('No se seleccionó ningún archivo');
      return { status: 400, message: 'No se seleccionó ningún archivo' };
    }
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Solo se permiten archivos CSV');
      return { status: 400, message: 'Solo se permiten archivos CSV' };
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);
      setUploadResult(null);

      const result = await CartillaService.subirCartilla(file);

      if (isMounted.current) {
        setUploadResult(result);
        setUploadProgress(100);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Error al subir el archivo';
      if (isMounted.current) {
        setUploadError(errorMessage);
      }
      // Retornamos un objeto similar al de error para consistencia
      return { 
        status: error.response?.status || 500, 
        message: errorMessage,
        error: true 
      };
    } finally {
      if (isMounted.current) {
        setIsUploading(false);
      }
    }
  }, []);

  /**
   * Descarga la cartilla completa en formato CSV
   * @returns {Promise<Object>} Resultado de la operación
   */
  const downloadCSV = useCallback(async () => {
    try {
      setDownloadStatus('downloading');
      setDownloadError(null);
      
      const result = await CartillaService.descargarCartilla();
      
      if (isMounted.current) {
        setDownloadStatus('success');
      }
      
      return result;
    } catch (error) {
      if (isMounted.current) {
        setDownloadStatus('error');
        setDownloadError(error.message || 'Error al descargar la cartilla');
      }
      throw error;
    } finally {
      // Volver al estado 'idle' después de un breve tiempo
      setTimeout(() => {
        if (isMounted.current) {
          setDownloadStatus('idle');
        }
      }, 3000);
    }
  }, []);

  /**
   * Reinicia todos los estados relacionados con la carga
   */
  const resetUploadStatus = useCallback(() => {
    setUploadProgress(0);
    setUploadResult(null);
    setUploadError(null);
    setIsUploading(false);
  }, []);

  /**
   * Reinicia todos los estados relacionados con la descarga
   */
  const resetDownloadStatus = useCallback(() => {
    setDownloadStatus('idle');
    setDownloadError(null);
  }, []);

  return {
    // Estados de carga
    uploadProgress,
    uploadResult,
    uploadError,
    isUploading,
    
    // Estados de descarga
    downloadStatus,
    downloadError,
    
    // Métodos
    uploadCSV,
    downloadCSV,
    resetUploadStatus,
    resetDownloadStatus,
    
    // Helpers
    isDownloading: downloadStatus === 'downloading',
    hasDownloadError: downloadStatus === 'error',
    uploadSuccess: uploadResult?.status === 200,
    uploadData: uploadResult?.data || null
  };
};

export default useCartillaCSV;