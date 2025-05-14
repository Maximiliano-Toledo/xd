import { useState } from 'react'
import HeaderStaff from '../../layouts/HeaderStaff'
import { MdOutlineKeyboardDoubleArrowRight, MdSubdirectoryArrowLeft } from 'react-icons/md'
import { useNavigate } from 'react-router'
import { LuCircleUser } from 'react-icons/lu'
import useAuthStore from '../../stores/authStore'

export default function ChangePass() {
  const navigate = useNavigate()
  const { user, changePassword } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleVolver = () => {
    navigate(-1)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    // Limpiar errores cuando el usuario escribe
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return regex.test(password)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.oldPassword) {
      newErrors.oldPassword = 'La contraseña actual es requerida'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida'
    } else if (!validatePassword(formData.newPassword)) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la nueva contraseña'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (formData.oldPassword && formData.newPassword && formData.oldPassword === formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña no puede ser igual a la actual'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccessMessage('')

    if (!validateForm()) return

    try {
      await changePassword(formData.oldPassword, formData.newPassword)
      setSuccessMessage('Contraseña cambiada con éxito')
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      if (error.message === 'La contraseña actual es incorrecta') {
        setErrors({
          ...errors,
          oldPassword: error.message
        })
      } else {
        setErrors({
          ...errors,
          general: error.message || 'Ocurrió un error al cambiar la contraseña'
        })
      }
    }
  }

  return (
    <div>
      <HeaderStaff />
      <h1 className="w-25 fs-3 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 m-4 ">
        Panel usuario
      </h1>
      <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
        <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5 ms-4 me-4 ">
          <h6 className="fs-2 h1-titulo fw-bold border p-2 d-flex align-items-center">
            <div className="rounded-color d-flex justify-content-center align-items-center me-4">
              <MdOutlineKeyboardDoubleArrowRight className="fs-1 text-white" />
            </div>
            Editar contraseña
          </h6>
          <h2 className="fs-2 h1-titulo p-2 fw-normal">
            Modificá tu contraseña actual por una nueva de forma segura.
          </h2>
        </div>
      </div>

      <div className="d-flex justify-content-center align-items-start min-vh-75">
        <div className="w-100 d-flex flex-column border shadow-input rounded-3 shadow m-4">
          <div className="d-flex flex-column flex-md-row gap-5 justify-content-center m-4">
            {/* Sección de usuario */}
            <div
              className="border m-3 p-3 rounded-3 shadow"
              style={{ width: '25rem', height: '11rem' }}
            >
              <div className="card-body">
                <h6 className="subtitle-style fs-5 mb-3">Mi perfil</h6>
                <div className="d-flex align-items-start mb-2">
                  <LuCircleUser className="me-2 user-style" />
                  <div className="ms-1">
                    <h5 className="title-style fs-4 mb-0 mt-1">Usuario:</h5>
                    <p className="mb-0 fs-5">{user?.username || 'Usuario'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de cambiar contraseña */}
            <div
              className="border m-4 p-3 rounded-3 shadow"
              style={{ width: '29rem' }}
            >
              <form className="card-body" onSubmit={handleSubmit}>
                <h5 className="title-style fs-3">Cambiar contraseña</h5>

                {errors.general && (
                  <div className="alert alert-danger">{errors.general}</div>
                )}

                {successMessage && (
                  <div className="alert alert-success">{successMessage}</div>
                )}

                <div className="mb-4">
                  <label htmlFor="oldPassword" className="form-label">
                    Contraseña actual
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-control custom-input border shadow ${
                        errors.oldPassword ? 'is-invalid' : ''
                      }`}
                      id="oldPassword"
                      name="oldPassword"
                      value={formData.oldPassword}
                      onChange={handleChange}
                      placeholder="Ingresá tu contraseña actual"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="btn position-absolute end-0 top-50 translate-middle-y border-0 password-toggle"
                      onClick={togglePasswordVisibility}
                      aria-label={
                        showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                      }
                    >
                      <i
                        className={`bi ${
                          showPassword ? 'bi-eye-slash' : 'bi-eye'
                        } `}
                      ></i>
                    </button>
                    {errors.oldPassword && (
                      <div className="invalid-feedback">{errors.oldPassword}</div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="newPassword" className="form-label">
                    Nueva contraseña
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-control custom-input border shadow ${
                        errors.newPassword ? 'is-invalid' : ''
                      }`}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Nueva contraseña"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="btn position-absolute end-0 top-50 translate-middle-y border-0 password-toggle"
                      onClick={togglePasswordVisibility}
                      aria-label={
                        showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                      }
                    >
                      <i
                        className={`bi ${
                          showPassword ? 'bi-eye-slash' : 'bi-eye'
                        } `}
                      ></i>
                    </button>
                    {errors.newPassword && (
                      <div className="invalid-feedback">{errors.newPassword}</div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirmar nueva contraseña
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-control custom-input border shadow ${
                        errors.confirmPassword ? 'is-invalid' : ''
                      }`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirmar contraseña"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="btn position-absolute end-0 top-50 translate-middle-y border-0 password-toggle"
                      onClick={togglePasswordVisibility}
                      aria-label={
                        showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                      }
                    >
                      <i
                        className={`bi ${
                          showPassword ? 'bi-eye-slash' : 'bi-eye'
                        } `}
                      ></i>
                    </button>
                    {errors.confirmPassword && (
                      <div className="invalid-feedback">
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    className="btn btn-volver rounded-pill text-white text-uppercase"
                    type="submit"
                  >
                    Cambiar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <button
        className="btn btn-volver rounded-pill text-white text-center text-uppercase"
        type="submit"
        onClick={handleVolver}
      >
        <MdSubdirectoryArrowLeft className="text-white" /> Volver
      </button>
    </div>
  )
}