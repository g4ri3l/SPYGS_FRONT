import { Link, useLocation } from 'react-router-dom';

const AdminNav = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          <Link
            to="/admin"
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              isActive('/admin') && location.pathname === '/admin'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/orders"
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              isActive('/admin/orders')
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Gestión de Pedidos
          </Link>
          <Link
            to="/admin/satisfaction"
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              isActive('/admin/satisfaction')
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Satisfacción del Cliente
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default AdminNav;

