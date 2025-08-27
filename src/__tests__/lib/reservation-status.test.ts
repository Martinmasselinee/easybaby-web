import { describe, it, expect } from 'vitest';
import {
  calculateDynamicStatus,
  canChangeReservationStatus,
  simpleStatusToPrismaStatus,
  getStatusLabel,
  getStatusColor,
  calculateCautionDeduction,
  processReservationsWithDynamicStatus,
  filterReservationsByStatus,
  getReservationStatusStats
} from '@/lib/reservation-status';
import type { Reservation } from '@prisma/client';

// Mock d'une réservation
const createMockReservation = (overrides: Partial<Reservation> = {}): Reservation => ({
  id: 'test-id',
  code: 'TEST001',
  userEmail: 'test@example.com',
  userPhone: null,
  cityId: 'city-1',
  pickupHotelId: 'hotel-1',
  dropHotelId: 'hotel-1',
  productId: 'product-1',
  startAt: new Date('2024-01-15T10:00:00Z'),
  endAt: new Date('2024-01-17T10:00:00Z'),
  status: 'CONFIRMED',
  durationHours: 48,
  durationDays: 2,
  pricingType: 'DAILY',
  priceCents: 10000,
  depositCents: 5000,
  stripePaymentIntentId: null,
  stripeSetupIntentId: null,
  discountCodeId: null,
  revenueShareApplied: 'PLATFORM_70',
  revenueComputedCents: 0,
  createdAt: new Date('2024-01-10T10:00:00Z'),
  updatedAt: new Date('2024-01-10T10:00:00Z'),
  ...overrides
});

describe('Reservation Status Utils', () => {
  describe('calculateDynamicStatus', () => {
    it('should return RESERVED for future reservations', () => {
      const futureReservation = createMockReservation({
        startAt: new Date('2025-01-15T10:00:00Z'),
        endAt: new Date('2025-01-17T10:00:00Z')
      });
      
      const status = calculateDynamicStatus(futureReservation, new Date('2024-12-01T10:00:00Z'));
      expect(status).toBe('RESERVED');
    });

    it('should return IN_PROGRESS for current reservations', () => {
      const currentReservation = createMockReservation({
        startAt: new Date('2024-01-14T10:00:00Z'),
        endAt: new Date('2024-01-16T10:00:00Z')
      });
      
      const status = calculateDynamicStatus(currentReservation, new Date('2024-01-15T10:00:00Z'));
      expect(status).toBe('IN_PROGRESS');
    });

    it('should return COMPLETED for past reservations', () => {
      const pastReservation = createMockReservation({
        startAt: new Date('2024-01-10T10:00:00Z'),
        endAt: new Date('2024-01-12T10:00:00Z')
      });
      
      const status = calculateDynamicStatus(pastReservation, new Date('2024-01-15T10:00:00Z'));
      expect(status).toBe('COMPLETED');
    });

    it('should return DAMAGED for damaged reservations', () => {
      const damagedReservation = createMockReservation({ status: 'DAMAGED' });
      
      const status = calculateDynamicStatus(damagedReservation);
      expect(status).toBe('DAMAGED');
    });

    it('should return STOLEN for NO_SHOW reservations', () => {
      const stolenReservation = createMockReservation({ status: 'NO_SHOW' });
      
      const status = calculateDynamicStatus(stolenReservation);
      expect(status).toBe('STOLEN');
    });
  });

  describe('canChangeReservationStatus', () => {
    it('should allow changes for non-cancelled reservations', () => {
      const reservation = createMockReservation({ status: 'CONFIRMED' });
      
      const canChange = canChangeReservationStatus(reservation);
      expect(canChange).toBe(true);
    });

    it('should not allow changes for cancelled reservations', () => {
      const reservation = createMockReservation({ status: 'CANCELLED' });
      
      const canChange = canChangeReservationStatus(reservation);
      expect(canChange).toBe(false);
    });
  });

  describe('getStatusLabel', () => {
    it('should return correct French labels', () => {
      expect(getStatusLabel('RESERVED')).toBe('Réservé');
      expect(getStatusLabel('IN_PROGRESS')).toBe('En cours');
      expect(getStatusLabel('COMPLETED')).toBe('Terminé');
      expect(getStatusLabel('DAMAGED')).toBe('Endommagé');
      expect(getStatusLabel('STOLEN')).toBe('Volé');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct CSS classes', () => {
      expect(getStatusColor('RESERVED')).toBe('bg-blue-100 text-blue-800');
      expect(getStatusColor('IN_PROGRESS')).toBe('bg-yellow-100 text-yellow-800');
      expect(getStatusColor('COMPLETED')).toBe('bg-green-100 text-green-800');
      expect(getStatusColor('DAMAGED')).toBe('bg-red-100 text-red-800');
      expect(getStatusColor('STOLEN')).toBe('bg-purple-100 text-purple-800');
    });
  });

  describe('calculateCautionDeduction', () => {
    it('should deduct full deposit for damaged products', () => {
      const reservation = createMockReservation({ depositCents: 5000 });
      
      const deduction = calculateCautionDeduction(reservation, 'DAMAGED');
      expect(deduction).toBe(5000);
    });

    it('should deduct full deposit for stolen products', () => {
      const reservation = createMockReservation({ depositCents: 7500 });
      
      const deduction = calculateCautionDeduction(reservation, 'STOLEN');
      expect(deduction).toBe(7500);
    });
  });

  describe('processReservationsWithDynamicStatus', () => {
    it('should add dynamic status to reservations', () => {
      const reservations = [
        createMockReservation({
          startAt: new Date('2025-01-15T10:00:00Z'),
          endAt: new Date('2025-01-17T10:00:00Z')
        }),
        createMockReservation({
          status: 'DAMAGED'
        })
      ];
      
      const processed = processReservationsWithDynamicStatus(reservations, new Date('2024-12-01T10:00:00Z'));
      
      expect(processed).toHaveLength(2);
      expect(processed[0].dynamicStatus).toBe('RESERVED');
      expect(processed[0].canChangeStatus).toBe(true);
      expect(processed[1].dynamicStatus).toBe('DAMAGED');
    });
  });

  describe('filterReservationsByStatus', () => {
    it('should filter reservations by status', () => {
      const reservations = [
        { dynamicStatus: 'RESERVED' },
        { dynamicStatus: 'IN_PROGRESS' },
        { dynamicStatus: 'RESERVED' }
      ] as any;
      
      const filtered = filterReservationsByStatus(reservations, 'RESERVED');
      expect(filtered).toHaveLength(2);
    });

    it('should return all reservations for ALL filter', () => {
      const reservations = [
        { dynamicStatus: 'RESERVED' },
        { dynamicStatus: 'IN_PROGRESS' },
        { dynamicStatus: 'COMPLETED' }
      ] as any;
      
      const filtered = filterReservationsByStatus(reservations, 'ALL');
      expect(filtered).toHaveLength(3);
    });
  });

  describe('getReservationStatusStats', () => {
    it('should calculate correct statistics', () => {
      const reservations = [
        { dynamicStatus: 'RESERVED' },
        { dynamicStatus: 'RESERVED' },
        { dynamicStatus: 'IN_PROGRESS' },
        { dynamicStatus: 'COMPLETED' },
        { dynamicStatus: 'DAMAGED' }
      ] as any;
      
      const stats = getReservationStatusStats(reservations);
      
      expect(stats.RESERVED).toBe(2);
      expect(stats.IN_PROGRESS).toBe(1);
      expect(stats.COMPLETED).toBe(1);
      expect(stats.DAMAGED).toBe(1);
      expect(stats.STOLEN).toBe(0);
      expect(stats.TOTAL).toBe(5);
    });
  });
});
