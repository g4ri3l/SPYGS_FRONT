import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: 'Comida';
  provider: string;
  rating: number;
  deliveryTime: string;
  distance: string;
  image: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Asegurar que el precio sea un número
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const numericPrice = isNaN(price) ? 0 : price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.title,
      price: numericPrice,
      image: product.image,
      restaurant: product.provider
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product);
  };

  return (
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full hover:-translate-y-1 hover:shadow-2xl border border-gray-100 dark:border-gray-700">
      <div className="relative w-full h-48 overflow-hidden bg-gray-100">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Imagen de respaldo genérica de comida
            target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80';
          }}
        />
        <span className="absolute top-3 right-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-1.5 px-3 rounded-full text-xs font-semibold uppercase tracking-wide shadow-md">{product.category}</span>
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 left-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg
            className={`w-5 h-5 ${isFavorite(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`}
            fill={isFavorite(product.id) ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      
      <div className="p-5 flex flex-col flex-1 gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0 leading-snug">{product.title}</h3>
        <p className="text-2xl font-bold text-primary-500 m-0">${numericPrice.toFixed(2)}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 m-0 leading-relaxed line-clamp-2 flex-1">{product.description}</p>
        
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.provider}</span>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{product.rating}</span>
          </div>
        </div>
        
        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <polyline points="12 6 12 12 16 14" strokeWidth="2" />
            </svg>
            <span>{product.deliveryTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeWidth="2" />
              <circle cx="12" cy="10" r="3" strokeWidth="2" />
            </svg>
            <span>{product.distance}</span>
          </div>
        </div>
        
        <button
          onClick={handleAddToCart}
          className="mt-4 w-full py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
        >
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

