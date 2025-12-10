import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import { useI18n } from '../context/I18nContext';
import { ordersAPI, addressesAPI, paymentMethodsAPI } from '../services/api';

interface Address {
  id: string;
  name?: string;
  street: string;
  city: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: string;
  isDefault: boolean;
}

const CartPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { cartItems, updateQuantity, clearCart, getTotal } = useCart();
  const { addNotification } = useNotifications();
  const [isProcessing, setIsProcessing] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const subtotal = getTotal();
  const deliveryFee = 3.50;
  const tax = subtotal * 0.18;
  const total = subtotal + deliveryFee + tax;

  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        const [addressesData, paymentData] = await Promise.all([
          addressesAPI.getAll(),
          paymentMethodsAPI.getAll()
        ]);

        const formattedAddresses = (addressesData.addresses || addressesData || []).map((addr: any) => ({
          id: addr.id || addr._id || '',
          name: addr.name || 'Dirección',
          street: addr.street || '',
          city: addr.city || '',
          isDefault: addr.isDefault || false
        }));

        const formattedPayments = (paymentData.paymentMethods || paymentData || []).map((pm: any) => ({
          id: pm.id || pm._id || '',
          type: pm.type || 'card',
          isDefault: pm.isDefault || false
        }));

        setAddresses(formattedAddresses);
        setPaymentMethods(formattedPayments);

        // Seleccionar predeterminados
        const defaultAddress = formattedAddresses.find((a: Address) => a.isDefault);
        const defaultPayment = formattedPayments.find((p: PaymentMethod) => p.isDefault);
        if (defaultAddress) setSelectedAddress(defaultAddress.id);
        if (defaultPayment) setSelectedPayment(defaultPayment.id);
      } catch (err) {
        console.error('Error al cargar datos de checkout:', err);
      }
    };

    if (cartItems.length > 0) {
      loadCheckoutData();
    }
  }, [cartItems.length]);

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-fixed p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cart.title')}</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-xl text-gray-600 mb-2">{t('cart.empty')}</p>
            <p className="text-gray-500 mb-6">{t('cart.emptyDescription')}</p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              {t('nav.home')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.restaurant}</p>
                      <p className="text-xl font-bold text-primary-500 mt-2">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => updateQuantity(item.id, 0)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary-500 hover:text-primary-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="text-lg font-semibold text-gray-900 w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary-500 hover:text-primary-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-lg font-bold text-gray-900 mt-2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('orders.orderDetails')}</h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('common.subtotal')}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('orders.deliveryAddress')}</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('common.total')}</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>{t('common.total')}</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (cartItems.length === 0) return;
                    if (addresses.length === 0) {
                      addNotification({
                        title: t('addresses.title'),
                        message: t('cart.selectAddress'),
                        type: 'error'
                      });
                      navigate('/addresses');
                      return;
                    }
                    if (paymentMethods.length === 0) {
                      addNotification({
                        title: t('paymentMethods.title'),
                        message: t('cart.selectPayment'),
                        type: 'error'
                      });
                      navigate('/payment-methods');
                      return;
                    }
                    setShowCheckoutModal(true);
                  }}
                  disabled={cartItems.length === 0 || isProcessing}
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg font-semibold hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? t('common.loading') : t('cart.checkout')}
                </button>
                <button
                  onClick={() => navigate('/home')}
                  className="w-full py-3 mt-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('nav.home')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Checkout */}
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirmar Pedido</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de entrega</label>
                  <select
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {addresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.street}, {addr.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('cart.selectPayment')}</label>
                  <select
                    value={selectedPayment}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {paymentMethods.map(pm => (
                      <option key={pm.id} value={pm.id}>
                        {pm.type === 'card' ? 'Tarjeta' : 'Efectivo'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (!selectedAddress || !selectedPayment) {
                      addNotification({
                        title: 'Error',
                        message: 'Por favor, selecciona dirección y método de pago.',
                        type: 'error'
                      });
                      return;
                    }

                    setIsProcessing(true);
                    try {
                      await ordersAPI.create(selectedAddress, selectedPayment);
                      addNotification({
                        title: '¡Pedido realizado!',
                        message: `Tu pedido por $${total.toFixed(2)} ha sido confirmado. Te notificaremos cuando esté en camino.`,
                        type: 'success'
                      });
                      await clearCart();
                      setShowCheckoutModal(false);
                      navigate('/orders');
                    } catch (err: any) {
                      addNotification({
                        title: 'Error',
                        message: err.message || 'No se pudo procesar el pedido. Intenta nuevamente.',
                        type: 'error'
                      });
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  disabled={isProcessing || !selectedAddress || !selectedPayment}
                  className="flex-1 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

