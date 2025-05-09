import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import useAuthStore from '../stores/authStore';

const RoleBasedRoute = ({ allowedRoles }) => {
  const [isChecking, setIsChecking] = useState(true);
  const { isAuthenticated, verifyRole } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const verifyAccess = async () => {
      await verifyRole(allowedRoles);
      setIsChecking(false);
    };
    
    if (isAuthenticated) {
      verifyAccess();
    } else {
      setIsChecking(false);
    }
  }, [allowedRoles, isAuthenticated, verifyRole]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isChecking) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default RoleBasedRoute;