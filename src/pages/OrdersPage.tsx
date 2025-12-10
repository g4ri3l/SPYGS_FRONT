import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import Loading from '../components/Loading';
import { useNotifications } from '../context/NotificationContext';
import { useI18n } from '../context/I18nContext';
import { useCart } from '../context/CartContext';

interface Order {
  id: string;
  date: string;
  status: 'Pendiente' | 'En preparación' | 'En camino' | 'Entregado' | 'Cancelado';
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  restaurant?: string;
}

const OrdersPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { addNotification } = useNotifications();

  const loadOrders = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await ordersAPI.getAll();
      const formattedOrders = (data.orders || data || []).map((order: any) => ({
        id: order.id || order._id || `ORD-${Date.now()}`,
        date: order.createdAt || order.date || new Date().toISOString(),
        status: order.status || 'Pendiente',
        total: typeof order.total === 'string' ? parseFloat(order.total) : (order.total || 0),
        items: order.items || order.products || [],
        restaurant: order.restaurant || order.provider || 'Restaurante'
      }));
      setOrders(formattedOrders);
    } catch (err: any) {
      setError(err.message || 'Error al cargar pedidos');
      console.error('Error al cargar pedidos:', err);
      addNotification({
        title: t('common.error'),
        message: t('orders.noOrdersDescription'),
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus.includes('entregado') || normalizedStatus.includes('delivered')) {
      return 'bg-green-100 text-green-800';
    }
    if (normalizedStatus.includes('camino') || normalizedStatus.includes('way')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (normalizedStatus.includes('preparación') || normalizedStatus.includes('preparing')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (normalizedStatus.includes('pendiente') || normalizedStatus.includes('pending')) {
      return 'bg-gray-100 text-gray-800';
    }
    if (normalizedStatus.includes('cancelado') || normalizedStatus.includes('cancelled')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'Pendiente': t('orders.statusPending'),
      'En preparación': t('orders.statusPreparing'),
      'En camino': t('orders.statusOnWay'),
      'Entregado': t('orders.statusDelivered'),
      'Cancelado': t('orders.statusCancelled'),
      'Pending': t('orders.statusPending'),
      'Preparing': t('orders.statusPreparing'),
      'On the way': t('orders.statusOnWay'),
      'Delivered': t('orders.statusDelivered'),
      'Cancelled': t('orders.statusCancelled')
    };
    return statusMap[status] || status;
  };

  const handleReorder = async (order: Order) => {
    try {
      // Agregar todos los items del pedido al carrito
      for (const item of order.items) {
        // Agregar cada item con su cantidad
        for (let i = 0; i < item.quantity; i++) {
          await addToCart({
            id: `reorder-${order.id}-${item.name}-${i}`,
            name: item.name,
            price: item.price,
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80',
            restaurant: order.restaurant || 'Restaurante'
          });
        }
      }
      
      addNotification({
        title: t('orders.reorder'),
        message: t('orders.reorderSuccess') || 'Los productos se han agregado a tu carrito.',
        type: 'success'
      });
      
      // Redirigir al carrito
      navigate('/cart');
    } catch (err) {
      addNotification({
        title: t('common.error'),
        message: t('orders.reorderError') || 'No se pudieron agregar los productos al carrito.',
        type: 'error'
      });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const confirmMessage = t('orders.cancelConfirm') || '¿Estás seguro de que deseas cancelar este pedido?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await ordersAPI.cancel(orderId);
      addNotification({
        title: t('orders.orderCancelled') || 'Pedido cancelado',
        message: t('orders.orderCancelledMessage') || 'Tu pedido ha sido cancelado exitosamente.',
        type: 'success'
      });
      // Recargar pedidos
      const data = await ordersAPI.getAll();
      const formattedOrders = (data.orders || data || []).map((order: any) => ({
        id: order.id || order._id || `ORD-${Date.now()}`,
        date: order.createdAt || order.date || new Date().toISOString(),
        status: order.status || 'Pendiente',
        total: typeof order.total === 'string' ? parseFloat(order.total) : (order.total || 0),
        items: order.items || order.products || [],
        restaurant: order.restaurant || order.provider || 'Restaurante'
      }));
      setOrders(formattedOrders);
    } catch (err: any) {
      addNotification({
        title: t('common.error'),
        message: err.message || t('orders.cancelError') || 'No se pudo cancelar el pedido.',
        type: 'error'
      });
    }
  };

  const handleTrackOrder = (orderId: string) => {
    addNotification({
      title: t('orders.trackOrder'),
      message: `${t('orders.orderNumber')} ${orderId} ${t('orders.statusOnWay')}.`,
      type: 'info'
    });
  };

  if (isLoading) {
    return <Loading fullScreen text={t('common.loading')} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-fixed p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('orders.title')}</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xl text-gray-600 mb-2">{t('orders.noOrders')}</p>
            <p className="text-gray-500">{t('orders.noOrdersDescription')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Pedido #{order.id}</h3>
                      <p className="text-sm text-gray-500">{order.restaurant}</p>
                      <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                      <p className="text-xl font-bold text-primary-500 mt-2">${order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Items del pedido:</h4>
                    <ul className="space-y-2">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-gray-900 font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex gap-3 flex-wrap">
                    {(order.status === 'Pendiente' || order.status === 'En preparación') && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                      >
                        {t('orders.cancelOrder') || 'Cancelar Pedido'}
                      </button>
                    )}
                    {order.status === 'Entregado' && (
                      <button
                        onClick={() => handleReorder(order)}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                      >
                        {t('orders.reorder')}
                      </button>
                    )}
                    {order.status === 'En camino' && (
                      <button
                        onClick={() => handleTrackOrder(order.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        {t('orders.trackOrder')}
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      {t('orders.viewDetails')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;

