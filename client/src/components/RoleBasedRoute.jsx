import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const RoleBasedRoute = ({ allowedRoles, children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const verifyAccess = () => {
      if (isAuthenticated && user?.role) {
        const accessGranted = allowedRoles.includes(user.role);
        setHasAccess(accessGranted);
      }
      setIsChecking(false);
    };

    verifyAccess();
  }, [allowedRoles, isAuthenticated, user?.role]);

  if (isChecking) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
};

export default RoleBasedRoute;