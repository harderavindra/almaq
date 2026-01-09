import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { hasAccess } from '../../utils/permissions';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <FiRefreshCw className="animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
``
  if (allowedRoles.length && !hasAccess(user.role, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
