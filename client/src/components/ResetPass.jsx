import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthService from '../api/services/authService';
import '../styles/login.css';
import Swal from 'sweetalert2';

const ResetPass = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Verificar el token al cargar el componente
  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) {
          throw new Error('Token no proporcionado');
        }
        
        const response = await AuthService.verifyTokenForgotPassword(token);
        setIsTokenValid(true);
      } catch (error) {
        setErrors({ general: error.message || 'El token no es válido o ha expirado' });
        navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token, navigate]);

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

    if (!formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (!validatePassword(formData.newPassword)) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la nueva contraseña';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await AuthService.resetPassword(token, formData.newPassword);
      
      // Mostrar SweetAlert de éxito
      await Swal.fire({
        title: '¡Contraseña cambiada!',
        text: 'Tu contraseña ha sido actualizada correctamente',
        icon: 'success',
        confirmButtonColor: '#64A70B',
      });
      
      // Redirigir al login después de aceptar
      navigate('/login');
    } catch (error) {
      setErrors({
        ...errors,
        general: error.message || 'Ocurrió un error al cambiar la contraseña'
      });

      // Mostrar SweetAlert de error
      await Swal.fire({
        title: 'Error',
        text: error.message || 'Ocurrió un error al cambiar la contraseña',
        icon: 'error',
        confirmButtonColor: '#64A70B',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="login-main d-flex justify-content-center align-items-center">
      <div className="container login-container">
        <div className="row">
          <div className="col-lg-7 col-md-6 login-form-container d-flex align-items-center justify-content-center">
            <div className="login-form-content p-3 p-sm-4 p-md-5">
              <h2 className="welcome-text mb-0">Restablecer contraseña</h2>
              <h1 className="login-title mb-4">Nueva contraseña</h1>

              {errors.general && (
                <div className="alert alert-danger" role="alert">
                  {errors.general}
                </div>
              )}

              {/* {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )} */}

              {isTokenValid && (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="form-label">
                      Nueva contraseña
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control custom-input ${errors.newPassword ? 'is-invalid' : ''}`}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Nueva contraseña"
                        disabled={!isTokenValid}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0 password-toggle"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
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
                        type={showPassword ? "text" : "password"}
                        className={`form-control custom-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirmar nueva contraseña"
                        disabled={!isTokenValid}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0 password-toggle"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                      {errors.confirmPassword && (
                        <div className="invalid-feedback">{errors.confirmPassword}</div>
                      )}
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <button 
                      type="submit" 
                      className="btn btn-login px-4 py-2"
                      disabled={!isTokenValid}
                    >
                      Cambiar contraseña
                    </button>
                  </div>

                  <div className="text-center">
                    <a href="/login" className="contact-admin">
                      Volver al inicio de sesión
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="col-lg-5 col-md-6 brand-container d-flex align-items-top justify-content-center">
            <div className="brand-content text-center">
              <img src="/amasalud.png" alt="amasalud" className="img-fluid logo-img" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResetPass;