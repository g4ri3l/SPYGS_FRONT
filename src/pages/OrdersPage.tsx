import { useState } from 'react';

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
  restaurant: string;
}

const OrdersPage = () => {
  const [orders] = useState<Order[]>([
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'Entregado',
      total: 45.50,
      items: [
        { name: 'Pizza Margherita', quantity: 2, price: 12.50 },
        { name: 'Hamburguesa Clásica', quantity: 1, price: 15.00 },
        { name: 'Ensalada César', quantity: 1, price: 14.00 }
      ],
      restaurant: 'Pizzería Roma'
    },
    {
      id: 'ORD-002',
      date: '2024-01-14',
      status: 'En camino',
      total: 28.00,
      items: [
        { name: 'Sushi Variado (20 piezas)', quantity: 1, price: 28.00 }
      ],
      restaurant: 'Sushi Express'
    },
    {
      id: 'ORD-003',
      date: '2024-01-13',
      status: 'En preparación',
      total: 18.00,
      items: [
        { name: 'Tacos al Pastor (5 unidades)', quantity: 1, price: 18.00 }
      ],
      restaurant: 'Taquería El Mexicano'
    },
    {
      id: 'ORD-004',
      date: '2024-01-12',
      status: 'Pendiente',
      total: 22.00,
      items: [
        { name: 'Pasta Carbonara', quantity: 1, price: 22.00 }
      ],
      restaurant: 'Trattoria Italiana'
    }
  ]);

  const getStatusColor = (status: Order['status']) => {
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

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-fixed p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xl text-gray-600 mb-2">No tienes pedidos aún</p>
            <p className="text-gray-500">Realiza tu primer pedido y aparecerá aquí</p>
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
                        {order.status}
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

                  <div className="mt-4 flex gap-3">
                    {order.status === 'Entregado' && (
                      <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
                        Pedir de nuevo
                      </button>
                    )}
                    {order.status === 'En camino' && (
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                        Rastrear pedido
                      </button>
                    )}
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                      Ver detalles
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

