import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../components/ProductCard';
import { favoritesAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favorites: Product[];
  addToFavorites: (product: Product) => Promise<void>;
  removeFromFavorites: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (product: Product) => Promise<void>;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'favorites';

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar favoritos desde localStorage o backend
  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated) {
          // Cargar desde backend si está autenticado
          try {
            const data = await favoritesAPI.getAll();
            const items = (data.favorites || data.products || []).map((item: any) => ({
              id: item.id || item.productId || '',
              title: item.title || item.name || '',
              price: typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0),
              description: item.description || '',
              category: item.category || '',
              provider: item.provider || item.restaurant || '',
              rating: typeof item.rating === 'string' ? parseFloat(item.rating) : (item.rating || 0),
              deliveryTime: item.deliveryTime || '',
              distance: item.distance || '',
              image: item.image || ''
            }));
            setFavorites(items);
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
          } catch (err) {
            // Si falla el backend, cargar desde localStorage
            const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
            if (stored) {
              setFavorites(JSON.parse(stored));
            }
          }
        } else {
          // Cargar desde localStorage si no está autenticado
          const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
          if (stored) {
            setFavorites(JSON.parse(stored));
          }
        }
      } catch (err) {
        console.error('Error al cargar favoritos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [isAuthenticated]);

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites, isLoading]);

  const addToFavorites = async (product: Product) => {
    if (favorites.find(fav => fav.id === product.id)) {
      return;
    }

    const newFavorites = [...favorites, product];
    setFavorites(newFavorites);

    // Sincronizar con backend si está autenticado
    if (isAuthenticated) {
      try {
        await favoritesAPI.add(product.id);
      } catch (err) {
        console.error('Error al agregar a favoritos en backend:', err);
      }
    }
  };

  const removeFromFavorites = async (id: string) => {
    const newFavorites = favorites.filter(fav => fav.id !== id);
    setFavorites(newFavorites);

    // Sincronizar con backend si está autenticado
    if (isAuthenticated) {
      try {
        await favoritesAPI.remove(id);
      } catch (err) {
        console.error('Error al eliminar de favoritos en backend:', err);
      }
    }
  };

  const isFavorite = (id: string) => {
    return favorites.some(fav => fav.id === id);
  };

  const toggleFavorite = async (product: Product) => {
    if (isFavorite(product.id)) {
      await removeFromFavorites(product.id);
    } else {
      await addToFavorites(product);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
        isLoading
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

