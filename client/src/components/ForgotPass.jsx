import { useState } from "react";
import { useNavigate } from "react-router";
import AuthService from "../api/services/authService";
import "../styles/login.css";

const ForgotPass = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const response = await AuthService.forgotPassword(email);
      setSuccessMessage(response.message || "Se ha enviado un correo con las instrucciones para restablecer tu contraseña");
    } catch (error) {
      setError(error.message || "Ocurrió un error al procesar tu solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-main d-flex justify-content-center align-items-center">
      <div className="container login-container">
        <div className="row">
          <div className="col-lg-7 col-md-6 login-form-container d-flex align-items-center justify-content-center">
            <div className="login-form-content p-3 p-sm-4 p-md-5">
              <h2 className="welcome-text mb-0">Recuperar contraseña</h2>
              <h1 className="login-title mb-4">Ingresa tu email</h1>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    className="form-control custom-input"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    disabled={isLoading}
                    autoComplete="email"
                    required
                  />
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
                        Recuperar contraseña
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <a href="/login" className="contact-admin">
                    Volver al inicio de sesión
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

export default ForgotPass;