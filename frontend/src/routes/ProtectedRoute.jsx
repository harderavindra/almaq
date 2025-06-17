import { FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import DropletLoader from '../components/common/DropletLoader';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div className='w-full h-screen flex items-center justify-center'>
    {/* <FiRefreshCw className='animate-spin' /> */}
          <DropletLoader className='' />

  </div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
