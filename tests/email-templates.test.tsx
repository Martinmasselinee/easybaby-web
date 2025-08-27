import { describe, it, expect } from 'vitest';
import { render } from '@react-email/render';
import UserConfirmationEmail from '@/components/emails/user-confirmation-email';
import HotelNotificationEmail from '@/components/emails/hotel-notification-email';
import React from 'react';

describe('Templates d\'emails', () => {
  describe('Email de confirmation utilisateur', () => {
    it('rend correctement avec toutes les données requises', () => {
      const props = {
        reservationCode: 'EZB-1234',
        productName: 'Poussette',
        pickupHotel: 'Hôtel Demo Paris',
        pickupDate: '15 juillet 2023 à 10:00',
        dropoffHotel: 'Hôtel Demo Paris',
        dropoffDate: '20 juillet 2023 à 14:00',
        depositAmount: '150,00 €',
      };
      
      const html = render(<UserConfirmationEmail {...props} />);
      
      // Vérifier que l'email contient les informations essentielles
      expect(html).toContain('EZB-1234'); // Code de réservation
      expect(html).toContain('Poussette'); // Nom du produit
      expect(html).toContain('Hôtel Demo Paris'); // Nom de l'hôtel
      expect(html).toContain('15 juillet 2023 à 10:00'); // Date de retrait
      expect(html).toContain('20 juillet 2023 à 14:00'); // Date de retour
      expect(html).toContain('150,00 €'); // Montant du dépôt
    });
    
    it('inclut le code de réduction si fourni', () => {
      const props = {
        reservationCode: 'EZB-1234',
        productName: 'Poussette',
        pickupHotel: 'Hôtel Demo Paris',
        pickupDate: '15 juillet 2023 à 10:00',
        dropoffHotel: 'Hôtel Demo Paris',
        dropoffDate: '20 juillet 2023 à 14:00',
        depositAmount: '150,00 €',
        discountCode: 'HOTELPARIS70',
      };
      
      const html = render(<UserConfirmationEmail {...props} />);
      
      // Vérifier que l'email contient le code de réduction
      expect(html).toContain('HOTELPARIS70');
    });
    
    it('n\'inclut pas la section de code de réduction si non fourni', () => {
      const props = {
        reservationCode: 'EZB-1234',
        productName: 'Poussette',
        pickupHotel: 'Hôtel Demo Paris',
        pickupDate: '15 juillet 2023 à 10:00',
        dropoffHotel: 'Hôtel Demo Paris',
        dropoffDate: '20 juillet 2023 à 14:00',
        depositAmount: '150,00 €',
      };
      
      const html = render(<UserConfirmationEmail {...props} />);
      
      // Vérifier que l'email ne contient pas de mention de code de réduction
      expect(html).not.toContain('Code utilisé');
    });
  });
  
  describe('Email de notification hôtel', () => {
    it('rend correctement avec toutes les données requises', () => {
      const props = {
        reservationCode: 'EZB-1234',
        productName: 'Poussette',
        userEmail: 'client@example.com',
        userPhone: '+33612345678',
        pickupDate: '15 juillet 2023 à 10:00',
        dropoffDate: '20 juillet 2023 à 14:00',
      };
      
      const html = render(<HotelNotificationEmail {...props} />);
      
      // Vérifier que l'email contient les informations essentielles
      expect(html).toContain('EZB-1234'); // Code de réservation
      expect(html).toContain('Poussette'); // Nom du produit
      expect(html).toContain('client@example.com'); // Email du client
      expect(html).toContain('+33612345678'); // Téléphone du client
      expect(html).toContain('15 juillet 2023 à 10:00'); // Date de retrait
      expect(html).toContain('20 juillet 2023 à 14:00'); // Date de retour
      expect(html).toContain('Des événements ont été ajoutés à votre calendrier'); // Mention des pièces jointes ICS
      expect(html).toContain('Pour toute réclamation (non-retour/casse)'); // Instructions pour les réclamations
    });
    
    it('affiche "Non fourni" si le téléphone n\'est pas fourni', () => {
      const props = {
        reservationCode: 'EZB-1234',
        productName: 'Poussette',
        userEmail: 'client@example.com',
        userPhone: 'Non fourni',
        pickupDate: '15 juillet 2023 à 10:00',
        dropoffDate: '20 juillet 2023 à 14:00',
      };
      
      const html = render(<HotelNotificationEmail {...props} />);
      
      // Vérifier que l'email indique que le téléphone n'est pas fourni
      expect(html).toContain('Non fourni');
    });
  });
});
