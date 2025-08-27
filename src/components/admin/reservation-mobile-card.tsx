'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Reservation {
  id: string;
  code: string;
  status: string;
  productName: string;
  userEmail: string;
  pickupDate: Date;
  dropoffDate: Date;
  hotel: string;
  city: string;
}

interface ReservationMobileCardProps {
  reservation: Reservation;
}

export function ReservationMobileCard({ reservation }: ReservationMobileCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'NO_SHOW':
        return 'bg-purple-100 text-purple-800';
      case 'DAMAGED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmée';
      case 'PENDING':
        return 'En attente';
      case 'COMPLETED':
        return 'Terminée';
      case 'CANCELLED':
        return 'Annulée';
      case 'NO_SHOW':
        return 'Non présenté';
      case 'DAMAGED':
        return 'Endommagé';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      {/* Header avec code et statut */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{reservation.code}</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            reservation.status
          )}`}
        >
          {getStatusText(reservation.status)}
        </span>
      </div>

      {/* Produit et client */}
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-600">Produit:</span>
          <p className="text-sm">{reservation.productName}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-600">Client:</span>
          <p className="text-sm">{reservation.userEmail}</p>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm font-medium text-gray-600">Retrait:</span>
          <p className="text-sm">
            {reservation.pickupDate.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-600">Retour:</span>
          <p className="text-sm">
            {reservation.dropoffDate.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Hôtel et ville */}
      <div>
        <span className="text-sm font-medium text-gray-600">Hôtel:</span>
        <p className="text-sm">{reservation.hotel}</p>
        <p className="text-xs text-gray-500">{reservation.city}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          asChild
        >
          <Link href={`/admin/reservations/${reservation.id}`}>
            Voir
          </Link>
        </Button>
      </div>
    </div>
  );
}
