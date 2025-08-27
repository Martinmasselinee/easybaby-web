import { Resend } from 'resend';
import { env } from '@/env.mjs';
import ical from 'ical-generator';

// Initialiser Resend avec la clé API
const resend = new Resend(env.RESEND_API_KEY);

// Fonction pour générer un fichier ICS
export function generateICS(options: {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description: string;
  location: string;
  organizer: { name: string; email: string };
  attendees?: { name: string; email: string }[];
}): string {
  const calendar = ical({
    name: 'EasyBaby',
    prodId: '//EasyBaby//FR',
  });

  const event = calendar.createEvent({
    uid: options.uid,
    start: options.start,
    end: options.end,
    summary: options.summary,
    description: options.description,
    location: options.location,
    organizer: options.organizer,
  });

  if (options.attendees && options.attendees.length > 0) {
    options.attendees.forEach((attendee) => {
      event.createAttendee({
        name: attendee.name,
        email: attendee.email,
        rsvp: true,
      });
    });
  }

  // Ajouter une alarme 1 heure avant
  event.createAlarm({
    type: 'display',
    triggerBefore: 60 * 60, // 1 heure en secondes
  });

  return calendar.toString();
}

// Fonction pour envoyer un email à l'utilisateur avec code de réservation
export async function sendUserConfirmationEmail(options: {
  to: string;
  reservationCode: string;
  productName: string;
  pickupHotel: string;
  pickupDate: Date;
  dropoffHotel: string;
  dropoffDate: Date;
  depositAmount: number;
  discountCode?: string;
}) {
  try {
    // Formatter les dates
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(date);
    };

    // Formatter le montant
    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(amount / 100);
    };

    // Envoyer l'email
    const { data, error } = await resend.emails.send({
      from: `EasyBaby <${env.SUPPORT_EMAIL || 'noreply@easybaby.io'}>`,
      to: options.to,
      subject: `Votre réservation EasyBaby — ${options.productName} — ${options.reservationCode}`,
      react: UserConfirmationEmailTemplate({
        reservationCode: options.reservationCode,
        productName: options.productName,
        pickupHotel: options.pickupHotel,
        pickupDate: formatDate(options.pickupDate),
        dropoffHotel: options.dropoffHotel,
        dropoffDate: formatDate(options.dropoffDate),
        depositAmount: formatAmount(options.depositAmount),
        discountCode: options.discountCode,
      }),
    });

    if (error) {
      console.error('Erreur lors de l\'envoi de l\'email à l\'utilisateur:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email à l\'utilisateur:', error);
    return { success: false, error };
  }
}

// Fonction pour envoyer un email à l'hôtel avec ICS
export async function sendHotelNotificationEmail(options: {
  to: string;
  hotelName: string;
  reservationCode: string;
  productName: string;
  userEmail: string;
  userPhone?: string;
  pickupDate: Date;
  dropoffDate: Date;
  hotelAddress: string;
}) {
  try {
    // Générer le fichier ICS pour le pickup
    const pickupICS = generateICS({
      uid: `${options.reservationCode}-pickup`,
      start: options.pickupDate,
      end: new Date(options.pickupDate.getTime() + 30 * 60 * 1000), // 30 minutes
      summary: `EasyBaby - Retrait ${options.productName} - ${options.reservationCode}`,
      description: `Réservation: ${options.reservationCode}\nProduit: ${options.productName}\nClient: ${options.userEmail} ${options.userPhone || ''}`,
      location: options.hotelAddress,
      organizer: { name: 'EasyBaby', email: env.SUPPORT_EMAIL || 'noreply@easybaby.io' },
      attendees: [{ name: options.hotelName, email: options.to }],
    });

    // Générer le fichier ICS pour le dropoff
    const dropoffICS = generateICS({
      uid: `${options.reservationCode}-dropoff`,
      start: options.dropoffDate,
      end: new Date(options.dropoffDate.getTime() + 30 * 60 * 1000), // 30 minutes
      summary: `EasyBaby - Retour ${options.productName} - ${options.reservationCode}`,
      description: `Réservation: ${options.reservationCode}\nProduit: ${options.productName}\nClient: ${options.userEmail} ${options.userPhone || ''}`,
      location: options.hotelAddress,
      organizer: { name: 'EasyBaby', email: env.SUPPORT_EMAIL || 'noreply@easybaby.io' },
      attendees: [{ name: options.hotelName, email: options.to }],
    });

    // Formatter les dates
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(date);
    };

    // Envoyer l'email
    const { data, error } = await resend.emails.send({
      from: `EasyBaby <${env.SUPPORT_EMAIL || 'noreply@easybaby.io'}>`,
      to: options.to,
      subject: `Nouvelle réservation EasyBaby — ${options.reservationCode}`,
      react: HotelNotificationEmailTemplate({
        reservationCode: options.reservationCode,
        productName: options.productName,
        userEmail: options.userEmail,
        userPhone: options.userPhone || 'Non fourni',
        pickupDate: formatDate(options.pickupDate),
        dropoffDate: formatDate(options.dropoffDate),
      }),
      attachments: [
        {
          filename: `easybaby-pickup-${options.reservationCode}.ics`,
          content: Buffer.from(pickupICS).toString('base64'),
        },
        {
          filename: `easybaby-dropoff-${options.reservationCode}.ics`,
          content: Buffer.from(dropoffICS).toString('base64'),
        },
      ],
    });

    if (error) {
      console.error('Erreur lors de l\'envoi de l\'email à l\'hôtel:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email à l\'hôtel:', error);
    return { success: false, error };
  }
}

import { render } from '@react-email/render';
import React from 'react';
import UserConfirmationEmail from '@/components/emails/user-confirmation-email';
import HotelNotificationEmail from '@/components/emails/hotel-notification-email';

// Types pour les templates d'emails
type UserConfirmationEmailProps = {
  reservationCode: string;
  productName: string;
  pickupHotel: string;
  pickupDate: string;
  dropoffHotel: string;
  dropoffDate: string;
  depositAmount: string;
  discountCode?: string;
};

type HotelNotificationEmailProps = {
  reservationCode: string;
  productName: string;
  userEmail: string;
  userPhone: string;
  pickupDate: string;
  dropoffDate: string;
};

// Templates d'emails
function UserConfirmationEmailTemplate(props: UserConfirmationEmailProps) {
  return render(<UserConfirmationEmail {...props} />);
}

function HotelNotificationEmailTemplate(props: HotelNotificationEmailProps) {
  return render(<HotelNotificationEmail {...props} />);
}
