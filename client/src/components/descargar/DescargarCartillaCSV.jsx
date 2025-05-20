"use client"

import { MdCloudDownload, MdSubdirectoryArrowLeft } from "react-icons/md"
import useCartillaCSV from "../../hooks/useCartillaCSV"
import Swal from "sweetalert2"
import HeaderStaff from "../../layouts/HeaderStaff"
import { useNavigate } from "react-router"
import { Footer } from "../../layouts/Footer"
import '../../styles/panel-usuario-nuevo.css'

export const DescargarCartillaCSV = () => {
  const { downloadCSV, downloadStatus, downloadError, isDownloading, hasDownloadError, resetDownloadStatus } =
    useCartillaCSV()

  const handleDownload = async () => {
    try {
      await downloadCSV()

      Swal.fire({
        icon: "success",
        title: "Descarga exitosa",
        text: "La cartilla se ha descargado correctamente",
        confirmButtonColor: "#64A70B",
      })

      resetDownloadStatus()
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error en la descarga",
        text: downloadError || "Ocurrió un error al descargar la cartilla",
        confirmButtonColor: "#64A70B",
      })

      resetDownloadStatus()
    }
  }

   //para el botón del volver
   const navigate = useNavigate();
    const handleVolver = () => {
        navigate(-1);
    };

  return (
    <div>
         <HeaderStaff />
          <h1 className="w-50 fs-4 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 ms-4 me-4">
            Descargá en CSV
          </h1>
  
        <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
          <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5 ms-4 me-4">
            <h6 className="fs-3 h1-titulo fw-bold">
              Descargue la cartilla completa en formato CSV
            </h6>
          </div>
        </div>

        <div className="d-flex justify-content-center align-items-start min-vh-25">
          <div className="w-100 d-flex flex-column border shadow-input p-4 rounded-3 shadow mt-5 ms-4 me-4">
            <h6 className="fs-4 text-center subtitle-dashboard mb-4">Descargar cartilla completa</h6>
            

            <div className="d-flex justify-content-center mb-4">
              <button
                className="btn btn-search rounded-pill text-white text-center text-uppercase fs-6"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Descargando...
                  </>
                ) : (
                  <>
                    <MdCloudDownload className="me-2" size={20} />
                    Descargar cartilla CSV
                  </>
                )}
              </button>
            </div>

            {hasDownloadError && <div className="alert alert-danger mt-3">{downloadError}</div>}
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
