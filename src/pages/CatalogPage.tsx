import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import { useI18n } from '../context/I18nContext';
import type { Product } from '../components/ProductCard';
import { productsAPI } from '../services/api';

// Datos de ejemplo como fallback si no hay conexión
const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Sushi Variado (20 piezas)',
    price: 28.00,
    description: 'Selección de nigiri, maki y rolls premium',
    category: 'Comida',
    provider: 'Sushi Express',
    rating: 4.9,
    deliveryTime: '30-40 min',
    distance: '2.1 km',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&q=80'
  },
  {
    id: '2',
    title: 'Pizza Margherita',
    price: 12.50,
    description: 'Pizza clásica con tomate, mozzarella y albahaca fresca',
    category: 'Comida',
    provider: 'Pizzería Roma',
    rating: 4.8,
    deliveryTime: '25-35 min',
    distance: '1.2 km',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&q=80'
  },
  {
    id: '3',
    title: 'Hamburguesa Clásica',
    price: 15.00,
    description: 'Carne 100% res, queso, lechuga, tomate y nuestra salsa especial',
    category: 'Comida',
    provider: 'Burger House',
    rating: 4.6,
    deliveryTime: '20-30 min',
    distance: '0.8 km',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80'
  },
  {
    id: '4',
    title: 'Tacos al Pastor (5 unidades)',
    price: 18.00,
    description: 'Tacos tradicionales con carne al pastor, piña, cebolla y cilantro',
    category: 'Comida',
    provider: 'Taquería El Mexicano',
    rating: 4.7,
    deliveryTime: '15-25 min',
    distance: '1.5 km',
    image: 'https://elcomercio.pe/resizer/v2/3BHJSBWBLBDTLKWVODRQGC3QLE.jpg?auth=dc2e70c4640d711be3496d7a4657e79d91e9b26f1b0446274ba56481c635561e&width=1200&height=803&quality=75&smart=true'
  },
  {
    id: '5',
    title: 'Pasta Carbonara',
    price: 22.00,
    description: 'Pasta italiana con panceta, huevo, queso parmesano y pimienta negra',
    category: 'Comida',
    provider: 'Trattoria Italiana',
    rating: 4.8,
    deliveryTime: '30-40 min',
    distance: '2.8 km',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop&q=80'
  },
  {
    id: '6',
    title: 'Pollo a la Brasa (1/4)',
    price: 16.00,
    description: 'Pollo marinado y asado a la brasa con papas fritas y ensalada',
    category: 'Comida',
    provider: 'Brasas del Norte',
    rating: 4.9,
    deliveryTime: '35-45 min',
    distance: '3.2 km',
    image: 'https://laestacion.la/wp-content/uploads/2024/06/pollo-a-la-brasa-1024x576-1.webp'
  },
  {
    id: '7',
    title: 'Ramen Tonkotsu',
    price: 24.00,
    description: 'Sopa de fideos japoneses con cerdo, huevo, algas y cebollín',
    category: 'Comida',
    provider: 'Ramen House',
    rating: 4.7,
    deliveryTime: '25-35 min',
    distance: '2.5 km',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&q=80'
  },
  {
    id: '8',
    title: 'Ensalada César',
    price: 14.00,
    description: 'Lechuga romana, pollo a la parrilla, crutones, parmesano y aderezo césar',
    category: 'Comida',
    provider: 'Salad Bar',
    rating: 4.5,
    deliveryTime: '15-20 min',
    distance: '1.0 km',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop&q=80'
  }
];

const CatalogPage = () => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  // Código interno del filtro de categoría: 'ALL' o nombre de categoría (por ahora 'Comida')
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedSort, setSelectedSort] = useState(t('products.bestRated'));
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Cargar productos del backend
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError('');
      try {
        const category = selectedFilter === 'ALL' ? undefined : selectedFilter;
        const data = await productsAPI.getAll(searchQuery || undefined, category, selectedSort);
        
        // Convertir los productos del backend al formato correcto
        const formattedProducts = (data.products || []).map((product: any) => ({
          ...product,
          price: typeof product.price === 'string' ? parseFloat(product.price) : (product.price || 0),
          rating: typeof product.rating === 'string' ? parseFloat(product.rating) : (product.rating || 0),
        }));
        
        setProducts(formattedProducts);
      } catch (err: any) {
        setError(err.message || 'Error al cargar productos');
        console.error('Error al cargar productos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [searchQuery, selectedFilter, selectedSort]);

  // Usar productos del backend o mock como fallback, aplicando traducciones i18n si existen
  const baseProducts = products.length > 0 ? products : mockProducts;

  const displayedProducts = baseProducts.map(product => {
    const titleKey = `mockProducts.${product.id}.title`;
    const descKey = `mockProducts.${product.id}.description`;

    const translatedTitle = t(titleKey);
    const translatedDescription = t(descKey);

    return {
      ...product,
      title: translatedTitle !== titleKey ? translatedTitle : product.title,
      description: translatedDescription !== descKey ? translatedDescription : product.description,
    };
  });

  return (
    <div className="min-h-screen bg-orange-100 p-8 box-border">
      <div className="max-w-7xl mx-auto">
        <SearchBar
          onSearch={setSearchQuery}
          onFilterChange={setSelectedFilter}
          onSortChange={setSelectedSort}
        />

        {error && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-sm">
            {error} - Mostrando datos de ejemplo
          </div>
        )}

        <div className="mb-6">
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {isLoading ? t('common.loading') : `${displayedProducts.length} ${t('products.title')}`}
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="text-lg text-gray-600 dark:text-gray-400">{t('common.loading')}</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {displayedProducts.length === 0 && (
              <div className="text-center py-16 px-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <p className="text-lg text-gray-600 dark:text-gray-400 my-2">{t('products.noProducts')}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">{t('common.search')}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;

