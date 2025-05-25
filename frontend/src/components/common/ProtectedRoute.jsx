import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { hasAccess } from '../../utils/permissions';

const ProtectedRoute = ({ isAuthenticated, userRole, allowedRoles = [], children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length && !hasAccess(userRole, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
