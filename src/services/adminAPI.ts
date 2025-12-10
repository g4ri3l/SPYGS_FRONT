import { fetchAPI } from './api';

// API de Administración
export const adminAPI = {
  // Delivery
  getDeliveries: async () => {
    const response = await fetchAPI('/admin/deliveries');
    return response.json();
  },

  getDeliveryById: async (id: string) => {
    const response = await fetchAPI(`/admin/deliveries/${id}`);
    return response.json();
  },

  updateDeliveryStatus: async (id: string, status: string) => {
    const response = await fetchAPI(`/admin/deliveries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response.json();
  },

  // Pedidos
  getAllOrders: async () => {
    const response = await fetchAPI('/admin/orders');
    return response.json();
  },

  assignOrder: async (orderId: string, deliveryId: string) => {
    const response = await fetchAPI(`/admin/orders/${orderId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ deliveryId }),
    });
    return response.json();
  },

  // Satisfacción
  getSatisfactionStats: async () => {
    const response = await fetchAPI('/admin/satisfaction');
    return response.json();
  },

  getDeliveryRatings: async (deliveryId: string) => {
    const response = await fetchAPI(`/admin/satisfaction/deliveries/${deliveryId}/ratings`);
    return response.json();
  },

  // Tracking
  getDeliveryLocation: async (deliveryId: string) => {
    const response = await fetchAPI(`/admin/deliveries/${deliveryId}/location`);
    return response.json();
  },

  // Asignación Inteligente
  calculateBestDelivery: async (orderId: string) => {
    const response = await fetchAPI(`/admin/orders/${orderId}/best-delivery`);
    return response.json();
  },
};

