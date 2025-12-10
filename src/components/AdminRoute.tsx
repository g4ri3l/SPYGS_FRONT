import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

interface AdminRouteProps {
  children: React.ReactElement;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return <Loading fullScreen text="Verificando acceso..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-fixed flex items-center justify-center p-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No tienes permisos para acceder al panel de administración.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;

