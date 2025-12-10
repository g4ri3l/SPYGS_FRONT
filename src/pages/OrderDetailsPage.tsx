import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import Loading from '../components/Loading';
import { useNotifications } from '../context/NotificationContext';
import { useI18n } from '../context/I18nContext';
import { useCart } from '../context/CartContext';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderDetails {
  id: string;
  date: string;
  status: 'Pendiente' | 'En preparación' | 'En camino' | 'Entregado' | 'Cancelado';
  total: number;
  items: OrderItem[];
  restaurant: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    name?: string;
    reference?: string;
  };
  paymentMethod?: {
    type: string;
    cardNumber?: string;
    cardHolder?: string;
    expiryDate?: string;
  };
}

const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { addToCart } = useCart();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { addNotification } = useNotifications();

  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!id) {
        setError(t('common.error'));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const data = await ordersAPI.getById(id);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los detalles del pedido');
        console.error('Error al cargar detalles del pedido:', err);
        addNotification({
          title: t('common.error'),
          message: t('common.error'),
          type: 'error'
        });
        // Redirigir a orders después de 2 segundos
        setTimeout(() => navigate('/orders'), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderDetails();
  }, [id, navigate, addNotification]);

  const getStatusColor = (status: OrderDetails['status']) => {
    switch (status) {
      case 'Entregado':
        return 'bg-green-100 text-green-800';
      case 'En camino':
        return 'bg-blue-100 text-blue-800';
      case 'En preparación':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pendiente':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: OrderDetails['status']) => {
    switch (status) {
      case 'Entregado':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'En camino':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'En preparación':
        return (
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Pendiente':
        return (
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Cancelado':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatPaymentMethod = (paymentMethod?: OrderDetails['paymentMethod']) => {
    if (!paymentMethod) return 'No especificado';
    
    if (paymentMethod.type === 'cash') {
      return 'Efectivo';
    }
    
    if (paymentMethod.cardNumber) {
      return `${paymentMethod.type === 'credit' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'} •••• ${paymentMethod.cardNumber.slice(-4)}`;
    }
    
    return paymentMethod.type;
  };

  if (isLoading) {
    return <Loading fullScreen text={t('common.loading')} />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-fixed p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl text-gray-600 mb-2">{error || t('orders.noOrders')}</p>
            <button
              onClick={() => navigate('/orders')}
              className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              {t('orders.title')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% de impuesto (ajustar según necesidad)
  const total = order.total;

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-fixed p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('orders.title')}
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('orders.orderDetails')}</h1>
        </div>

        {/* Order Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Order Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-700 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">Pedido #{order.id}</h2>
                <p className="text-primary-100">{order.restaurant}</p>
                <p className="text-primary-100 text-sm mt-1">
                  {new Date(order.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end mb-2">
                  {getStatusIcon(order.status)}
                </div>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('orders.items')}</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ${item.price.toFixed(2)} c/u
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            {order.address && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('orders.deliveryAddress')}</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {order.address.name && (
                    <p className="font-medium text-gray-900 dark:text-white mb-2">{order.address.name}</p>
                  )}
                  <p className="text-gray-700 dark:text-gray-300">{order.address.street}</p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {order.address.city}, {order.address.state} {order.address.zipCode}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">{order.address.country}</p>
                  {order.address.reference && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Referencia: {order.address.reference}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Payment Method */}
            {order.paymentMethod && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('orders.paymentMethod')}</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">{formatPaymentMethod(order.paymentMethod)}</p>
                  {order.paymentMethod.cardHolder && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Titular: {order.paymentMethod.cardHolder}
                    </p>
                  )}
                  {order.paymentMethod.expiryDate && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Vence: {order.paymentMethod.expiryDate}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{t('common.subtotal')}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{t('common.total')}</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>{t('common.total')}</span>
                <span className="text-primary-600 dark:text-primary-400">${total.toFixed(2)}</span>
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4 flex-wrap">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {t('orders.title')}
          </button>
          {(order.status === 'Pendiente' || order.status === 'En preparación') && (
            <button
              onClick={async () => {
                const confirmMsg = t('orders.cancelConfirm') || '¿Estás seguro de que deseas cancelar este pedido?';
                if (!window.confirm(confirmMsg)) {
                  return;
                }
                try {
                  await ordersAPI.cancel(order.id);
                  const cancelTitle = t('orders.orderCancelled') || 'Pedido cancelado';
                  const cancelMessage = t('orders.orderCancelledMessage') || 'Tu pedido ha sido cancelado exitosamente.';
                  addNotification({
                    title: cancelTitle,
                    message: cancelMessage,
                    type: 'success'
                  });
                  navigate('/orders');
                } catch (err: any) {
                  const errorTitle = t('common.error');
                  const errorMessage = err.message || t('orders.cancelError') || 'No se pudo cancelar el pedido.';
                  addNotification({
                    title: errorTitle,
                    message: errorMessage,
                    type: 'error'
                  });
                }
              }}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              {t('orders.cancelOrder') ? t('orders.cancelOrder') : 'Cancelar Pedido'}
            </button>
          )}
          {order.status === 'Entregado' && (
            <button
              onClick={async () => {
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
                  
                  const reorderTitle = t('orders.reorder');
                  const reorderMessage = t('orders.reorderSuccess') || 'Los productos se han agregado a tu carrito.';
                  addNotification({
                    title: reorderTitle,
                    message: reorderMessage,
                    type: 'success'
                  });
                  
                  // Redirigir al carrito
                  navigate('/cart');
                } catch (err) {
                  const errorTitle = t('common.error');
                  const errorMessage = t('orders.reorderError') || 'No se pudieron agregar los productos al carrito.';
                  addNotification({
                    title: errorTitle,
                    message: errorMessage,
                    type: 'error'
                  });
                }
              }}
              className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              {t('orders.reorder')}
            </button>
          )}
          {order.status === 'En camino' && (
            <button
              onClick={() => {
                addNotification({
                  title: t('orders.trackOrder'),
                  message: `${t('orders.orderNumber')} ${order.id} ${t('orders.statusOnWay')}.`,
                  type: 'info'
                });
              }}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              {t('orders.trackOrder')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;

