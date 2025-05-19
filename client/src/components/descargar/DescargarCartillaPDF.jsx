"use client"

import { useState, useEffect } from "react"
import { FiDownload } from "react-icons/fi"
import CustomSelect from "../CustomSelect"
import { CartillaService } from "../../api/services/cartillaService" // Import CartillaService
import HeaderStaff from "../../layouts/HeaderStaff"
import { MdSubdirectoryArrowLeft } from "react-icons/md"
import { useNavigate } from "react-router"
import { Footer } from "../../layouts/Footer"
import '../../styles/cargar-cartilla.css'
import '../../styles/carga-individual.css'
import { PiNumberSquareOneLight } from "react-icons/pi";
import { PiNumberSquareTwoLight } from "react-icons/pi";

export const DescargarCartillaPDF = () => {
  const [options, setOptions] = useState({
    planes: [],
    provincias: [],
  })

  const [loading, setLoading] = useState({
    planes: false,
    provincias: false,
  })

  const [formData, setFormData] = useState({
    plan: "",
    provincia: "",
  })

  const [isDownloading, setIsDownloading] = useState(false)

  // Cargar planes inicialmente
  useEffect(() => {
    const fetchPlanes = async () => {
      setLoading((prev) => ({ ...prev, planes: true }))
      try {
        const planes = await CartillaService.getPlanes()
        setOptions((prev) => ({ ...prev, planes }))
      } catch (error) {
        console.error("Error al cargar planes:", error)
      } finally {
        setLoading((prev) => ({ ...prev, planes: false }))
      }
    }

    fetchPlanes()
  }, [])

  // Cargar provincias cuando se selecciona un plan
  useEffect(() => {
    const fetchProvincias = async () => {
      if (!formData.plan) {
        setOptions((prev) => ({ ...prev, provincias: [] }))
        return
      }

      setLoading((prev) => ({ ...prev, provinces: true }))
      try {
        const provincias = await CartillaService.getProvincias(formData.plan)
        setOptions((prev) => ({ ...prev, provincias }))
      } catch (error) {
        console.error("Error al cargar provincias:", error)
      } finally {
        setLoading((prev) => ({ ...prev, provincias: false }))
      }
    }

    fetchProvincias()
  }, [formData.plan])

  // Adaptador de opciones para CustomSelect
  const adaptarOpciones = (opciones, idKey, nombreKey) => {
    return opciones.map((opcion) => ({
      id: opcion[idKey],
      nombre: opcion[nombreKey],
    }))
  }

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Resetear provincia si se cambia el plan
      ...(name === "plan" && { provincia: "" }),
    }))
  }

  // Manejar descarga de PDF
  const handleDownloadPdf = async (e) => {
    e.preventDefault()

    if (!formData.plan || !formData.provincia) {
      alert("Por favor, seleccione un plan y una provincia")
      return
    }

    setIsDownloading(true)
    try {
      const { blob, filename } = await CartillaService.descargarCartillaPDF(formData.plan, formData.provincia)

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename // Usar el nombre del archivo del servidor
      document.body.appendChild(link)
      link.click()

      // Limpieza
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error("Error al descargar PDF:", error)
      alert(error.message || "No se pudo descargar el PDF. Intente nuevamente.")
    } finally {
      setIsDownloading(false)
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
          <h1 className="w-50 fs-4 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0">
             Descargá en PDF
          </h1>


          
        <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
          <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5">
            <h6 className="fs-3 h1-titulo fw-bold">
              Seleccione su plan y provincia para descargar la cartilla en PDF.
            </h6>
          </div>
        </div>

        <button className="btn btn-volver rounded-pill text-white fw-bolder text-center text-uppercase mt-4 ms-4"
                type="submit"
                onClick={handleVolver}>
                <MdSubdirectoryArrowLeft className="text-white"/> Volver
        </button>


       {/**div que envuelve al formulario */}
      <div className="d-flex justify-content-center align-items-start min-vh-50">
        <div className="w-75 d-flex flex-column border shadow-input p-4 rounded-3 shadow mt-5 mb-5">
          <h6 className="fs-4 text-center subtitle-dashboard mb-4">Descargar Cartilla Médica</h6>
        


            {/**Formulario de descarga */}
            <form onSubmit={handleDownloadPdf}>
              <div className="d-flex flex-column gap-4 mb-4">
                  {/**Select de planes */}
                  <div className="form-group mx-auto w-75 w-md-50 p-3 border rounded shadow">
                    <h6 className='fw-bold subtitle-dashboard text-break'>
                      <PiNumberSquareOneLight className="fs-4 fw-bold"/> Seleccione su Plan
                    </h6>
                    <CustomSelect
                      options={adaptarOpciones(options.planes, "id_plan", "nombre")}
                      value={formData.plan}
                      onChange={handleChange}
                      name="plan"
                      placeholder="Seleccione su plan"
                      disabled={loading.planes}
                      loading={loading.planes}
                      className="p-2 mb-3"
                    />
                    
                    {/**Select de provincia */}
                    <h6 className='fw-bold subtitle-dashboard text-break'>
                      <PiNumberSquareTwoLight className="fs-4 fw-bold me-1"/>
                      Seleccione la provincia
                    </h6>
                    <CustomSelect
                      options={adaptarOpciones(options.provincias, "id_provincia", "nombre")}
                      value={formData.provincia}
                      onChange={handleChange}
                      name="provincia"
                      placeholder="Seleccione la provincia"
                      disabled={!formData.plan || loading.provincias}
                      loading={loading.provincias}
                      className="p-2"
                    />
                  </div>
                  
                  <div className="d-flex justify-content-center">
                    <div className="form-group w-100 w-sm-50 w-md-25 d-flex">
                      <button
                        type="submit"
                        className="btn btn-search rounded-pill text-white text-center text-uppercase fs-6 d-flex align-items-center flex-wrap mx-auto"
                        
                        disabled={
                          !formData.plan || !formData.provincia || loading.planes || loading.provincias || isDownloading
                        }
                      >
                        {isDownloading ? (
                          <span className="text-truncate">Descargando...</span>
                        ) : (
                          <>
                            <FiDownload className="fs-5 me-2" /> 
                            <span className="text-truncate">Descargar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
              </div>
            </form>
        </div>
      </div>
       <Footer/>

    </div>
  )
}
