import { useState } from 'react';

interface Address {
  id: string;
  name: string;
  street: string;
  district: string;
  city: string;
  postalCode: string;
  reference: string;
  isDefault: boolean;
}

const AddressesPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      name: 'Casa',
      street: 'Av. Principal 123',
      district: 'San Isidro',
      city: 'Lima',
      postalCode: '15073',
      reference: 'Frente al parque',
      isDefault: true
    },
    {
      id: '2',
      name: 'Oficina',
      street: 'Jr. Los Olivos 456',
      district: 'Miraflores',
      city: 'Lima',
      postalCode: '15074',
      reference: 'Edificio 2, piso 5',
      isDefault: false
    }
  ]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = () => {
    if (editingId) {
      setAddresses(addresses.map(addr => 
        addr.id === editingId ? { ...formData, id: editingId } : addr
      ));
      setEditingId(null);
    } else {
      const newAddress: Address = {
        ...formData,
        id: Date.now().toString()
      };
      setAddresses([...addresses, newAddress]);
      setIsAdding(false);
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

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta dirección?')) {
      setAddresses(addresses.filter(addr => addr.id !== id));
    }
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

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
                className="px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                Guardar
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

