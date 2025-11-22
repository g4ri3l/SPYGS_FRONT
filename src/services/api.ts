const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Función para obtener el token del localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Función para hacer peticiones HTTP
const fetchAPI = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    const errorMessage = error.error || error.message || `Error ${response.status}`;
    console.error('Error en fetchAPI:', errorMessage, error);
    throw new Error(errorMessage);
  }

  return response;
};

// API de Autenticación
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    const response = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  verify: async () => {
    const response = await fetchAPI('/auth/verify');
    return response.json();
  },

  googleLogin: async (token: string) => {
    const response = await fetchAPI('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    return response.json();
  },
};

// API de Productos
export const productsAPI = {
  getAll: async (search?: string, category?: string, sort?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (sort) params.append('sort', sort);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    const response = await fetchAPI(endpoint);
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetchAPI(`/products/${id}`);
    return response.json();
  },
};

// API de Carrito
export const cartAPI = {
  get: async () => {
    const response = await fetchAPI('/cart');
    return response.json();
  },

  add: async (productId: string, quantity: number = 1) => {
    const response = await fetchAPI('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    return response.json();
  },

  update: async (productId: string, quantity: number) => {
    const response = await fetchAPI(`/cart/update/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    return response.json();
  },

  remove: async (productId: string) => {
    const response = await fetchAPI(`/cart/remove/${productId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  clear: async () => {
    const response = await fetchAPI('/cart/clear', {
      method: 'DELETE',
    });
    return response.json();
  },
};

// API de Pedidos
export const ordersAPI = {
  getAll: async () => {
    const response = await fetchAPI('/orders');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetchAPI(`/orders/${id}`);
    return response.json();
  },

  create: async (addressId: string, paymentMethodId: string) => {
    const response = await fetchAPI('/orders', {
      method: 'POST',
      body: JSON.stringify({ addressId, paymentMethodId }),
    });
    return response.json();
  },

  updateStatus: async (id: string, status: string) => {
    const response = await fetchAPI(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response.json();
  },
};

// API de Favoritos
export const favoritesAPI = {
  getAll: async () => {
    const response = await fetchAPI('/favorites');
    return response.json();
  },

  add: async (productId: string) => {
    const response = await fetchAPI(`/favorites/add/${productId}`, {
      method: 'POST',
    });
    return response.json();
  },

  remove: async (productId: string) => {
    const response = await fetchAPI(`/favorites/remove/${productId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  check: async (productId: string) => {
    const response = await fetchAPI(`/favorites/check/${productId}`);
    return response.json();
  },
};

// API de Perfil
export const profileAPI = {
  get: async () => {
    const response = await fetchAPI('/profile');
    return response.json();
  },

  update: async (name?: string, email?: string) => {
    const response = await fetchAPI('/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    });
    return response.json();
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await fetchAPI('/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return response.json();
  },
};

// API de Direcciones
export const addressesAPI = {
  getAll: async () => {
    const response = await fetchAPI('/addresses');
    return response.json();
  },

  add: async (street: string, city: string, state: string, zipCode: string, country: string, isDefault?: boolean) => {
    const response = await fetchAPI('/addresses', {
      method: 'POST',
      body: JSON.stringify({ street, city, state, zipCode, country, isDefault }),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<{ street: string; city: string; state: string; zipCode: string; country: string; isDefault: boolean }>) => {
    const response = await fetchAPI(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetchAPI(`/addresses/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// API de Métodos de Pago
export const paymentMethodsAPI = {
  getAll: async () => {
    const response = await fetchAPI('/payment-methods');
    return response.json();
  },

  add: async (type: string, cardNumber: string, cardHolder: string, expiryDate: string, isDefault?: boolean) => {
    const response = await fetchAPI('/payment-methods', {
      method: 'POST',
      body: JSON.stringify({ type, cardNumber, cardHolder, expiryDate, isDefault }),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<{ cardHolder: string; expiryDate: string; isDefault: boolean }>) => {
    const response = await fetchAPI(`/payment-methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetchAPI(`/payment-methods/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};



