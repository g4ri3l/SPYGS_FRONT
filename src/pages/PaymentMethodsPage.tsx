import { useState } from 'react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'cash';
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  isDefault: boolean;
}

const PaymentMethodsPage = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      cardNumber: '**** **** **** 1234',
      cardHolder: 'USUARIO DEMO',
      expiryDate: '12/25',
      isDefault: true
    }
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Omit<PaymentMethod, 'id'>>({
    type: 'card',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    isDefault: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue = value;

    // Formatear número de tarjeta
    if (name === 'cardNumber') {
      processedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (processedValue.length > 19) return;
    }

    // Formatear fecha de expiración
    if (name === 'expiryDate') {
      processedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (processedValue.length > 5) return;
    }

    // Limitar CVV a 3 dígitos
    if (name === 'cvv') {
      processedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setFormData({
      ...formData,
      [name]: processedValue
    });
  };

  const handleSave = () => {
    if (formData.type === 'card') {
      const newMethod: PaymentMethod = {
        ...formData,
        cardNumber: `**** **** **** ${formData.cardNumber?.slice(-4) || ''}`,
        id: Date.now().toString()
      };
      setPaymentMethods([...paymentMethods, newMethod]);
    } else {
      const newMethod: PaymentMethod = {
        type: 'cash',
        isDefault: formData.isDefault,
        id: Date.now().toString()
      };
      setPaymentMethods([...paymentMethods, newMethod]);
    }
    setIsAdding(false);
    setFormData({
      type: 'card',
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
      isDefault: false
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este método de pago?')) {
      setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    }
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-fixed p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Métodos de Pago</h1>
          <button
            onClick={() => {
              setIsAdding(true);
              setFormData({
                type: 'card',
                cardNumber: '',
                cardHolder: '',
                expiryDate: '',
                cvv: '',
                isDefault: false
              });
            }}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            + Agregar Método
          </button>
        </div>

        {isAdding && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Nuevo Método de Pago</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de pago</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="card">Tarjeta de Crédito/Débito</option>
                <option value="cash">Efectivo</option>
              </select>
            </div>

            {formData.type === 'card' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Tarjeta</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Titular</label>
                  <input
                    type="text"
                    name="cardHolder"
                    value={formData.cardHolder}
                    onChange={handleInputChange}
                    placeholder="NOMBRE COMPLETO"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Expiración</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  El pago en efectivo se realizará al momento de la entrega.
                </p>
              </div>
            )}

            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <label className="ml-2 text-sm text-gray-700">Establecer como método de pago predeterminado</label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {paymentMethods.length === 0 ? (
          <div className="text-center py-16 px-8 bg-white rounded-xl shadow-lg">
            <p className="text-lg text-gray-600 my-2">No tienes métodos de pago guardados.</p>
            <p className="text-sm text-gray-400">Agrega un método de pago para facilitar tus pedidos.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map(method => (
              <div key={method.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {method.type === 'card' ? (
                        <>
                          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Tarjeta</h3>
                            <p className="text-gray-600 text-sm">{method.cardNumber}</p>
                            <p className="text-gray-500 text-xs mt-1">{method.cardHolder} • Exp: {method.expiryDate}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Efectivo</h3>
                            <p className="text-gray-600 text-sm">Pago al momento de la entrega</p>
                          </div>
                        </>
                      )}
                      {method.isDefault && (
                        <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                          Predeterminado
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Establecer como predeterminado
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Eliminar
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

export default PaymentMethodsPage;

