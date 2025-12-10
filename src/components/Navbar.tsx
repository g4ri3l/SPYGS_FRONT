import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const { t, language, changeLanguage, availableLanguages } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y nombre */}
          <div className="flex items-center">
            <Link to="/home" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">PedidosPro</span>
            </Link>
          </div>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/home"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/orders"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {t('nav.orders')}
            </Link>
            <Link
              to="/favorites"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {t('nav.favorites')}
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Iconos de acción */}
          <div className="flex items-center space-x-4">
            {/* Carrito */}
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notificaciones */}
            <NotificationDropdown />

            {/* Selector de Idioma */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Cambiar idioma"
              >
                <span className="text-xl">
                  {availableLanguages.find(lang => lang.code === language)?.flag || '🌐'}
                </span>
              </button>
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-50">
                  <div className="py-1">
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setIsLanguageOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          language === lang.code
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                        {language === lang.code && (
                          <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Perfil */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Menú desplegable del perfil */}
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsProfileOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-20">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Usuario'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'usuario@email.com'}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Mi Perfil
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Mis Pedidos
                      </Link>
                      <Link
                        to="/addresses"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Direcciones
                      </Link>
                      <Link
                        to="/payment-methods"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Métodos de Pago
                      </Link>
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Panel de Administración
                        </Link>
                      )}
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Configuración
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Menú móvil */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <Link
              to="/home"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/orders"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('nav.orders')}
            </Link>
            <Link
              to="/favorites"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('nav.favorites')}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;


