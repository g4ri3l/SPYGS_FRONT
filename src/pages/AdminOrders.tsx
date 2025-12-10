import { useState, useEffect } from 'react';
import { useI18n } from '../context/I18nContext';
import Loading from '../components/Loading';
import AdminNav from '../components/AdminNav';
import { useNotifications } from '../context/NotificationContext';

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  customer: {
    name: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
  };
  delivery?: {
    id: string;
    name: string;
    rating: number;
  };
  estimatedTime?: number; // minutos
}

interface DeliveryOption {
  id: string;
  name: string;
  rating: number;
  distance: number; // km
  estimatedTime: number; // minutos
  status: string;
  currentOrders: number;
}

const AdminOrders = () => {
  const { t } = useI18n();
  const { addNotification } = useNotifications();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableDeliveries, setAvailableDeliveries] = useState<DeliveryOption[]>([]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000); // Actualizar cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      // TODO: Implementar API real
      // Mock data
      const mockOrders: Order[] = [
        {
          id: 'ORD-001',
          date: new Date().toISOString(),
          status: 'Pendiente',
          total: 45.50,
          customer: { name: 'Ana García', phone: '+51 999 111 222' },
          address: { street: 'Av. Principal 123', city: 'Lima' }
        },
        {
          id: 'ORD-002',
          date: new Date().toISOString(),
          status: 'En preparación',
          total: 32.00,
          customer: { name: 'Luis Martínez', phone: '+51 999 333 444' },
          address: { street: 'Jr. Los Olivos 456', city: 'Lima' },
          delivery: { id: '1', name: 'Juan Pérez', rating: 4.8 }
        }
      ];

      setOrders(mockOrders);
      setPendingOrders(mockOrders.filter(o => o.status === 'Pendiente' || o.status === 'En preparación'));
    } catch (err: any) {
      addNotification({
        title: t('common.error'),
        message: 'Error al cargar pedidos',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignDelivery = async (orderId: string) => {
    setSelectedOrder(orders.find(o => o.id === orderId) || null);
    
    // Calcular delivery más cercano y disponible
    if (selectedOrder) {
      const deliveries = await calculateBestDelivery(selectedOrder);
      setAvailableDeliveries(deliveries);
      setShowAssignModal(true);
    }
  };

  const calculateBestDelivery = async (order: Order): Promise<DeliveryOption[]> => {
    // TODO: Implementar algoritmo real de cálculo de distancia
    // Por ahora, mock data
    return [
      {
        id: '1',
        name: 'Juan Pérez',
        rating: 4.8,
        distance: 2.3,
        estimatedTime: 15,
        status: 'Disponible',
        currentOrders: 0
      },
      {
        id: '2',
        name: 'María García',
        rating: 4.9,
        distance: 3.1,
        estimatedTime: 20,
        status: 'Disponible',
        currentOrders: 0
      },
      {
        id: '3',
        name: 'Carlos López',
        rating: 4.6,
        distance: 1.8,
        estimatedTime: 12,
        status: 'Disponible',
        currentOrders: 1
      }
    ].sort((a, b) => {
      // Ordenar por: tiempo estimado, luego por rating
      if (a.estimatedTime !== b.estimatedTime) {
        return a.estimatedTime - b.estimatedTime;
      }
      return b.rating - a.rating;
    });
  };

  const assignToDelivery = async (orderId: string, deliveryId: string) => {
    try {
      // TODO: Implementar API real
      // await adminAPI.assignOrder(orderId, deliveryId);
      
      addNotification({
        title: 'Pedido Asignado',
        message: 'El pedido ha sido asignado exitosamente al delivery.',
        type: 'success'
      });
      
      setShowAssignModal(false);
      loadOrders();
    } catch (err: any) {
      addNotification({
        title: t('common.error'),
        message: 'Error al asignar pedido',
        type: 'error'
      });
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
          Gestión de Pedidos - Asignación de Delivery
        </h1>

        {/* Pedidos Pendientes de Asignación */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Pedidos Pendientes ({pendingOrders.length})
            </h2>
          </div>
          <div className="p-6">
            {pendingOrders.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No hay pedidos pendientes de asignación
              </p>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Pedido #{order.id}
                          </h3>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                            {order.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Cliente</p>
                            <p className="font-medium text-gray-900 dark:text-white">{order.customer.name}</p>
                            <p className="text-gray-500 dark:text-gray-400">{order.customer.phone}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Dirección</p>
                            <p className="font-medium text-gray-900 dark:text-white">{order.address.street}</p>
                            <p className="text-gray-500 dark:text-gray-400">{order.address.city}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Total</p>
                            <p className="font-bold text-primary-600 dark:text-primary-400">${order.total.toFixed(2)}</p>
                          </div>
                          {order.delivery && (
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Delivery Asignado</p>
                              <p className="font-medium text-gray-900 dark:text-white">{order.delivery.name}</p>
                              <p className="text-gray-500 dark:text-gray-400">⭐ {order.delivery.rating.toFixed(1)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {!order.delivery && (
                        <button
                          onClick={() => handleAssignDelivery(order.id)}
                          className="ml-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                        >
                          Asignar Delivery
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal de Asignación */}
        {showAssignModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Asignar Delivery - Pedido #{selectedOrder.id}
                </h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Dirección de entrega</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedOrder.address.street}, {selectedOrder.address.city}
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Delivery Disponibles (Ordenados por tiempo estimado)
                </h3>
                {availableDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{delivery.name}</h4>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            {delivery.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Calificación</p>
                            <p className="font-medium text-gray-900 dark:text-white">⭐ {delivery.rating.toFixed(1)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Distancia</p>
                            <p className="font-medium text-gray-900 dark:text-white">{delivery.distance.toFixed(1)} km</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Tiempo Estimado</p>
                            <p className="font-medium text-primary-600 dark:text-primary-400">{delivery.estimatedTime} min</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Pedidos activos: {delivery.currentOrders}
                        </p>
                      </div>
                      <button
                        onClick={() => assignToDelivery(selectedOrder.id, delivery.id)}
                        className="ml-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                      >
                        Asignar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

