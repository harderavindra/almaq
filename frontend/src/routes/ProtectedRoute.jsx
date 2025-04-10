import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  
  return user ?  <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
