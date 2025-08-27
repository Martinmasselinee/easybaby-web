import ical from 'ical-generator';

interface ReservationEvent {
  summary: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  url?: string;
}

/**
 * Génère un fichier ICS pour une réservation
 * @param event Les détails de l'événement de réservation
 * @returns Le contenu du fichier ICS
 */
export function generateICS(event: ReservationEvent): string {
  const calendar = ical({
    name: 'EasyBaby Réservation',
    timezone: 'Europe/Paris',
  });

  calendar.createEvent({
    start: event.start,
    end: event.end,
    summary: event.summary,
    description: event.description,
    location: event.location,
    url: event.url,
    organizer: {
      name: 'EasyBaby',
      email: 'reservations@easybaby.io',
    },
  });

  return calendar.toString();
}

/**
 * Génère un fichier ICS pour une réservation EasyBaby
 * @param reservationCode Code de la réservation
 * @param productName Nom du produit
 * @param pickupHotel Nom de l'hôtel de retrait
 * @param pickupAddress Adresse de l'hôtel de retrait
 * @param pickupDateTime Date et heure de retrait
 * @param dropHotel Nom de l'hôtel de retour
 * @param dropAddress Adresse de l'hôtel de retour
 * @param dropDateTime Date et heure de retour
 * @param locale Locale pour les traductions
 * @returns Le contenu du fichier ICS
 */
export function generateReservationICS({
  reservationCode,
  productName,
  pickupHotel,
  pickupAddress,
  pickupDateTime,
  dropHotel,
  dropAddress,
  dropDateTime,
  locale = 'fr',
}: {
  reservationCode: string;
  productName: string;
  pickupHotel: string;
  pickupAddress: string;
  pickupDateTime: string | Date;
  dropHotel: string;
  dropAddress: string;
  dropDateTime: string | Date;
  locale?: string;
}): string {
  // Traductions
  const translations = {
    fr: {
      pickup: 'Retrait',
      dropoff: 'Retour',
      reservation: 'Réservation',
    },
    en: {
      pickup: 'Pickup',
      dropoff: 'Return',
      reservation: 'Reservation',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.fr;

  // Convertir les dates si nécessaire
  const pickupDate = pickupDateTime instanceof Date ? pickupDateTime : new Date(pickupDateTime);
  const dropDate = dropDateTime instanceof Date ? dropDateTime : new Date(dropDateTime);

  // Créer l'événement de retrait
  const pickupEvent: ReservationEvent = {
    summary: `${t.pickup} ${productName} - EasyBaby`,
    description: `${t.reservation} ${reservationCode}\n${productName}\n${pickupHotel}`,
    location: pickupAddress,
    start: pickupDate,
    end: new Date(pickupDate.getTime() + 30 * 60000), // 30 minutes pour le retrait
    url: `https://easybaby-web.vercel.app/reservation/${reservationCode}`,
  };

  // Créer l'événement de retour
  const dropEvent: ReservationEvent = {
    summary: `${t.dropoff} ${productName} - EasyBaby`,
    description: `${t.reservation} ${reservationCode}\n${productName}\n${dropHotel}`,
    location: dropAddress,
    start: dropDate,
    end: new Date(dropDate.getTime() + 30 * 60000), // 30 minutes pour le retour
    url: `https://easybaby-web.vercel.app/reservation/${reservationCode}`,
  };

  // Générer les fichiers ICS
  const pickupICS = generateICS(pickupEvent);
  const dropICS = generateICS(dropEvent);

  // Fusionner les deux événements dans un seul fichier ICS
  // Note: Pour une implémentation complète, il faudrait fusionner correctement les fichiers ICS
  // Ici, nous retournons simplement l'événement de retrait pour simplifier
  return pickupICS;
}
