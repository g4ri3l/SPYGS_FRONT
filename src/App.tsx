import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './context/I18nContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import FavoritesPage from './pages/FavoritesPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import AddressesPage from './pages/AddressesPage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminSatisfaction from './pages/AdminSatisfaction';
import AdminRoute from './components/AdminRoute';
import './App.css';

// Componente para proteger rutas
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <FavoritesProvider>
                <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    element={
                      <ProtectedRoute>
                        <>
                          <Navbar />
                          <Outlet />
                        </>
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/:id" element={<OrderDetailsPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/addresses" element={<AddressesPage />} />
                    <Route path="/payment-methods" element={<PaymentMethodsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/orders"
                      element={
                        <AdminRoute>
                          <AdminOrders />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/satisfaction"
                      element={
                        <AdminRoute>
                          <AdminSatisfaction />
                        </AdminRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Route>
                </Routes>
                </BrowserRouter>
              </FavoritesProvider>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}

export default App;
