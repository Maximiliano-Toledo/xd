import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import useAuthStore from '../stores/authStore';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  useEffect(() => {
    const performLogout = async () => {
      await logout();
      navigate('/login', { replace: true });
    };
    
    performLogout();
  }, [logout, navigate]);

  // Mientras se procesa el logout
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cerrando sesión...</span>
      </div>
    </div>
  );
};

export default Logout;