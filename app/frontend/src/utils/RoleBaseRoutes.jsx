import { useAuth } from '../context/useAuth';
import { Navigate } from 'react-router-dom';
export default function RoleBaseRoutes({ children, requiredRole }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!requiredRole.includes(user.role)) return <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/employee-dashboard'} replace />;
  return children;
}
