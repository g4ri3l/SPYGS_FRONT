import { useState, useEffect } from 'react';
import { useI18n } from '../context/I18nContext';
import Loading from '../components/Loading';
import AdminNav from '../components/AdminNav';
import { useNotifications } from '../context/NotificationContext';

interface DeliveryRating {
  deliveryId: string;
  deliveryName: string;
  averageRating: number;
  totalRatings: number;
  ratings: {
    value: number;
    count: number;
  }[];
  recentComments: {
    orderId: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

interface SatisfactionStats {
  overallAverage: number;
  totalRatings: number;
  byRating: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  topDeliveries: DeliveryRating[];
  bottomDeliveries: DeliveryRating[];
}

const AdminSatisfaction = () => {
  const { t } = useI18n();
  const { addNotification } = useNotifications();
  const [stats, setStats] = useState<SatisfactionStats | null>(null);
  const [deliveryRatings, setDeliveryRatings] = useState<DeliveryRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRating | null>(null);

  useEffect(() => {
    loadSatisfactionData();
  }, []);

  const loadSatisfactionData = async () => {
    try {
      // TODO: Implementar API real
      // Mock data
      const mockDeliveryRatings: DeliveryRating[] = [
        {
          deliveryId: '1',
          deliveryName: 'Juan Pérez',
          averageRating: 4.8,
          totalRatings: 156,
          ratings: [
            { value: 5, count: 120 },
            { value: 4, count: 30 },
            { value: 3, count: 5 },
            { value: 2, count: 1 },
            { value: 1, count: 0 }
          ],
          recentComments: [
            {
              orderId: 'ORD-001',
              rating: 5,
              comment: 'Excelente servicio, muy puntual',
              date: new Date().toISOString()
            },
            {
              orderId: 'ORD-002',
              rating: 4,
              comment: 'Buen servicio, llegó a tiempo',
              date: new Date().toISOString()
            }
          ]
        },
        {
          deliveryId: '2',
          deliveryName: 'María García',
          averageRating: 4.9,
          totalRatings: 203,
          ratings: [
            { value: 5, count: 180 },
            { value: 4, count: 20 },
            { value: 3, count: 3 },
            { value: 2, count: 0 },
            { value: 1, count: 0 }
          ],
          recentComments: [
            {
              orderId: 'ORD-003',
              rating: 5,
              comment: 'La mejor delivery, muy amable',
              date: new Date().toISOString()
            }
          ]
        },
        {
          deliveryId: '3',
          deliveryName: 'Carlos López',
          averageRating: 4.6,
          totalRatings: 98,
          ratings: [
            { value: 5, count: 70 },
            { value: 4, count: 20 },
            { value: 3, count: 5 },
            { value: 2, count: 2 },
            { value: 1, count: 1 }
          ],
          recentComments: [
            {
              orderId: 'ORD-004',
              rating: 4,
              comment: 'Buen servicio',
              date: new Date().toISOString()
            }
          ]
        }
      ];

      setDeliveryRatings(mockDeliveryRatings);

      // Calcular estadísticas
      const totalRatings = mockDeliveryRatings.reduce((sum, d) => sum + d.totalRatings, 0);
      const weightedSum = mockDeliveryRatings.reduce((sum, d) => sum + (d.averageRating * d.totalRatings), 0);
      const overallAverage = totalRatings > 0 ? weightedSum / totalRatings : 0;

      // Calcular distribución por rating
      const ratingCounts: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      mockDeliveryRatings.forEach(d => {
        d.ratings.forEach(r => {
          ratingCounts[r.value] = (ratingCounts[r.value] || 0) + r.count;
        });
      });

      const byRating = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: ratingCounts[rating],
        percentage: totalRatings > 0 ? (ratingCounts[rating] / totalRatings) * 100 : 0
      }));

      const sorted = [...mockDeliveryRatings].sort((a, b) => b.averageRating - a.averageRating);
      const topDeliveries = sorted.slice(0, 3);
      const bottomDeliveries = sorted.slice(-3).reverse();

      setStats({
        overallAverage,
        totalRatings,
        byRating,
        topDeliveries,
        bottomDeliveries
      });
    } catch (err: any) {
      addNotification({
        title: t('common.error'),
        message: 'Error al cargar datos de satisfacción',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return <Loading fullScreen text={t('common.loading')} />;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-fixed p-8">
      <div className="max-w-7xl mx-auto">
        <AdminNav />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Dashboard de Satisfacción del Cliente
        </h1>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Calificación Promedio General</p>
            <p className={`text-4xl font-bold ${getRatingColor(stats.overallAverage)}`}>
              {stats.overallAverage.toFixed(2)}
            </p>
            <div className="flex items-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(stats.overallAverage) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total de Calificaciones</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.totalRatings}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Desde el inicio</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Delivery Activos</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{deliveryRatings.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Con calificaciones</p>
          </div>
        </div>

        {/* Distribución de Calificaciones */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Distribución de Calificaciones
          </h2>
          <div className="space-y-3">
            {stats.byRating.map((item) => (
              <div key={item.rating} className="flex items-center gap-4">
                <div className="w-12 text-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">{item.rating}</span>
                  <svg className="w-5 h-5 text-yellow-400 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.count} calificaciones</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.rating >= 4 ? 'bg-green-500' : item.rating >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top y Bottom Delivery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Delivery */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🏆 Mejores Delivery
            </h2>
            <div className="space-y-4">
              {stats.topDeliveries.map((delivery, index) => (
                <div
                  key={delivery.deliveryId}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setSelectedDelivery(delivery)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{delivery.deliveryName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{delivery.totalRatings} calificaciones</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getRatingColor(delivery.averageRating)}`}>
                        {delivery.averageRating.toFixed(1)}
                      </p>
                      <div className="flex items-center justify-end">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= Math.round(delivery.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Delivery */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              ⚠️ Delivery a Mejorar
            </h2>
            <div className="space-y-4">
              {stats.bottomDeliveries.map((delivery, index) => (
                <div
                  key={delivery.deliveryId}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setSelectedDelivery(delivery)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{delivery.deliveryName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{delivery.totalRatings} calificaciones</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getRatingColor(delivery.averageRating)}`}>
                        {delivery.averageRating.toFixed(1)}
                      </p>
                      <div className="flex items-center justify-end">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= Math.round(delivery.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lista Completa de Delivery */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Calificaciones Detalladas por Delivery
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {deliveryRatings.map((delivery) => (
                <div
                  key={delivery.deliveryId}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setSelectedDelivery(delivery)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{delivery.deliveryName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{delivery.totalRatings} calificaciones totales</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${getRatingColor(delivery.averageRating)}`}>
                        {delivery.averageRating.toFixed(1)}
                      </p>
                      <div className="flex items-center justify-end mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${star <= Math.round(delivery.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Distribución de ratings */}
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {delivery.ratings.map((rating) => (
                      <div key={rating.value} className="text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400">{rating.value}⭐</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{rating.count}</p>
                      </div>
                    ))}
                  </div>

                  {/* Comentarios recientes */}
                  {delivery.recentComments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comentarios Recientes:</p>
                      <div className="space-y-2">
                        {delivery.recentComments.slice(0, 2).map((comment, idx) => (
                          <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-yellow-400">
                                {'⭐'.repeat(comment.rating)}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(comment.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{comment.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal de Detalles */}
        {selectedDelivery && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detalles: {selectedDelivery.deliveryName}
                </h2>
                <button
                  onClick={() => setSelectedDelivery(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Calificación Promedio</p>
                      <p className={`text-3xl font-bold ${getRatingColor(selectedDelivery.averageRating)}`}>
                        {selectedDelivery.averageRating.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total de Calificaciones</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{selectedDelivery.totalRatings}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Distribución de Calificaciones</h3>
                  <div className="space-y-2">
                    {selectedDelivery.ratings.map((rating) => (
                      <div key={rating.value} className="flex items-center gap-3">
                        <span className="w-12 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {rating.value} ⭐
                        </span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                          <div
                            className="bg-primary-500 h-4 rounded-full"
                            style={{ width: `${(rating.count / selectedDelivery.totalRatings) * 100}%` }}
                          ></div>
                        </div>
                        <span className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                          {rating.count} ({((rating.count / selectedDelivery.totalRatings) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Comentarios Recientes</h3>
                  <div className="space-y-3">
                    {selectedDelivery.recentComments.map((comment, idx) => (
                      <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400">
                              {'⭐'.repeat(comment.rating)}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Pedido {comment.orderId}</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(comment.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSatisfaction;

