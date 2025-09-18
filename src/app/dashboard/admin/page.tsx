'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Driver {
  id: number;
  name: string;
  document: string;
  contact: string;
  email?: string;
  role: string;
  createdAt: string;
}

interface Provider {
  id: number;
  name: string;
  taxId: string;
  contact: string;
}

interface Trip {
  id: number;
  date: string;
  origin: string;
  destination: string;
  driver: { id: number; name: string };
  provider: { id: number; name: string };
  isLiquidated: boolean;
  originTons?: number;
  destinationTons?: number;
  directTons?: number;
  notes?: string;
  valuePerTon?: number;
  currency?: string;
  driverPercentage?: number;
}

interface Liquidation {
  id: number;
  date: string;
  amountUSD: number;
  amountUYU: number;
  amountBRL: number;
  status: 'pending' | 'paid' | 'canceled';
  notes?: string;
  driver?: { id: number; name: string };
}

// Providers Management Component
function ProvidersManagement({ providers, onRefresh }: { 
  providers: Provider[], 
  onRefresh: () => void 
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    taxId: '',
    contact: ''
  });

  const resetForm = () => {
    setFormData({ name: '', taxId: '', contact: '' });
    setEditingProvider(null);
    setShowAddForm(false);
  };

  const handleEdit = (provider: Provider) => {
    setFormData({
      name: provider.name,
      taxId: provider.taxId,
      contact: provider.contact
    });
    setEditingProvider(provider);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProvider 
        ? `/api/providers/${editingProvider.id}`
        : '/api/providers';
      
      const method = editingProvider ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        resetForm();
        onRefresh();
      } else {
        console.error('Error saving provider');
      }
    } catch (error) {
      console.error('Error saving provider:', error);
    }
  };

  const handleDelete = async (providerId: number) => {
    if (confirm('¿Está seguro de que desea eliminar este proveedor?')) {
      try {
        const response = await fetch(`/api/providers/${providerId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          onRefresh();
        } else {
          console.error('Error deleting provider');
        }
      } catch (error) {
        console.error('Error deleting provider:', error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gestión de Proveedores</h2>
        <Button onClick={() => setShowAddForm(true)}>
          Agregar Proveedor
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RUT/CUIT
                </label>
                <Input
                  value={formData.taxId}
                  onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contacto
              </label>
              <Input
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
                required
              />
            </div>
            <div className="flex space-x-4">
              <Button type="submit">
                {editingProvider ? 'Actualizar' : 'Guardar'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RUT/CUIT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {providers.map((provider) => (
              <tr key={provider.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {provider.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {provider.taxId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {provider.contact}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mr-2"
                    onClick={() => handleEdit(provider)}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(provider.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Trips Management Component
function TripsManagement({ trips, drivers, providers, onRefresh }: {
  trips: Trip[],
  drivers: Driver[],
  providers: Provider[],
  onRefresh: () => void
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    origin: '',
    destination: '',
    providerId: '',
    driverId: '',
    originTons: '',
    destinationTons: '',
    directTons: '',
    notes: '',
    valuePerTon: '',
    currency: '$',
    driverPercentage: '100'
  });

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      origin: '',
      destination: '',
      providerId: '',
      driverId: '',
      originTons: '',
      destinationTons: '',
      directTons: '',
      notes: '',
      valuePerTon: '',
      currency: '$',
      driverPercentage: '100'
    });
    setEditingTrip(null);
    setShowAddForm(false);
  };

  const handleEdit = (trip: Trip) => {
    setFormData({
      date: trip.date.split('T')[0],
      origin: trip.origin,
      destination: trip.destination,
      providerId: trip.provider.id.toString(),
      driverId: trip.driver.id.toString(),
      originTons: trip.originTons?.toString() || '',
      destinationTons: trip.destinationTons?.toString() || '',
      directTons: trip.directTons?.toString() || '',
      notes: trip.notes || '',
      valuePerTon: trip.valuePerTon?.toString() || '',
      currency: trip.currency || '$',
      driverPercentage: trip.driverPercentage?.toString() || '100'
    });
    setEditingTrip(trip);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTrip 
        ? `/api/trips/${editingTrip.id}`
        : '/api/trips';
      
      const method = editingTrip ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          providerId: parseInt(formData.providerId),
          driverId: parseInt(formData.driverId),
          originTons: formData.originTons ? parseFloat(formData.originTons) : null,
          destinationTons: formData.destinationTons ? parseFloat(formData.destinationTons) : null,
          directTons: formData.directTons ? parseFloat(formData.directTons) : null,
          valuePerTon: parseFloat(formData.valuePerTon) || 0,
          driverPercentage: parseInt(formData.driverPercentage) || 100
        })
      });

      if (response.ok) {
        resetForm();
        onRefresh();
      } else {
        console.error('Error saving trip');
      }
    } catch (error) {
      console.error('Error saving trip:', error);
    }
  };

  const handleDelete = async (tripId: number) => {
    if (confirm('¿Está seguro de que desea eliminar este viaje?')) {
      try {
        const response = await fetch(`/api/trips/${tripId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          onRefresh();
        } else {
          console.error('Error deleting trip');
        }
      } catch (error) {
        console.error('Error deleting trip:', error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gestión de Viajes</h2>
        <Button onClick={() => setShowAddForm(true)}>
          Agregar Viaje
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingTrip ? 'Editar Viaje' : 'Nuevo Viaje'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chofer
                </label>
                <select
                  value={formData.driverId}
                  onChange={(e) => setFormData({...formData, driverId: e.target.value})}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="">Seleccionar chofer</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor
                </label>
                <select
                  value={formData.providerId}
                  onChange={(e) => setFormData({...formData, providerId: e.target.value})}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="">Seleccionar proveedor</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origen
                </label>
                <Input
                  value={formData.origin}
                  onChange={(e) => setFormData({...formData, origin: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destino
                </label>
                <Input
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor por Tonelada
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valuePerTon}
                  onChange={(e) => setFormData({...formData, valuePerTon: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="$">$ (Pesos Uruguayos)</option>
                  <option value="USD">USD (Dólares)</option>
                  <option value="R$">R$ (Reales)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  % Chofer
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.driverPercentage}
                  onChange={(e) => setFormData({...formData, driverPercentage: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Toneladas Origen
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.originTons}
                  onChange={(e) => setFormData({...formData, originTons: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Toneladas Destino
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.destinationTons}
                  onChange={(e) => setFormData({...formData, destinationTons: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Toneladas Directas
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.directTons}
                  onChange={(e) => setFormData({...formData, directTons: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex space-x-4">
              <Button type="submit">
                {editingTrip ? 'Actualizar' : 'Guardar'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chofer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ruta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trips.map((trip) => (
              <tr key={trip.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(trip.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trip.driver.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trip.provider.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trip.origin} → {trip.destination}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    trip.isLiquidated 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {trip.isLiquidated ? 'Liquidado' : 'Pendiente'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mr-2"
                    onClick={() => handleEdit(trip)}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(trip.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Liquidations Management Component  
function LiquidationsManagement({ drivers, onRefresh }: {
  drivers: Driver[],
  onRefresh: () => void
}) {
  const [liquidations, setLiquidations] = useState<Liquidation[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    driverId: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchLiquidations = async () => {
    try {
      const response = await fetch('/api/liquidations');
      if (response.ok) {
        const data = await response.json();
        setLiquidations(data);
      }
    } catch (error) {
      console.error('Error fetching liquidations:', error);
    }
  };

  useEffect(() => {
    fetchLiquidations();
  }, []);

  const resetForm = () => {
    setFormData({
      driverId: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/liquidations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          driverId: parseInt(formData.driverId)
        })
      });

      if (response.ok) {
        resetForm();
        fetchLiquidations();
        onRefresh();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving liquidation:', error);
    }
  };

  const handleDelete = async (liquidationId: number) => {
    if (confirm('¿Está seguro de que desea eliminar esta liquidación?')) {
      try {
        const response = await fetch(`/api/liquidations/${liquidationId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchLiquidations();
          onRefresh();
        } else {
          console.error('Error deleting liquidation');
        }
      } catch (error) {
        console.error('Error deleting liquidation:', error);
      }
    }
  };

  const updateStatus = async (liquidationId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/liquidations/${liquidationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchLiquidations();
      } else {
        console.error('Error updating liquidation status');
      }
    } catch (error) {
      console.error('Error updating liquidation status:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gestión de Liquidaciones</h2>
        <Button onClick={() => setShowAddForm(true)}>
          Crear Liquidación
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Nueva Liquidación</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chofer
                </label>
                <select
                  value={formData.driverId}
                  onChange={(e) => setFormData({...formData, driverId: e.target.value})}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="">Seleccionar chofer</option>
                  {drivers.filter(d => d.role === 'driver').map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Liquidación
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                placeholder="Notas adicionales sobre la liquidación..."
              />
            </div>
            <div className="flex space-x-4">
              <Button type="submit">Crear Liquidación</Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chofer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {liquidations.map((liquidation) => (
              <tr key={liquidation.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(liquidation.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {liquidation.driver?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="text-xs">
                    {liquidation.amountUSD > 0 && <div>USD: ${liquidation.amountUSD}</div>}
                    {liquidation.amountUYU > 0 && <div>$: ${liquidation.amountUYU}</div>}
                    {liquidation.amountBRL > 0 && <div>R$: ${liquidation.amountBRL}</div>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={liquidation.status}
                    onChange={(e) => updateStatus(liquidation.id, e.target.value)}
                    className={`text-xs font-semibold rounded px-2 py-1 border-0 ${
                      liquidation.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : liquidation.status === 'canceled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
                    <option value="canceled">Cancelado</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(liquidation.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {liquidations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay liquidaciones registradas.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'admin') {
      router.push('/login');
      return;
    }

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [driversRes, providersRes, tripsRes] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/providers'),
        fetch('/api/trips')
      ]);

      if (driversRes.ok && providersRes.ok && tripsRes.ok) {
        const driversData = await driversRes.json();
        const providersData = await providersRes.json();
        const tripsData = await tripsRes.json();
        
        setDrivers(driversData);
        setProviders(providersData);
        setTrips(tripsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Cargando...</div>;
  }

  const stats = {
    totalDrivers: drivers.length,
    totalProviders: providers.length,
    totalTrips: trips.length,
    pendingTrips: trips.filter(t => !t.isLiquidated).length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gestión completa del sistema de transporte
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Resumen' },
            { id: 'drivers', name: 'Choferes' },
            { id: 'providers', name: 'Proveedores' },
            { id: 'trips', name: 'Viajes' },
            { id: 'liquidations', name: 'Liquidaciones' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">C</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Choferes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalDrivers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">P</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Proveedores
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalProviders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">V</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Viajes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalTrips}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">L</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Viajes Pendientes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.pendingTrips}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Viajes Recientes
              </h3>
              {trips.slice(0, 5).length === 0 ? (
                <p className="text-gray-500">No hay viajes registrados.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Chofer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Proveedor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ruta
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {trips.slice(0, 5).map((trip) => (
                        <tr key={trip.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(trip.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {trip.driver.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {trip.provider.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {trip.origin} → {trip.destination}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              trip.isLiquidated 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {trip.isLiquidated ? 'Liquidado' : 'Pendiente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Drivers Tab */}
      {activeTab === 'drivers' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Gestión de Choferes</h2>
            <Button>Agregar Chofer</Button>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {driver.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.document}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.contact}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        driver.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {driver.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="outline" size="sm" className="mr-2">
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm">
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <ProvidersManagement 
          providers={providers}
          onRefresh={fetchData}
        />
      )}

      {/* Trips Tab */}
      {activeTab === 'trips' && (
        <TripsManagement 
          trips={trips}
          drivers={drivers}
          providers={providers}
          onRefresh={fetchData}
        />
      )}

      {/* Liquidations Tab */}
      {activeTab === 'liquidations' && (
        <LiquidationsManagement 
          drivers={drivers}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}