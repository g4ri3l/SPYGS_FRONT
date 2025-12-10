import { useState, useEffect } from 'react';
import { addressesAPI } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import Loading from '../components/Loading';

interface Address {
  id: string;
  name: string;
  street: string;
  district?: string;
  city: string;
  state?: string;
  zipCode?: string;
  postalCode?: string;
  country?: string;
  reference?: string;
  isDefault: boolean;
}

const AddressesPage = () => {
  const { addNotification } = useNotifications();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    name: '',
    street: '',
    district: '',
    city: '',
    postalCode: '',
    reference: '',
    isDefault: false
  });

  useEffect(() => {
    const loadAddresses = async () => {
      setIsLoading(true);
      try {
        const data = await addressesAPI.getAll();
        const formattedAddresses = (data.addresses || data || []).map((addr: any) => ({
          id: addr.id || addr._id || '',
          name: addr.name || 'Dirección',
          street: addr.street || '',
          district: addr.district || addr.state || '',
          city: addr.city || '',
          postalCode: addr.postalCode || addr.zipCode || '',
          reference: addr.reference || '',
          isDefault: addr.isDefault || false
        }));
        setAddresses(formattedAddresses);
      } catch (err: any) {
        console.error('Error al cargar direcciones:', err);
        addNotification({
          title: 'Error',
          message: 'No se pudieron cargar las direcciones.',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAddresses();
  }, [addNotification]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (editingId) {
        await addressesAPI.update(editingId, {
          street: formData.street,
          city: formData.city,
          state: formData.district || '',
          zipCode: formData.postalCode || '',
          country: 'Perú',
          isDefault: formData.isDefault
        });
        const updated = await addressesAPI.getAll();
        const formattedAddresses = (updated.addresses || updated || []).map((addr: any) => ({
          id: addr.id || addr._id || '',
          name: addr.name || 'Dirección',
          street: addr.street || '',
          district: addr.district || addr.state || '',
          city: addr.city || '',
          postalCode: addr.postalCode || addr.zipCode || '',
          reference: addr.reference || '',
          isDefault: addr.isDefault || false
        }));
        setAddresses(formattedAddresses);
        setEditingId(null);
        addNotification({
          title: 'Dirección actualizada',
          message: 'La dirección se ha actualizado correctamente.',
          type: 'success'
        });
      } else {
        await addressesAPI.add(
          formData.street,
          formData.city,
          formData.district || '',
          formData.postalCode || '',
          'Perú',
          formData.isDefault
        );
        const updated = await addressesAPI.getAll();
        const formattedAddresses = (updated.addresses || updated || []).map((addr: any) => ({
          id: addr.id || addr._id || '',
          name: addr.name || 'Dirección',
          street: addr.street || '',
          district: addr.district || addr.state || '',
          city: addr.city || '',
          postalCode: addr.postalCode || addr.zipCode || '',
          reference: addr.reference || '',
          isDefault: addr.isDefault || false
        }));
        setAddresses(formattedAddresses);
        setIsAdding(false);
        addNotification({
          title: 'Dirección agregada',
          message: 'La dirección se ha agregado correctamente.',
          type: 'success'
        });
      }
      setFormData({
        name: '',
        street: '',
        district: '',
        city: '',
        postalCode: '',
        reference: '',
        isDefault: false
      });
    } catch (err: any) {
      addNotification({
        title: 'Error',
        message: err.message || 'No se pudo guardar la dirección.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      name: address.name,
      street: address.street,
      district: address.district,
      city: address.city,
      postalCode: address.postalCode,
      reference: address.reference,
      isDefault: address.isDefault
    });
    setEditingId(address.id);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta dirección?')) {
      try {
        await addressesAPI.delete(id);
        setAddresses(addresses.filter(addr => addr.id !== id));
        addNotification({
          title: 'Dirección eliminada',
          message: 'La dirección se ha eliminado correctamente.',
          type: 'success'
        });
      } catch (err: any) {
        addNotification({
          title: 'Error',
          message: err.message || 'No se pudo eliminar la dirección.',
          type: 'error'
        });
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const address = addresses.find(addr => addr.id === id);
      if (address) {
        await addressesAPI.update(id, { isDefault: true });
        setAddresses(addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === id
        })));
        addNotification({
          title: 'Dirección predeterminada',
          message: 'La dirección se ha establecido como predeterminada.',
          type: 'success'
        });
      }
    } catch (err: any) {
      addNotification({
        title: 'Error',
        message: err.message || 'No se pudo establecer la dirección predeterminada.',
        type: 'error'
      });
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Cargando direcciones..." />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-fixed p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Direcciones</h1>
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setFormData({
                name: '',
                street: '',
                district: '',
                city: '',
                postalCode: '',
                reference: '',
                isDefault: false
              });
            }}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            + Agregar Dirección
          </button>
        </div>

        {(isAdding || editingId) && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? 'Editar Dirección' : 'Nueva Dirección'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la dirección</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Casa, Oficina"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Calle y número</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Ej: Av. Principal 123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Distrito</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="Ej: San Isidro"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Ej: Lima"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="Ej: 15073"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Referencia</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  placeholder="Ej: Frente al parque"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <label className="ml-2 text-sm text-gray-700">Establecer como dirección predeterminada</label>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="text-center py-16 px-8 bg-white rounded-xl shadow-lg">
            <p className="text-lg text-gray-600 my-2">No tienes direcciones guardadas.</p>
            <p className="text-sm text-gray-400">Agrega una dirección para recibir tus pedidos.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map(address => (
              <div key={address.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{address.name}</h3>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                          Predeterminada
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{address.street}</p>
                    <p className="text-gray-600 text-sm">{address.district}, {address.city}</p>
                    <p className="text-gray-600 text-sm">Código Postal: {address.postalCode}</p>
                    {address.reference && (
                      <p className="text-gray-500 text-sm mt-2">Referencia: {address.reference}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Establecer como predeterminada
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(address)}
                      className="px-3 py-1.5 text-xs bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Eliminar
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

export default AddressesPage;

