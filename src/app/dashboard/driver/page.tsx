'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Trip {
  id: number;
  date: string;
  origin: string;
  destination: string;
  originTons?: number;
  destinationTons?: number;
  directTons?: number;
  notes?: string;
  valuePerTon: number;
  currency: string;
  driverPercentage: number;
  isLiquidated: boolean;
  provider: {
    id: number;
    name: string;
  };
}

interface Provider {
  id: number;
  name: string;
  taxId: string;
  contact: string;
}

export default function DriverDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTrip, setShowAddTrip] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    origin: '',
    destination: '',
    providerId: '',
    originTons: '',
    destinationTons: '',
    directTons: '',
    notes: '',
    valuePerTon: '',
    currency: '$',
    driverPercentage: '100'
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'driver') {
      router.push('/login');
      return;
    }

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [tripsRes, providersRes] = await Promise.all([
        fetch('/api/trips'),
        fetch('/api/providers')
      ]);

      if (tripsRes.ok && providersRes.ok) {
        const tripsData = await tripsRes.json();
        const providersData = await providersRes.json();
        setTrips(tripsData);
        setProviders(providersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          driverId: parseInt(session?.user.id || '0'),
          providerId: parseInt(formData.providerId),
          originTons: formData.originTons ? parseFloat(formData.originTons) : null,
          destinationTons: formData.destinationTons ? parseFloat(formData.destinationTons) : null,
          directTons: formData.directTons ? parseFloat(formData.directTons) : null,
          valuePerTon: parseFloat(formData.valuePerTon) || 0,
          driverPercentage: parseFloat(formData.driverPercentage) || 100,
        }),
      });

      if (response.ok) {
        setShowAddTrip(false);
        setFormData({
          date: new Date().toISOString().split('T')[0],
          origin: '',
          destination: '',
          providerId: '',
          originTons: '',
          destinationTons: '',
          directTons: '',
          notes: '',
          valuePerTon: '',
          currency: '$',
          driverPercentage: '100'
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };

  if (loading) {
    return <div className="text-center">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel del Chofer</h1>
        <Button onClick={() => setShowAddTrip(true)}>
          Agregar Viaje
        </Button>
      </div>

      {showAddTrip && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Nuevo Viaje</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Proveedor
                </label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.providerId}
                  onChange={(e) => setFormData({...formData, providerId: e.target.value})}
                  required
                >
                  <option value="">Seleccionar proveedor</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Button type="submit">Guardar Viaje</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddTrip(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Mis Viajes
          </h3>
          
          {trips.length === 0 ? (
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
                      Proveedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ruta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Toneladas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
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
                        {trip.provider.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.origin} → {trip.destination}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.directTons || 
                         (trip.originTons && trip.destinationTons ? 
                          Math.abs(trip.originTons - trip.destinationTons) : 
                          trip.originTons || trip.destinationTons || 0)}
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
  );
}