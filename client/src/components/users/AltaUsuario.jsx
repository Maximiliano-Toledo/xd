import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdOutlineKeyboardDoubleArrowRight, MdSubdirectoryArrowLeft } from 'react-icons/md';
import AuthService from '../../api/services/authService';
import HeaderStaff from '../../layouts/HeaderStaff';
import '../../styles/panel-usuario-nuevo.css';

export default function AltaUsuario() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    rol: 'user', // Valor por defecto
    password: '',
    confirmPassword: ''
  });

  const handleVolver = () => {
    navigate(-1);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Limpiar errores cuando el usuario escribe
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.rol) {
      newErrors.rol = 'Debe seleccionar un rol';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) return;

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        rol: formData.rol,
        password: formData.password
      };

      await AuthService.register(userData);
      setSuccessMessage('Usuario creado con éxito');
      // Limpiar formulario después de éxito
      setFormData({
        username: '',
        email: '',
        rol: 'user',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      if (error.message === 'El nombre de usuario ya existe') {
        setErrors({
          ...errors,
          username: error.message
        });
      } else if (error.message === 'El email ya está registrado') {
        setErrors({
          ...errors,
          email: error.message
        });
      } else {
        setErrors({
          ...errors,
          general: error.message || 'Ocurrió un error al registrar el usuario'
        });
      }
    }
  };

  return (
    <div>
      <HeaderStaff />
      <div className="container-fluid px-3 px-md-4">
        <h1 className="fs-3 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-3 mb-3">
          Panel usuario
        </h1>
        
        <div className="row justify-content-center mb-4">
          <div className="col-12">
            <div className="border shadow-input p-3 rounded-3 shadow">
              <h6 className="fs-4 fs-md-2 h1-titulo fw-bold border p-2 d-flex align-items-center">
                <div className="rounded-color d-flex justify-content-center align-items-center me-2 me-md-4">
                  <MdOutlineKeyboardDoubleArrowRight className="fs-3 fs-md-1 text-white" />
                </div>
                <span>Alta de usuario</span>
              </h6>
              <h2 className="fs-5 fs-md-2 h1-titulo p-2 fw-normal">
                Complete el formulario para dar de alta un nuevo usuario.
              </h2>
            </div>
          </div>
        </div>

        <div className="row justify-content-center mb-4">
          <div className="col-12">
            <div className="border shadow-input rounded-3 shadow">
              <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                  <div className="border m-3 p-3 rounded-3 shadow">
                    <form className="card-body" onSubmit={handleSubmit}>
                      <h5 className="title-style fs-3">Nuevo usuario</h5>

                      {errors.general && (
                        <div className="alert alert-danger">{errors.general}</div>
                      )}

                      {successMessage && (
                        <div className="alert alert-success">{successMessage}</div>
                      )}

                      <div className="mb-3">
                        <label htmlFor="username" className="form-label">
                          Nombre de usuario
                        </label>
                        <input
                          type="text"
                          className={`form-control custom-input border shadow ${
                            errors.username ? 'is-invalid' : ''
                          }`}
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="Ingrese el nombre de usuario"
                        />
                        {errors.username && (
                          <div className="invalid-feedback">{errors.username}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                          Email
                        </label>
                        <input
                          type="email"
                          className={`form-control custom-input border shadow ${
                            errors.email ? 'is-invalid' : ''
                          }`}
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Ingrese el email"
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="rol" className="form-label">
                          Rol
                        </label>
                        <select
                          className={`form-select custom-input border shadow ${
                            errors.rol ? 'is-invalid' : ''
                          }`}
                          id="rol"
                          name="rol"
                          value={formData.rol}
                          onChange={handleChange}
                        >
                          <option value="user">Usuario</option>
                          <option value="admin">Administrador</option>
                          <option value="staff">Staff</option>
                        </select>
                        {errors.rol && (
                          <div className="invalid-feedback">{errors.rol}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                          Contraseña
                        </label>
                        <div className="position-relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className={`form-control custom-input border shadow ${
                              errors.password ? 'is-invalid' : ''
                            }`}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Ingrese la contraseña"
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
                          {errors.password && (
                            <div className="invalid-feedback">{errors.password}</div>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label">
                          Confirmar contraseña
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
                            placeholder="Confirme la contraseña"
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
                          Registrar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón volver */}
        <div className="back-button-container mb-4 text-center text-md-start">
          <button className="back-button" onClick={handleVolver}>
            <MdSubdirectoryArrowLeft />
            <span>Volver</span>
          </button>
        </div>
      </div>
    </div>
  );
}