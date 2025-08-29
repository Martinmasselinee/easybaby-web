'use client';

import { useState, useEffect } from 'react';
import { UniversalAdminLayout, PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/admin/universal-admin-layout';

interface Reservation {
  id: string;
  code: string;
  userEmail: string;
  userPhone?: string;
  status: string;
  startAt: string;
  endAt: string;
  priceCents: number;
  depositCents: number;
  city: {
    name: string;
  };
  pickupHotel: {
    name: string;
  };
  dropHotel: {
    name: string;
  };
  product: {
    name: string;
  };
  createdAt: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reservations');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement');
      }
      
      const data = await response.json();
      setReservations(data);
      setError(null);
    } catch (error: any) {
      console.error('Erreur lors du fetch des réservations:', error);
      setError(error.message);
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (priceCents: number) => {
    return `${(priceCents / 100).toFixed(2)}€`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'CONFIRMED': return 'bg-gray-900 text-white';
      case 'CANCELLED': return 'bg-gray-200 text-gray-600';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <LoadingState 
        title="Réservations"
        message="Chargement des réservations..."
      />
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Réservations"
        error={error}
        onRetry={fetchReservations}
      />
    );
  }

  return (
    <UniversalAdminLayout>
      <PageHeader 
        title="Réservations"
        actions={
          <button 
            onClick={fetchReservations}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
          >
            Actualiser
          </button>
        }
      />

      {reservations.length === 0 ? (
        <EmptyState 
          icon="📅"
          title="Aucune réservation"
          description="Les réservations des utilisateurs apparaîtront ici une fois qu'ils auront créé des réservations. Assurez-vous d'avoir créé des villes, hôtels et produits pour permettre aux utilisateurs de faire des réservations."
        />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reservation.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{reservation.userEmail}</div>
                        {reservation.userPhone && (
                          <div className="text-gray-500">{reservation.userPhone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{reservation.product.name}</div>
                        <div className="text-gray-500">
                          {reservation.pickupHotel.name} → {reservation.dropHotel.name}
                        </div>
                        <div className="text-gray-500 text-xs">{reservation.city.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>Du {formatDate(reservation.startAt)}</div>
                        <div>Au {formatDate(reservation.endAt)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{formatPrice(reservation.priceCents)}</div>
                        <div className="text-gray-500 text-xs">
                          Caution: {formatPrice(reservation.depositCents)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </UniversalAdminLayout>
  );
}
