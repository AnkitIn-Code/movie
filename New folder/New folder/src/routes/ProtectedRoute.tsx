import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireProvider?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true, requireProvider = false }: ProtectedRouteProps) {
  const { isAuthenticated, role, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={requireProvider ? '/provider/login' : '/login'} replace />;
  }

  if (requireProvider && role !== 'provider') {
    return <Navigate to="/provider/login" replace />;
  }

  return <>{children}</>;
}
