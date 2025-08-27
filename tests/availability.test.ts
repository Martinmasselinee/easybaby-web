import { describe, it, expect } from 'vitest';

// Fonction pour vérifier le chevauchement de deux périodes
function isOverlapping(
  periodA: { start: Date; end: Date },
  periodB: { start: Date; end: Date }
): boolean {
  return periodA.start < periodB.end && periodA.end > periodB.start;
}

describe('Logique de chevauchement de disponibilité', () => {
  // Test de chevauchement évident
  it('détecte un chevauchement évident', () => {
    const periodA = {
      start: new Date('2023-07-15T10:00:00'),
      end: new Date('2023-07-20T14:00:00'),
    };
    const periodB = {
      start: new Date('2023-07-18T10:00:00'),
      end: new Date('2023-07-25T14:00:00'),
    };
    
    expect(isOverlapping(periodA, periodB)).toBe(true);
    expect(isOverlapping(periodB, periodA)).toBe(true); // Commutativité
  });
  
  // Test de périodes adjacentes (non chevauchantes)
  it('ne détecte pas de chevauchement pour des périodes adjacentes', () => {
    const periodA = {
      start: new Date('2023-07-15T10:00:00'),
      end: new Date('2023-07-20T14:00:00'),
    };
    const periodB = {
      start: new Date('2023-07-20T14:00:00'), // Commence exactement quand A se termine
      end: new Date('2023-07-25T14:00:00'),
    };
    
    expect(isOverlapping(periodA, periodB)).toBe(false);
    expect(isOverlapping(periodB, periodA)).toBe(false); // Commutativité
  });
  
  // Test de périodes disjointes
  it('ne détecte pas de chevauchement pour des périodes disjointes', () => {
    const periodA = {
      start: new Date('2023-07-15T10:00:00'),
      end: new Date('2023-07-20T14:00:00'),
    };
    const periodB = {
      start: new Date('2023-07-21T10:00:00'),
      end: new Date('2023-07-25T14:00:00'),
    };
    
    expect(isOverlapping(periodA, periodB)).toBe(false);
    expect(isOverlapping(periodB, periodA)).toBe(false); // Commutativité
  });
  
  // Test de période incluse dans une autre
  it('détecte un chevauchement quand une période est incluse dans l\'autre', () => {
    const periodA = {
      start: new Date('2023-07-15T10:00:00'),
      end: new Date('2023-07-25T14:00:00'),
    };
    const periodB = {
      start: new Date('2023-07-18T10:00:00'),
      end: new Date('2023-07-20T14:00:00'),
    };
    
    expect(isOverlapping(periodA, periodB)).toBe(true);
    expect(isOverlapping(periodB, periodA)).toBe(true); // Commutativité
  });
  
  // Test avec des périodes de même début
  it('détecte un chevauchement pour des périodes commençant au même moment', () => {
    const periodA = {
      start: new Date('2023-07-15T10:00:00'),
      end: new Date('2023-07-20T14:00:00'),
    };
    const periodB = {
      start: new Date('2023-07-15T10:00:00'),
      end: new Date('2023-07-25T14:00:00'),
    };
    
    expect(isOverlapping(periodA, periodB)).toBe(true);
    expect(isOverlapping(periodB, periodA)).toBe(true); // Commutativité
  });
  
  // Test avec des périodes de même fin
  it('détecte un chevauchement pour des périodes se terminant au même moment', () => {
    const periodA = {
      start: new Date('2023-07-15T10:00:00'),
      end: new Date('2023-07-20T14:00:00'),
    };
    const periodB = {
      start: new Date('2023-07-18T10:00:00'),
      end: new Date('2023-07-20T14:00:00'),
    };
    
    expect(isOverlapping(periodA, periodB)).toBe(true);
    expect(isOverlapping(periodB, periodA)).toBe(true); // Commutativité
  });
  
  // Test avec des périodes identiques
  it('détecte un chevauchement pour des périodes identiques', () => {
    const periodA = {
      start: new Date('2023-07-15T10:00:00'),
      end: new Date('2023-07-20T14:00:00'),
    };
    const periodB = {
      start: new Date('2023-07-15T10:00:00'),
      end: new Date('2023-07-20T14:00:00'),
    };
    
    expect(isOverlapping(periodA, periodB)).toBe(true);
    expect(isOverlapping(periodB, periodA)).toBe(true); // Commutativité
  });
});
