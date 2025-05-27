"use client"

import { useState, useEffect, useRef } from "react"
import { FiUpload } from "react-icons/fi"
import CustomSelect from "../CustomSelect"
import { CartillaService } from "../../api/services/cartillaService"
import HeaderStaff from "../../layouts/HeaderStaff"
import { MdSubdirectoryArrowLeft } from "react-icons/md"
import { useNavigate } from "react-router"
import { Footer } from "../../layouts/Footer"
import "../../styles/cargar-cartilla.css"
import "../../styles/carga-individual.css"
import "../../styles/carga-pdf.css"
import { PiNumberSquareOneLight } from "react-icons/pi"
import { PiNumberSquareTwoLight } from "react-icons/pi"
import { PiNumberSquareThreeLight } from "react-icons/pi"
import Swal from "sweetalert2"
import "../../styles/panel-usuario-nuevo.css"

export const CargaPortadaPDF = () => {
  const [options, setOptions] = useState({
    planes: [],
    provincias: [],
  })

  const [loading, setLoading] = useState({
    planes: false,
    provincias: false,
    uploading: false,
  })

  const [formData, setFormData] = useState({
    plan: "",
    provincia: "",
    pdfFile: null,
  })

  const [filePreview, setFilePreview] = useState(null)

  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  // Cargar planes inicialmente
  useEffect(() => {
    const fetchPlanes = async () => {
      setLoading((prev) => ({ ...prev, planes: true }))
      try {
        const planes = await CartillaService.getPlanes()
        setOptions((prev) => ({ ...prev, planes }))
      } catch (error) {
        console.error("Error al cargar planes:", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los planes",
          confirmButtonColor: "#64A70B",
        })
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

      setLoading((prev) => ({ ...prev, provincias: true }))
      try {
        const provincias = await CartillaService.getProvincias(formData.plan)
        setOptions((prev) => ({ ...prev, provincias }))
      } catch (error) {
        console.error("Error al cargar provincias:", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar las provincias",
          confirmButtonColor: "#64A70B",
        })
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

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileSelection(droppedFiles[0])
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  const handleFileSelection = (file) => {
    if (file) {
      // Validar que sea PDF
      if (file.type !== "application/pdf") {
        Swal.fire({
          icon: "error",
          title: "Formato incorrecto",
          text: "Por favor, seleccione un archivo PDF",
          confirmButtonColor: "#64A70B",
        })
        return
      }

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "Archivo demasiado grande",
          text: "El archivo no debe superar los 10MB",
          confirmButtonColor: "#64A70B",
        })
        return
      }

      setFormData((prev) => ({ ...prev, pdfFile: file }))
      setFilePreview(file.name)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    handleFileSelection(file)
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.plan || !formData.provincia) {
      Swal.fire({
        icon: "error",
        title: "Datos incompletos",
        text: "Por favor, seleccione un plan y una provincia",
        confirmButtonColor: "#64A70B",
      })
      return
    }

    if (!formData.pdfFile) {
      Swal.fire({
        icon: "error",
        title: "Archivo faltante",
        text: "Por favor, seleccione un archivo PDF",
        confirmButtonColor: "#64A70B",
      })
      return
    }

    setLoading((prev) => ({ ...prev, uploading: true }))

    try {
      await CartillaService.subirPortadaPDF(formData.plan, formData.provincia, formData.pdfFile)

      Swal.fire({
        icon: "success",
        title: "¡Portada actualizada!",
        text: "El PDF se ha subido correctamente",
        confirmButtonColor: "#64A70B",
      })

      // Resetear formulario después de éxito
      setFormData({
        plan: formData.plan, // Mantener el plan seleccionado
        provincia: formData.provincia, // Mantener la provincia seleccionada
        pdfFile: null,
      })
      setFilePreview(null)
    } catch (error) {
      console.error("Error al subir PDF:", error)
      Swal.fire({
        icon: "error",
        title: "Error al subir",
        text: error.message || "No se pudo subir el PDF. Intente nuevamente.",
        confirmButtonColor: "#64A70B",
      })
    } finally {
      setLoading((prev) => ({ ...prev, uploading: false }))
    }
  }

  // Para el botón de volver
  const navigate = useNavigate()
  const handleVolver = () => {
    navigate(-1)
  }

  return (
    <div>
      <HeaderStaff />
      <h1 className="w-50 fs-4 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 ms-4 me-4">
        Actualizar Portada PDF
      </h1>

      <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
        <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5 ms-4 me-4">
          <h6 className="fs-3 h1-titulo fw-bold">Seleccione plan, provincia y suba el nuevo PDF de portada.</h6>
        </div>
      </div>

      <div className="d-flex justify-content-center align-items-start min-vh-50">
        <div className="w-75 d-flex flex-column border shadow-input p-4 rounded-3 shadow mt-5 mb-5">
          <h6 className="fs-4 text-center subtitle-dashboard mb-4">Actualizar Portada</h6>

          <form onSubmit={handleSubmit}>
            <div className="d-flex flex-column gap-4 mb-4">
              {/* Select de planes */}
              <div className="form-group mx-auto w-75 w-md-50 p-3 border rounded shadow">
                <h6 className="fw-bold subtitle-dashboard text-break">
                  <PiNumberSquareOneLight className="fs-4 fw-bold" /> Seleccione el Plan
                </h6>
                <CustomSelect
                  options={adaptarOpciones(options.planes, "id_plan", "nombre")}
                  value={formData.plan}
                  onChange={handleChange}
                  name="plan"
                  placeholder="Seleccione el plan"
                  disabled={loading.planes}
                  loading={loading.planes}
                  className="p-2 mb-3"
                />

                {/* Select de provincia */}
                <h6 className="fw-bold subtitle-dashboard text-break">
                  <PiNumberSquareTwoLight className="fs-4 fw-bold me-1" />
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
                  className="p-2 mb-3"
                />

                {/* Selector de archivo PDF con Drag & Drop */}
                <h6 className="fw-bold subtitle-dashboard text-break">
                  <PiNumberSquareThreeLight className="fs-4 fw-bold me-1" />
                  Seleccione el archivo PDF
                </h6>
                <div
                  className={`file-input-container drag-drop-zone ${isDragging ? "dragging" : ""}`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  style={{
                    cursor: "pointer",
                    border: `2px dashed ${isDragging ? "#64A70B" : "#ccc"}`,
                    borderRadius: "8px",
                    padding: "20px",
                    textAlign: "center",
                    backgroundColor: isDragging ? "#f0f8e8" : "#f9f9f9",
                    transition: "all 0.3s ease",
                    marginBottom: "10px",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    disabled={loading.uploading}
                  />

                  <div className="d-flex flex-column align-items-center">
                    <FiUpload className="fs-1 mb-2" style={{ color: isDragging ? "#64A70B" : "#666" }} />

                    {filePreview ? (
                      <div className="text-center">
                        <p className="fw-bold text-success mb-1">Archivo seleccionado:</p>
                        <p className="mb-2">{filePreview}</p>
                        <small className="text-muted">Haz clic para cambiar el archivo</small>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="fw-bold mb-1">
                          {isDragging ? "Suelta el archivo aquí" : "Arrastra y suelta tu archivo PDF aquí"}
                        </p>
                        <p className="text-muted mb-2">o haz clic para seleccionar</p>
                        <small className="text-muted">Formato aceptado: PDF (máx. 10MB)</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-center">
                <div className="form-group w-100 w-sm-50 w-md-25 d-flex">
                  <button
                    type="submit"
                    className="btn btn-search rounded-pill text-white text-center text-uppercase fs-6 d-flex align-items-center flex-wrap mx-auto"
                    disabled={
                      !formData.plan ||
                      !formData.provincia ||
                      !formData.pdfFile ||
                      loading.planes ||
                      loading.provincias ||
                      loading.uploading
                    }
                  >
                    {loading.uploading ? (
                      <span className="text-truncate">Subiendo...</span>
                    ) : (
                      <>
                        <FiUpload className="fs-5 me-2" />
                        <span className="text-truncate">Subir Portada</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="back-button-container">
        <button className="back-button" onClick={handleVolver}>
          <MdSubdirectoryArrowLeft />
          <span>Volver</span>
        </button>
      </div>

      <Footer />
    </div>
  )
}
