import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  restaurant: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cart_items';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar carrito desde localStorage o backend
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated) {
          // Cargar desde backend si está autenticado
          try {
            const data = await cartAPI.get();
            const items = (data.items || data.cartItems || []).map((item: any) => ({
              id: item.productId || item.id || '',
              name: item.name || item.product?.name || '',
              price: typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0),
              quantity: item.quantity || 1,
              image: item.image || item.product?.image || '',
              restaurant: item.restaurant || item.product?.provider || ''
            }));
            setCartItems(items);
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
          } catch (err) {
            // Si falla el backend, cargar desde localStorage
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            if (stored) {
              setCartItems(JSON.parse(stored));
            }
          }
        } else {
          // Cargar desde localStorage si no está autenticado
          const stored = localStorage.getItem(CART_STORAGE_KEY);
          if (stored) {
            setCartItems(JSON.parse(stored));
          }
        }
      } catch (err) {
        console.error('Error al cargar carrito:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated]);

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    const newItems = [...cartItems];
    const existingItem = newItems.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      newItems.push({ ...item, quantity: 1 });
    }
    
    setCartItems(newItems);

    // Sincronizar con backend si está autenticado
    if (isAuthenticated) {
      try {
        const itemToSync = existingItem || { ...item, quantity: 1 };
        await cartAPI.add(itemToSync.id, itemToSync.quantity);
      } catch (err) {
        console.error('Error al sincronizar carrito con backend:', err);
      }
    }
  };

  const removeFromCart = async (id: string) => {
    const newItems = cartItems.filter(item => item.id !== id);
    setCartItems(newItems);

    // Sincronizar con backend si está autenticado
    if (isAuthenticated) {
      try {
        await cartAPI.remove(id);
      } catch (err) {
        console.error('Error al eliminar del carrito en backend:', err);
      }
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    const newItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(newItems);

    // Sincronizar con backend si está autenticado
    if (isAuthenticated) {
      try {
        await cartAPI.update(id, quantity);
      } catch (err) {
        console.error('Error al actualizar cantidad en backend:', err);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);

    // Sincronizar con backend si está autenticado
    if (isAuthenticated) {
      try {
        await cartAPI.clear();
      } catch (err) {
        console.error('Error al limpiar carrito en backend:', err);
      }
    }
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

