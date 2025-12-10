import { useState, useEffect } from 'react';
import { useI18n } from '../context/I18nContext';
import Loading from '../components/Loading';
import AdminNav from '../components/AdminNav';
import { useNotifications } from '../context/NotificationContext';
import { adminAPI } from '../services/adminAPI';

interface Delivery {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Disponible' | 'En camino' | 'Ocupado' | 'Fuera de servicio';
  currentLocation?: {
    lat: number;
    lng: number;
  };
  rating: number;
  totalDeliveries: number;
  activeOrders: number;
  lastUpdate?: string;
}

interface DeliveryStats {
  total: number;
  available: number;
  busy: number;
  offline: number;
  averageRating: number;
  totalDeliveriesToday: number;
}

const AdminDashboard = () => {
  const { t } = useI18n();
  const { addNotification } = useNotifications();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [stats, setStats] = useState<DeliveryStats>({
    total: 0,
    available: 0,
    busy: 0,
    offline: 0,
    averageRating: 0,
    totalDeliveriesToday: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showTracking, setShowTracking] = useState(false);

  useEffect(() => {
    loadDeliveries();
    const interval = setInterval(loadDeliveries, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const loadDeliveries = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getDeliveries();
      const deliveriesData = data.deliveries || data || [];
      
      const formattedDeliveries: Delivery[] = deliveriesData.map((d: any) => ({
        id: d.id,
        name: d.name,
        email: d.email,
        phone: d.phone || 'No especificado',
        status: d.status,
        currentLocation: d.currentLocation || undefined,
        rating: d.rating || 0,
        totalDeliveries: d.totalDeliveries || 0,
        activeOrders: d.activeOrders || 0,
        lastUpdate: d.lastUpdate
      }));

      setDeliveries(formattedDeliveries);
      
      // Calcular estadísticas
      const total = formattedDeliveries.length;
      const available = formattedDeliveries.filter(d => d.status === 'Disponible').length;
      const busy = formattedDeliveries.filter(d => d.status === 'En camino' || d.status === 'Ocupado').length;
      const offline = formattedDeliveries.filter(d => d.status === 'Fuera de servicio').length;
      const averageRating = total > 0 
        ? formattedDeliveries.reduce((sum, d) => sum + d.rating, 0) / total 
        : 0;
      const totalDeliveriesToday = formattedDeliveries.reduce((sum, d) => sum + d.totalDeliveries, 0);

      setStats({
        total,
        available,
        busy,
        offline,
        averageRating,
        totalDeliveriesToday
      });
    } catch (err: any) {
      console.error('Error al cargar delivery:', err);
      addNotification({
        title: t('common.error'),
        message: err.message || 'Error al cargar información de delivery',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'Disponible':
        return 'bg-green-100 text-green-800';
      case 'En camino':
        return 'bg-blue-100 text-blue-800';
      case 'Ocupado':
        return 'bg-yellow-100 text-yellow-800';
      case 'Fuera de servicio':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <Loading fullScreen text={t('common.loading')} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-fixed p-8">
      <div className="max-w-7xl mx-auto">
        <AdminNav />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Panel de Administración - Delivery
        </h1>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Delivery</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Disponibles</p>
                <p className="text-3xl font-bold text-green-600">{stats.available}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Calificación Promedio</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Entregas Hoy</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalDeliveriesToday}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Delivery */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personal de Delivery</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Calificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Entregas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pedidos Activos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-semibold">
                          {delivery.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{delivery.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{delivery.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                        {delivery.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{delivery.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {delivery.totalDeliveries}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {delivery.activeOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedDelivery(delivery);
                            setShowTracking(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Ver seguimiento"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            // TODO: Ver detalles del delivery
                            addNotification({
                              title: 'Detalles',
                              message: `Ver detalles de ${delivery.name}`,
                              type: 'info'
                            });
                          }}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Ver detalles"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Seguimiento */}
        {showTracking && selectedDelivery && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Seguimiento: {selectedDelivery.name}
                </h2>
                <button
                  onClick={() => setShowTracking(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedDelivery.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Calificación</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedDelivery.rating.toFixed(1)} ⭐</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pedidos Activos</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedDelivery.activeOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Entregas</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedDelivery.totalDeliveries}</p>
                    </div>
                  </div>
                </div>

                {selectedDelivery.currentLocation && (
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ubicación Actual</p>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm text-gray-900 dark:text-white">
                        Lat: {selectedDelivery.currentLocation.lat.toFixed(4)}, Lng: {selectedDelivery.currentLocation.lng.toFixed(4)}
                      </span>
                    </div>
                    <div className="mt-4 h-64 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        Mapa de seguimiento en tiempo real
                        <br />
                        <span className="text-xs">(Integrar con Google Maps API o similar)</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

