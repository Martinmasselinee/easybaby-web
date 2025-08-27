import { Reservation } from '@prisma/client';

export type SimpleReservationStatus = 'RESERVED' | 'IN_PROGRESS' | 'COMPLETED' | 'DAMAGED' | 'STOLEN';

export interface ReservationWithDynamicStatus extends Reservation {
  dynamicStatus: SimpleReservationStatus;
  canChangeStatus: boolean;
}

/**
 * Calcule le statut dynamique d'une réservation basé sur les dates
 */
export function calculateDynamicStatus(reservation: Reservation, now: Date = new Date()): SimpleReservationStatus {
  // Si la réservation est annulée, elle reste annulée
  if (reservation.status === 'CANCELLED') {
    return 'RESERVED'; // On la traite comme réservée dans l'interface simplifiée
  }

  // Si manuellement marquée comme endommagée, on garde ce statut
  if (reservation.status === 'DAMAGED') {
    return 'DAMAGED';
  }

  // Cas spécial pour "volé" (utilisation du statut NO_SHOW pour représenter le vol)
  if (reservation.status === 'NO_SHOW') {
    // On peut utiliser un champ personnalisé ou une logique pour différencier vol de no-show
    return 'STOLEN';
  }

  const startTime = new Date(reservation.startAt);
  const endTime = new Date(reservation.endAt);

  // Réservé : avant la date de début
  if (now < startTime) {
    return 'RESERVED';
  }

  // En cours : entre la date de début et de fin
  if (now >= startTime && now <= endTime) {
    return 'IN_PROGRESS';
  }

  // Terminé : après la date de fin
  if (now > endTime) {
    return 'COMPLETED';
  }

  return 'RESERVED';
}

/**
 * Vérifie si l'admin peut changer le statut d'une réservation
 */
export function canChangeReservationStatus(reservation: Reservation, now: Date = new Date()): boolean {
  // Toujours possible de marquer comme endommagé ou volé
  // Sauf si c'est déjà annulé
  return reservation.status !== 'CANCELLED';
}

/**
 * Convertit le statut simple vers le statut Prisma
 */
export function simpleStatusToPrismaStatus(
  simpleStatus: SimpleReservationStatus,
  reservation: Reservation
): 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'NO_SHOW' | 'DAMAGED' | 'CANCELLED' {
  switch (simpleStatus) {
    case 'RESERVED':
      return reservation.status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED';
    case 'IN_PROGRESS':
      return 'CONFIRMED';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'DAMAGED':
      return 'DAMAGED';
    case 'STOLEN':
      return 'NO_SHOW'; // On utilise NO_SHOW pour représenter le vol
    default:
      return 'CONFIRMED';
  }
}

/**
 * Obtient le label français pour le statut
 */
export function getStatusLabel(status: SimpleReservationStatus): string {
  switch (status) {
    case 'RESERVED':
      return 'Réservé';
    case 'IN_PROGRESS':
      return 'En cours';
    case 'COMPLETED':
      return 'Terminé';
    case 'DAMAGED':
      return 'Endommagé';
    case 'STOLEN':
      return 'Volé';
    default:
      return 'Inconnu';
  }
}

/**
 * Obtient la couleur CSS pour le statut
 */
export function getStatusColor(status: SimpleReservationStatus): string {
  switch (status) {
    case 'RESERVED':
      return 'bg-blue-100 text-blue-800';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'DAMAGED':
      return 'bg-red-100 text-red-800';
    case 'STOLEN':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Calcule le montant de la caution à déduire pour un produit endommagé/volé
 */
export function calculateCautionDeduction(
  reservation: Reservation,
  damageType: 'DAMAGED' | 'STOLEN'
): number {
  // Pour l'instant, on déduit 100% de la caution pour tout dommage
  // Dans une vraie application, on pourrait avoir différents pourcentages
  switch (damageType) {
    case 'DAMAGED':
      return reservation.depositCents; // 100% de la caution
    case 'STOLEN':
      return reservation.depositCents; // 100% de la caution
    default:
      return 0;
  }
}

/**
 * Traite en lot les statuts de réservations avec calcul dynamique
 */
export function processReservationsWithDynamicStatus(
  reservations: Reservation[],
  now: Date = new Date()
): ReservationWithDynamicStatus[] {
  return reservations.map(reservation => ({
    ...reservation,
    dynamicStatus: calculateDynamicStatus(reservation, now),
    canChangeStatus: canChangeReservationStatus(reservation, now),
  }));
}

/**
 * Filtre les réservations par statut dynamique
 */
export function filterReservationsByStatus(
  reservations: ReservationWithDynamicStatus[],
  status: SimpleReservationStatus | 'ALL'
): ReservationWithDynamicStatus[] {
  if (status === 'ALL') {
    return reservations;
  }
  
  return reservations.filter(reservation => reservation.dynamicStatus === status);
}

/**
 * Obtient les statistiques des statuts de réservations
 */
export function getReservationStatusStats(reservations: ReservationWithDynamicStatus[]) {
  const stats = {
    RESERVED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    DAMAGED: 0,
    STOLEN: 0,
    TOTAL: reservations.length,
  };

  reservations.forEach(reservation => {
    stats[reservation.dynamicStatus]++;
  });

  return stats;
}
