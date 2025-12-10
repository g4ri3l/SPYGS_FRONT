import ProductCard from '../components/ProductCard';
import { useFavorites } from '../context/FavoritesContext';
import { useI18n } from '../context/I18nContext';
import Loading from '../components/Loading';

const FavoritesPage = () => {
  const { t } = useI18n();
  const { favorites, isLoading } = useFavorites();

  if (isLoading) {
    return <Loading fullScreen text={t('common.loading')} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-fixed p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('favorites.title')}</h1>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-xl text-gray-600 mb-2">{t('favorites.noFavorites')}</p>
            <p className="text-gray-500">{t('favorites.noFavoritesDescription')}</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <span className="text-sm text-gray-600 font-medium">{favorites.length} {t('favorites.title')}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;

