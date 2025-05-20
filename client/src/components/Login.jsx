import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAuthStore from "../stores/authStore";
import "../styles/login.css";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { login, isAuthenticated, checkAuth } = useAuthStore();

    // Verificar autenticación al cargar el componente
    useEffect(() => {
      const verifyAuth = async () => {
        try {
          const response = await checkAuth();
          if (isAuthenticated) {
            const user = response.data;
            const redirectPath = user?.role === 'admin' 
              ? '/admin/dashboard' 
              : '/user/dashboard';
            navigate(redirectPath, { replace: true });
          }
        } catch (error) {
          navigate('/login', { replace: true });
        } finally {
          setIsCheckingAuth(false);
        }
      };
  
      verifyAuth();
    }, [navigate, checkAuth, isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Llamar al servicio de autenticación
      const response = await login(formData);

      // 2. Verificar si la respuesta es exitosa
      if (response.data) {
        const user = response.data.user;
        if (user) {
          // 3. Redirigir según el rol del usuario
          const redirectPath = user.role === 'admin' 
            ? '/admin/dashboard' 
            : '/user/dashboard';
          
          navigate(redirectPath);
        } else {
          setError("No se pudo verificar la sesión. Intente nuevamente.");
        }
      } else {
        // Manejar errores específicos del backend
        setError(response?.message || "Credenciales incorrectas");
      }
    } catch (error) {
      // Manejar errores de red o del servidor
      setError(error.message || "Error de conexión. Por favor intente nuevamente.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <main className="login-main d-flex justify-content-center align-items-center">
      <div className="container login-container">
        <div className="row">
          <div className="col-lg-7 col-md-6 login-form-container d-flex align-items-center justify-content-center">
            <div className="login-form-content p-3 p-sm-4 p-md-5">
              <h2 className="welcome-text mb-0">Bienvenido!</h2>
              <h1 className="login-title mb-4">Ingreso</h1>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Usuario
                  </label>
                  <input
                    type="text"
                    className="form-control custom-input"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="usuario"
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    Contraseña
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control custom-input"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="************"
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0 password-toggle"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      disabled={isLoading}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <button 
                    type="submit" 
                    className="btn btn-login px-4 py-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        INGRESAR <i className="bi bi-arrow-right"></i>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <p className="mb-1 forgot-password">Olvido su contraseña?</p>
                  <a href="#" className="contact-admin">
                    Comuníquese con el administrador
                  </a>
                </div>
              </form>
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

export default Login;