'use client';

import { useState, useEffect } from 'react';
import { UniversalAdminLayout, PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/admin/universal-admin-layout';
import { GrayEmptyState, TableWrapper, TABLE_STYLES } from '@/components/admin/reusable-empty-states';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye } from 'lucide-react';

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
        subtitle="Consultez et gérez toutes les réservations de vos clients"
        actions={
          <Button 
            onClick={fetchReservations}
            variant="outline"
          >
            Actualiser
          </Button>
        }
      />

      {reservations.length === 0 ? (
        <GrayEmptyState
          icon="📅"
          title="Aucune réservation"
          description="Les réservations de vos clients apparaîtront ici une fois qu'ils commenceront à réserver vos équipements via votre site."
        >
          <Button onClick={fetchReservations} variant="outline">
            Actualiser
          </Button>
        </GrayEmptyState>
      ) : (
        <TableWrapper>
          <table className={TABLE_STYLES.table}>
              <thead className={TABLE_STYLES.thead}>
                <tr>
                  <th className={TABLE_STYLES.th}>Code</th>
                  <th className={TABLE_STYLES.th}>Client</th>
                  <th className={TABLE_STYLES.th}>Produit</th>
                  <th className={TABLE_STYLES.th}>Période</th>
                  <th className={TABLE_STYLES.th}>Prix</th>
                  <th className={TABLE_STYLES.th}>Statut</th>
                  <th className={TABLE_STYLES.th}>Actions</th>
                </tr>
              </thead>
              <tbody className={TABLE_STYLES.tbody}>
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className={TABLE_STYLES.tr}>
                    <td className={TABLE_STYLES.td}>
                      {reservation.code}
                    </td>
                    <td className={TABLE_STYLES.tdSecondary}>
                      <div>
                        <div className="font-medium text-gray-900">{reservation.userEmail}</div>
                        {reservation.userPhone && (
                          <div className="text-gray-500">{reservation.userPhone}</div>
                        )}
                      </div>
                    </td>
                    <td className={TABLE_STYLES.tdSecondary}>
                      <div>
                        <div className="font-medium text-gray-900">{reservation.product.name}</div>
                        <div className="text-gray-500">
                          {reservation.pickupHotel.name} → {reservation.dropHotel.name}
                        </div>
                        <div className="text-gray-500 text-xs">{reservation.city.name}</div>
                      </div>
                    </td>
                    <td className={TABLE_STYLES.tdSecondary}>
                      <div>
                        <div>Du {formatDate(reservation.startAt)}</div>
                        <div>Au {formatDate(reservation.endAt)}</div>
                      </div>
                    </td>
                    <td className={TABLE_STYLES.tdSecondary}>
                      <div>
                        <div className="font-medium text-gray-900">{formatPrice(reservation.priceCents)}</div>
                        <div className="text-gray-500 text-xs">
                          Caution: {formatPrice(reservation.depositCents)}
                        </div>
                      </div>
                    </td>
                    <td className={TABLE_STYLES.tdSecondary}>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </td>
                    <td className={TABLE_STYLES.actions}>
                      <div className="flex justify-end space-x-2">
                        <Link href={`/admin/reservations/${reservation.id}`}>
                          <Button variant="outline" size="sm" className="border-gray-200">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </TableWrapper>
      )}
    </UniversalAdminLayout>
  );
}
