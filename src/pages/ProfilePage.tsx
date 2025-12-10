import { useState, useEffect } from 'react';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useI18n } from '../context/I18nContext';
import Loading from '../components/Loading';

const ProfilePage = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { addNotification } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    birthDate: '',
    gender: 'No especificado'
  });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const data = await profileAPI.get();
        setFormData({
          name: data.name || data.user?.name || user?.name || '',
          email: data.email || data.user?.email || user?.email || '',
          phone: data.phone || '',
          birthDate: data.birthDate || '',
          gender: data.gender || 'No especificado'
        });
      } catch (err: any) {
        console.error('Error al cargar perfil:', err);
        // Usar datos del usuario autenticado como fallback
        if (user) {
          setFormData({
            name: user.name,
            email: user.email,
            phone: '',
            birthDate: '',
            gender: 'No especificado'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await profileAPI.update(formData.name, formData.email);
      setIsEditing(false);
      addNotification({
        title: t('profile.profileUpdated'),
        message: t('profile.profileUpdated'),
        type: 'success'
      });
    } catch (err: any) {
      addNotification({
        title: t('common.error'),
        message: err.message || t('common.error'),
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen text={t('common.loading')} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-fixed p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('profile.title')}</h1>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          {/* Avatar y Header */}
          <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {formData.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900">{formData.name}</h2>
              <p className="text-gray-600 mt-1">{formData.email}</p>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="mt-3 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                {isEditing ? t('common.cancel') : t('profile.editProfile')}
              </button>
            </div>
          </div>

          {/* Información Personal */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Información Personal</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.name')}</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.email')}</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{new Date(formData.birthDate).toLocaleDateString('es-PE')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="No especificado">No especificado</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{formData.gender}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? t('common.loading') : t('profile.saveChanges')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pedidos Totales</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Favoritos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">5</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Miembro desde</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">2024</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

