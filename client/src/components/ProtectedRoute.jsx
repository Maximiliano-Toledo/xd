import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router';
import useAuthStore from '../stores/authStore';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, checkAuth, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificación inicial de autenticación
    const verifySession = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Session verification failed:', error);
        navigate('/');
      }
    };
    
    verifySession();

    // Renovación del token
    const verifyRefresh = () => {
      if (isAuthenticated) {
        refreshToken().catch(error => {
          console.error('Token refresh failed:', error);
          navigate('/');
        });
      }
    };
    
    const verificationInterval = setInterval(verifySession, 30 * 60 * 1000);
    
    const refreshInterval = setInterval(verifyRefresh, 55 * 60 * 1000);
    
    return () => {
      clearInterval(verificationInterval);
      clearInterval(refreshInterval);
    };
  }, [checkAuth, refreshToken, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;