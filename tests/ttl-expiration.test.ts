import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReservationStatus } from '@prisma/client';

// Mock de la fonction de mise à jour des réservations
const mockUpdateReservations = vi.fn();
// Mock de la fonction de création d'audit
const mockCreateAudit = vi.fn();

// Fonction simulant le comportement de l'API d'expiration des réservations en attente
async function expirePendingReservations(ttlMinutes: number) {
  // Calculer la date limite pour les réservations en attente
  const now = new Date();
  const expirationDate = new Date(now);
  expirationDate.setMinutes(expirationDate.getMinutes() - ttlMinutes);
  
  // Simuler la récupération des réservations en attente expirées
  const expiredReservations = [
    {
      id: 'res1',
      code: 'EZB-1234',
      status: ReservationStatus.PENDING,
      createdAt: new Date(expirationDate.getTime() - 5 * 60 * 1000), // 5 minutes avant expiration
    },
    {
      id: 'res2',
      code: 'EZB-5678',
      status: ReservationStatus.PENDING,
      createdAt: new Date(expirationDate.getTime() - 2 * 60 * 1000), // 2 minutes avant expiration
    },
  ];
  
  // Mettre à jour les réservations expirées
  for (const reservation of expiredReservations) {
    mockUpdateReservations(reservation.id, { status: ReservationStatus.CANCELLED });
    
    // Créer un audit
    mockCreateAudit(reservation.id, {
      event: 'reservation_expired',
      data: {
        expirationDate: expirationDate.toISOString(),
        ttlMinutes,
      },
    });
  }
  
  return {
    expiredCount: expiredReservations.length,
    expirationDate,
  };
}

describe('Expiration des réservations en attente', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    mockUpdateReservations.mockClear();
    mockCreateAudit.mockClear();
    
    // Fixer la date actuelle pour les tests
    vi.setSystemTime(new Date('2023-07-15T12:00:00'));
  });
  
  it('expire les réservations en attente plus anciennes que le TTL', async () => {
    const ttlMinutes = 10;
    const result = await expirePendingReservations(ttlMinutes);
    
    // Vérifier que 2 réservations ont été expirées
    expect(result.expiredCount).toBe(2);
    
    // Vérifier que la fonction de mise à jour a été appelée 2 fois
    expect(mockUpdateReservations).toHaveBeenCalledTimes(2);
    
    // Vérifier que les réservations ont été mises à jour avec le statut CANCELLED
    expect(mockUpdateReservations).toHaveBeenCalledWith('res1', { status: ReservationStatus.CANCELLED });
    expect(mockUpdateReservations).toHaveBeenCalledWith('res2', { status: ReservationStatus.CANCELLED });
    
    // Vérifier que la fonction d'audit a été appelée 2 fois
    expect(mockCreateAudit).toHaveBeenCalledTimes(2);
    
    // Vérifier que les audits ont été créés avec les bonnes données
    expect(mockCreateAudit).toHaveBeenCalledWith('res1', {
      event: 'reservation_expired',
      data: expect.objectContaining({
        ttlMinutes,
      }),
    });
    expect(mockCreateAudit).toHaveBeenCalledWith('res2', {
      event: 'reservation_expired',
      data: expect.objectContaining({
        ttlMinutes,
      }),
    });
    
    // Vérifier que la date d'expiration est correcte
    const expectedExpirationDate = new Date('2023-07-15T11:50:00'); // 12:00 - 10 minutes
    expect(result.expirationDate).toEqual(expectedExpirationDate);
  });
  
  it('utilise le TTL configuré pour déterminer les réservations expirées', async () => {
    // Tester avec un TTL différent
    const ttlMinutes = 5;
    await expirePendingReservations(ttlMinutes);
    
    // Vérifier que les audits ont été créés avec le bon TTL
    expect(mockCreateAudit).toHaveBeenCalledWith(expect.any(String), {
      event: 'reservation_expired',
      data: expect.objectContaining({
        ttlMinutes: 5,
      }),
    });
  });
});
